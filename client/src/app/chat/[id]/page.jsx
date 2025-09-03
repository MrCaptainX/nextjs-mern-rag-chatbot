
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ChatMessage from '@/components/ChatMessage'; 

export default function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null); 
  const inputRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function fetchData() {
      try {

        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chat` || "http://localhost:5000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: id }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert(errorData.error || "Session not found");
          return;
        }

        const data = await res.json();
        setName(data.name);
        setMessages(data.chats);
      } catch (error) {
        console.error("Failed:", error);
        alert("no conn.");
      }
    }
    fetchData();
  }, [id]);


  useEffect(() => {
    scrollToBottom();
     if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/ask` || "http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          sessionId: id,
        }),
      });

      const data = await res.json();
      const botMessage = { role: 'bot', text: data.answer || 'No response.' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <header className="bg-white p-4 border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-slate-800">{name}</h1>
          <button
            onClick={() => setMessages([])}
            className='px-3 py-1.5 text-sm font-medium hover:text-slate-600 bg-blue-400 text-white rounded-lg hover:bg-slate-100 transition-colors'
          >
            Clear Chat
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} text={msg.text} />
          ))}
          {loading && <ChatMessage role="bot" text="Thinking..." />}
          <div ref={messagesEndRef} > </div>
        </div>
      </main>

      <div className="bg-white p-4 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center bg-slate-100 rounded-lg p-1.5">
            <input
              value={input}
              ref={inputRef}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask something..."
              className="flex-grow bg-transparent p-2 text-slate-800 placeholder-slate-500 focus:outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}