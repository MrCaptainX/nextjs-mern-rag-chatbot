
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import ChatMessage from '@/components/ChatMessage'; 
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane , faChevronLeft } from "@fortawesome/free-solid-svg-icons";



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
    <div className="bg-slate-100">
      <header className="fixed top-0 w-full bg-white p-4 border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 rounded-md hover:bg-slate-100 transition-colors"
            >
             <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5 text-slate-700" />

            </Link>
            <h1 className="text-xl font-semibold text-slate-800">{name}</h1>
          </div>
        </div>
      </header>

      <main className="min-h-screen p-4 pt-[100px] pb-[100px]">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} text={msg.text} />
          ))}
          {loading && <ChatMessage role="bot" text="Thinking..." />}
          <div ref={messagesEndRef}> </div>
        </div>
      </main>

      <div className="fixed bottom-0 w-full bg-white p-2 border-t border-slate-200">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1.5">
            <input
              value={input}
              ref={inputRef}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
              className="w-[95%] bg-transparent p-2 text-slate-800 placeholder-slate-500 focus:outline-none"
              disabled={loading}
            />
           <button
  onClick={sendMessage}
  disabled={loading || !input.trim()}
  className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
>
  <FontAwesomeIcon icon={faPaperPlane} className="w-6 h-6" />
</button>
          </div>
        </div>
      </div>
    </div>
  );
}