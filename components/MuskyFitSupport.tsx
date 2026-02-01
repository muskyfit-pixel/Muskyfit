import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Client } from '../types';

interface MuskyFitSupportProps {
  client: Client;
}

const MuskyFitSupport: React.FC<MuskyFitSupportProps> = ({ client }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `You are the MUSKYFIT AI CONCIERGE. Boss: Arjun. Niche: High-performance for Asian professionals. Diet: Asian staples. Context: Client ${client.profile.name}, Goal: ${client.intake?.goal}.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages.map(m => m.text), input].join('\n'),
        config: { systemInstruction }
      });
      const aiMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: response.text || 'Thinking...', timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
       <div className="p-8 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center text-xl shadow-lg">🤖</div>
             <div><h3 className="text-xl font-black text-white italic uppercase tracking-tighter">AI Concierge</h3><p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Active 24/7</p></div>
          </div>
       </div>
       <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map(m => (
             <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm ${m.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-950 text-slate-300 border border-slate-800 rounded-tl-none'}`}>
                   {m.text}
                </div>
             </div>
          ))}
          {isTyping && <div className="text-xs text-slate-500 italic">Concierge is typing...</div>}
          <div ref={scrollRef} />
       </div>
       <div className="p-6 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-4">
             <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask about macros, training, or strategies..." className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500" />
             <button onClick={handleSend} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
             </button>
          </div>
       </div>
    </div>
  );
};

export default MuskyFitSupport;
