
import React from 'react';
import { PersonalBest } from '../types';

interface StrengthMatrixProps {
  pbs: PersonalBest[];
}

const StrengthMatrix: React.FC<StrengthMatrixProps> = ({ pbs }) => {
  const defaultLifts = ['Bench Press', 'Squat', 'Deadlift', 'Shoulder Press'];
  
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-40 px-4 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
         <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter metallic-text brand-font">Strength Matrix</h2>
         <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] italic">Peak Progression Protocol</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {defaultLifts.map(lift => {
          const pb = pbs.find(p => p.exercise === lift);
          return (
            <div key={lift} className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 shadow-2xl group hover:border-cyan-500/50 transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full -mr-12 -mt-12" />
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase brand-font tracking-tight">{lift}</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Foundational Compound</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-cyan-500 brand-font">{pb?.weight || 0}<span className="text-sm ml-1 opacity-50 font-normal">KG</span></p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">Current Limit</p>
                  </div>
               </div>

               <div className="space-y-4 relative z-10">
                  <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest pb-3 border-b border-white/5">
                    <span>Performance History</span>
                    <span>Verified Date</span>
                  </div>
                  <div className="space-y-2">
                    {(pb?.history || []).slice(-3).reverse().map((h, i) => (
                      <div key={i} className="flex justify-between items-center py-3 px-4 bg-slate-950/50 rounded-xl border border-transparent hover:border-white/5 transition-all">
                        <span className="text-sm font-bold text-slate-300 italic">{h.weight}kg</span>
                        <span className="text-[10px] text-slate-500 tabular-nums font-medium">{new Date(h.date).toLocaleDateString('en-GB')}</span>
                      </div>
                    ))}
                    {(!pb || pb.history.length === 0) && (
                      <p className="text-[10px] text-slate-700 italic py-6 text-center uppercase tracking-widest">Awaiting Initial Data</p>
                    )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/60 p-12 rounded-[3.5rem] border border-white/5 text-center backdrop-blur-md shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
         <p className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto italic font-medium relative z-10">
           "Strength is the fundamental currency of physical transformation. Every gram added to the bar is a step closer to the elite version of yourself. Consistency is non-negotiable."
         </p>
         <p className="text-[11px] font-black text-cyan-500 uppercase tracking-[0.5em] mt-8 relative z-10 italic">MUSKYFIT Head Coach</p>
      </div>
    </div>
  );
};

export default StrengthMatrix;
