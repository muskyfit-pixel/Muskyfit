
import React, { useState, useRef, useEffect } from 'react';
import { groundedConciergeChat } from '../services/geminiService';
import { ChatMessage, Client } from '../types';

interface MuskyFitSupportProps {
  client: Client;
}

const MuskyFitSupport: React.FC<MuskyFitSupportProps> = ({ client }) => {
  const [messages, setMessages] = useState<(ChatMessage & { sources?: any[] })[]>([]);
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
      const context = `Boss: Arjun. Niche: Asian Professionals. Client: ${client.profile.name}. Goal: ${client.intake?.goal}. History: ${messages.slice(-5).map(m => m.text).join(' ')}`;
      const { text, sources } = await groundedConciergeChat(input, context);
      
      const aiMsg: ChatMessage & { sources?: any[] } = { 
        id: Date.now().toString(), 
        role: 'model', 
        text, 
        timestamp: Date.now(),
        sources 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) { 
      console.error(e); 
      setMessages(prev => [...prev, { id: 'err', role: 'model', text: "Support systems temporarily offline. Please try again.", timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
       <div className="p-8 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center text-xl shadow-lg">🤖</div>
             <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">AI Concierge</h3>
                <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Grounded Intelligence Active</p>
             </div>
          </div>
       </div>
       <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map(m => (
             <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg' : 'bg-slate-950 text-slate-300 border border-slate-800 rounded-tl-none'}`}>
                   {m.text}
                   
                   {m.sources && m.sources.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Intelligence Sources</p>
                        <div className="flex flex-wrap gap-2">
                           {m.sources.map((chunk, i) => {
                             const web = chunk.web;
                             const maps = chunk.maps;
                             if (web) return (
                               <a key={i} href={web.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-slate-900 text-[10px] text-cyan-400 font-bold border border-slate-800 rounded-lg hover:border-cyan-500 transition-colors">
                                 {web.title || "Source"}
                               </a>
                             );
                             if (maps) return (
                               <a key={i} href={maps.uri} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-slate-900 text-[10px] text-green-400 font-bold border border-slate-800 rounded-lg hover:border-green-500 transition-colors">
                                 📍 {maps.title || "Location"}
                               </a>
                             );
                             return null;
                           })}
                        </div>
                     </div>
                   )}
                </div>
             </div>
          ))}
          {isTyping && (
             <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Concierge is searching the web...</span>
             </div>
          )}
          <div ref={scrollRef} />
       </div>
       <div className="p-6 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-4">
             <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Search supplements, studies, or find nearby gyms..." className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500 placeholder:text-slate-700" />
             <button onClick={handleSend} className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all shadow-xl group">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
             </button>
          </div>
       </div>
    </div>
  );
};

export default MuskyFitSupport;
