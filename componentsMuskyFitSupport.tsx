
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

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Must use a named parameter and direct process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `
        You are the MUSKYFIT AI CONCIERGE.
        Your boss is Arjun (MuskyFit Master Coach).
        Niche: High-performance coaching for Asian male professionals.
        Rules:
        1. Answer diet questions focused on Asian staples (Basmati, Chapati, Dal, Paneer).
        2. Keep tone elite, direct, and encouraging but firm.
        3. If unsure about a medical issue, tell them to consult their doctor or wait for Arjun.
        4. Context: Client is ${client.profile.name}, Goal: ${client.intake?.goal}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages.map(m => m.text), input].join('\n'),
        config: { systemInstruction }
      });

      // text property access is correct for response string
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.text || 'Thinking...', timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-700">
       <div className="p-8 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center text-xl shadow-lg">🤖</div>
             <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">AI Concierge</h3>
                <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Active 24/7 Support</p>
             </div>
          </div>
          <span className="px-4 py-2 bg-green-500/10 text-green-500 text-[8px] font-black rounded-full uppercase tracking-widest">Encrypted</span>
       </div>

       <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                <span className="text-5xl">👋</span>
                <p className="text-white font-black italic text-xl uppercase tracking-tighter">How can I help you today?</p>
                <p className="text-xs text-slate-500 max-w-xs">Ask me about your macros, training form, or social eating strategies.</p>
             </div>
          )}
          {messages.map(m => (
             <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-950 text-slate-300 border border-slate-800 rounded-tl-none'}`}>
                   {m.text}
                </div>
             </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
                <div className="bg-slate-950 p-6 rounded-[2rem] rounded-tl-none border border-slate-800 flex gap-1">
                   <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75" />
                   <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150" />
                </div>
             </div>
          )}
          <div ref={scrollRef} />
       </div>

       <div className="p-6 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-4">
             <input 
               type="text" 
               value={input} 
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="Type your question..."
               className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500 transition-all shadow-inner"
             />
             <button onClick={handleSend} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all shadow-lg active:scale-95">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
             </button>
          </div>
       </div>
    </div>
  );
};

export default MuskyFitSupport;
