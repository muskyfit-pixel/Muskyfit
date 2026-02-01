
import React from 'react';
import { PersonalBest } from '../types';

interface StrengthMatrixProps {
  pbs: PersonalBest[];
}

const StrengthMatrix: React.FC<StrengthMatrixProps> = ({ pbs }) => {
  const defaultLifts = ['Bench Press', 'Squat', 'Deadlift', 'Shoulder Press'];
  
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40 px-4 animate-in fade-in duration-700">
      <div className="text-center">
         <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter metallic-text">Strength Matrix</h2>
         <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Personal Best Progression</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultLifts.map(lift => {
          const pb = pbs.find(p => p.exercise === lift);
          return (
            <div key={lift} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl group hover:border-cyan-500 transition-all">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase">{lift}</h3>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Main Compound</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-cyan-500">{pb?.weight || 0}<span className="text-xs ml-1">kg</span></p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Current Max</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest pb-2 border-b border-slate-800">
                    <span>Recent History</span>
                    <span>Date</span>
                  </div>
                  {(pb?.history || []).slice(-3).reverse().map((h, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                       <span className="text-sm font-bold text-slate-300 italic">{h.weight}kg</span>
                       <span className="text-[10px] text-slate-500 tabular-nums">{h.date}</span>
                    </div>
                  ))}
                  {(!pb || pb.history.length === 0) && (
                    <p className="text-[10px] text-slate-700 italic py-4 text-center">No lift data recorded for this movement.</p>
                  )}
               </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-950 p-8 rounded-[2rem] border border-slate-800 text-center">
         <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto italic">
           "Strength is the foundation of the V-Taper aesthetic. Focus on incremental progressive overload. If the weight stays the same, you stay the same."
         </p>
         <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-4">Coach Arjun</p>
      </div>
    </div>
  );
};

export default StrengthMatrix;
