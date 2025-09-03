"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateBot from "@/components/createBot";


export default function Page() {
  const [chats, setChats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/chats` || "http://localhost:5000/chats");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setChats(data);
      } catch (err) {
        setError("Failed to fetch chats. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const handleNewChat = (data) => {
    setChats((prev) => ({
      ...prev,
      [data.sessionId]: { name: data.name, messages: data.messages },
    }));
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const truncateText = (text = "", length = 40) =>
    text.length > length ? `${text.substring(0, length)}...` : text;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CreateBot state={isModalOpen} close={toggleModal} whenDone={handleNewChat} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">All Chats</h1>
          {Object.keys(chats).length > 0 && (
            <button
              onClick={toggleModal}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700  shadow-sm"
            >
             
              Create ChatBot
            </button>
          )}
        </header>

        {loading && <p className="text-center text-slate-500">Loading chats...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          Object.keys(chats).length === 0 ? (
            <div className="text-center py-20 px-6 bg-white rounded-xl shadow-sm">
              
              <h3 className="mt-4 text-xl font-semibold text-slate-800">No chats</h3>
              <p className="mt-2 text-slate-500">create new conversation.</p>
              <button onClick={toggleModal} className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm">
                Create
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(chats).map(([sessionId, data]) => (
                <div key={sessionId} onClick={() => router.push(`/chat/${sessionId}`)} className="group bg-white rounded-xl shadow-sm p-5 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                     <span className="text-xs text-slate-400 group-hover:text-blue-500">
                        {data.messages?.length || 0} messages
                      </span>
                    </div>
                    <h2 className="font-semibold text-lg text-slate-800 mt-4">{data.name}</h2>
                    <p className="text-sm text-slate-500 mt-2 h-10">
                      {truncateText(data.messages?.[data.messages.length - 1]?.text)}
                    </p>
                  </div>
                  <div className="mt-4 text-right">
                    <span className="text-sm font-medium text-blue-600">
                      Open Chat &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

