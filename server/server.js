const express = require("express");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");
const axios = require("axios");
const cosineSimilarity = require('compute-cosine-similarity');

dotenv.config();



const app = express();
const port = process.env.PORT || 5000 

app.use(cors());
app.use(express.json());


const chats = {};
const botDetails = {};
const contexts = {};


async function gemEmb(text) {
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        model: 'models/gemini-embedding-exp-03-07',
        content: { parts: [{ text }] },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data.embedding?.values || null;
  } catch (err) {
    console.error('[Embedding Error]', err.response?.data || err.message);
    return null;
  }
}

function searchDt(questionVec, chunkVecs, chunks, k = 3) {
  const scored = chunkVecs.map((vec, index) => {
    const score = cosineSimilarity(questionVec, vec);
    return { index, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(({ index, score }) => ({
    chunk: chunks[index],
    score,
  }));
}


async function init(id,name,context) {
  const words = context.split(/\s+/);

  const chunks = [];
  for (let i = 0; i < words.length; i += 80) {
    chunks.push(words.slice(i, i + 80).join(' '));
  }

  var chunkVecs = [];
  for (const chunk of chunks) {
    const vec = await gemEmb(chunk);
    if (vec) chunkVecs.push(vec);
  }
  
  botDetails[id] = {name,chunkVecs,chunks}
  contexts[id] = context;

}

async function askGemini(question, botName, contextChunks = [], sessionHistory = []) {
  try {
    const systemPrompt = {
      role: "user",
      parts: [{
        text: `
You are ${botName}, the expert assistant representing the business. Speak confidently and naturally as if you are the owner or trusted assistant. Follow these rules:

1. Provide accurate, helpful, and professional answers using ONLY the information in the provided context.
2. If the context is insufficient, answer politely, clearly, and with intelligence, without making up information.
3. Keep answers friendly, approachable, and conversational, but professional.
4. Reference relevant sections of the context when applicable, as if explaining directly to the user.
5. Break down complex answers into structured, logical parts to make them easy to understand.
6. Demonstrate knowledge, competence, and attention to detail in all responses.
7. Avoid generic filler or vague responses. Your tone should reflect expertise and authority in the business domain.
8. Do not use markdown formatting. Write naturally in complete sentences.
9. Ensure responses are engaging, helpful, and personalized whenever possible.
10. Do not display the source tags ([Source 1], etc.) in your response. Use the information as context only.
    `.trim()
      }]
    };

    const contents = [systemPrompt];

   if (contextChunks && contextChunks.length > 0) {
  const contextText = contextChunks
    .filter(c => c && c.chunk)
    .map((c, i) => `[Source ${i+1}] ${c.chunk.trim()}`)
    .join("\n\n");

  if (contextText) {
    contents.push({
      role: "user",
      parts: [{ text: `RELEVANT KNOWLEDGE BASE:\n${contextText}` }]
    });
  }
}

    if (sessionHistory.length > 0) {
      const recentHistory = sessionHistory.slice(-12);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }

    const enhancedQuestion = contextChunks.length > 0
      ? `${question}\n\n(Please base your response primarily on the provided knowledge base when relevant.)`
      : question;

    contents.push({
      role: "user",
      parts: [{ text: enhancedQuestion }]
    });

    const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      contents,
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });
    
  //  console.log(res.data)
    const responseText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "I dont know";

    return responseText;

  } catch (error) {
    console.error("err:", error?.response?.data || error.message);
    return "SOrry";
  }
}



function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

app.get("/chats", (req, res) => {
  const combined = Object.fromEntries(
    Object.keys(chats).map(key => [
      key,
      { name: botDetails[key]?.name || "Unknown", messages: chats[key] }
    ])
  );

  console.log(combined)

  res.json(combined);
});


app.post("/chat", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId, !botDetails[sessionId] || !chats[sessionId]) {
  return res.status(404).json({ error: "Session not found" });
}
res.json({ name: botDetails[sessionId].name, chats: chats[sessionId] });
});

app.post("/chats/new", async (req, res) => {
  const { name, context } = req.body;
  const sessionId = generateSessionId();
  await init(sessionId,name,context)
  chats[sessionId] = [];
  res.json({ name,sessionId, messages: [] });
});

app.post("/ask", async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    if (!question || !sessionId) {
      return res.status(400).json({ error: "Send Both pls." });
    }

    if (!chats[sessionId]) chats[sessionId] = [];

    const queryVec = await gemEmb(question);
    if (!queryVec) return res.status(500).json({ error: "Failed." });

    const topChunks = searchDt(queryVec, botDetails[sessionId].chunkVecs, botDetails[sessionId].chunks, 3);

    const answer = await askGemini(question,botDetails[sessionId].name,topChunks, chats[sessionId]);

    chats[sessionId].push({ role: "user", text: question });
    chats[sessionId].push({ role: "assistant", text: answer });

    res.json({ answer });
  } catch (err) {
    console.error("ero:", err);
    res.status(500).json({ error: "eRR" });
  }
});


app.listen(port, async () => {
  console.log(`running http://localhost:${port}`);
});
