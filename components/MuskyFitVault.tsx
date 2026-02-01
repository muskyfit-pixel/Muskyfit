
import React from 'react';
import { VaultArticle } from '../types';

const ARTICLES: VaultArticle[] = [
  { id: 'v1', title: 'The Lifestyle V-Taper Protocol', category: 'TRAINING', summary: 'Building the classic aesthetic frame while balancing a high-pressure professional life.', icon: '📐' },
  { id: 'v2', title: 'Longevity Nutrition: 30 & Beyond', category: 'LONGEVITY', summary: 'Managing inflammation and hormonal health through metabolic flexibility and nutrient timing.', icon: '🧬' },
  { id: 'v3', title: 'Bio-Hacking for Executives', category: 'BIO-HACKING', summary: 'How to optimize deep sleep and cognitive performance when your schedule is packed.', icon: '🧠' },
];

const MuskyFitVault: React.FC = () => {
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
         <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase metallic-text">The Vault</h2>
         <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px]">Elite MuskyFit Intelligence</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
         {ARTICLES.map(art => (
            <div key={art.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 hover:border-cyan-500 transition-all cursor-pointer group shadow-2xl">
               <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-slate-800 group-hover:cyan-glow transition-all">
                  {art.icon}
               </div>
               <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">{art.category}</span>
               <h3 className="text-xl font-black text-white italic mt-2 group-hover:text-cyan-400 transition">{art.title}</h3>
               <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">{art.summary}</p>
               <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Access Intelligence <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default MuskyFitVault;
