
import React, { useState } from 'react';
import { findEliteResources } from '../services/geminiService';

const ResourceRadar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ text: string, sources: any[] } | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await findEliteResources(query, pos.coords.latitude, pos.coords.longitude);
        setResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, () => {
      alert("Location access denied. Please enable to use Radar.");
      setIsSearching(false);
    });
  };

  const categories = [
    { label: 'Asian Groceries', icon: '🌶️', q: 'high protein indian grocery stores' },
    { label: 'Elite Gyms', icon: '⚔️', q: 'bodybuilding gyms with squat racks' },
    { label: 'Wellness', icon: '🧖', q: 'recovery spa and sauna' },
    { label: 'Steakhouse', icon: '🥩', q: 'quality steak restaurants' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 px-4 animate-in fade-in duration-700">
      <div className="text-center">
         <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter metallic-text">Resource Radar</h2>
         <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Local Elite Intelligence</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {categories.map(cat => (
           <button 
             key={cat.label} 
             onClick={() => { setQuery(cat.q); handleSearch(); }}
             disabled={isSearching}
             className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 hover:border-cyan-500 transition-all group text-center disabled:opacity-50"
           >
              <span className="text-2xl block mb-2">{cat.icon}</span>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition">{cat.label}</p>
           </button>
         ))}
      </div>

      <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl">
         <div className="flex gap-4 mb-8">
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Find specialized grocers or gyms..." 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500"
            />
            <button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim()}
              className="px-8 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-xl disabled:opacity-20"
            >
              {isSearching ? '📡' : 'Scan'}
            </button>
         </div>

         {results && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="prose prose-invert max-w-none">
                 <p className="text-sm text-slate-300 leading-relaxed italic">"{results.text}"</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                 {results.sources.map((chunk, i) => {
                   const maps = chunk.maps;
                   if (!maps) return null;
                   return (
                     <a 
                       key={i} 
                       href={maps.uri} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="p-6 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-green-500 transition-all group"
                     >
                        <div>
                           <p className="text-xs font-black text-white italic">{maps.title}</p>
                           <p className="text-[8px] text-slate-500 uppercase font-black mt-1">Location Verified</p>
                        </div>
                        <span className="text-xl group-hover:translate-x-1 transition-transform">📍</span>
                     </a>
                   );
                 })}
              </div>
           </div>
         )}
         {!results && !isSearching && (
           <div className="py-12 text-center">
              <p className="text-xs text-slate-600 italic">Enter a specific query or use the quick scans above to find resources in your current area.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default ResourceRadar;
