
import React from 'react';

interface ReadinessHUDProps {
  score: number;
  sleep: number;
  stress: string;
}

const ReadinessHUD: React.FC<ReadinessHUDProps> = ({ score, sleep, stress }) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-cyan-400';
    if (s >= 60) return 'text-amber-400';
    return 'text-rose-500';
  };

  const getGlowColor = (s: number) => {
    if (s >= 80) return 'rgba(34, 211, 238, 0.2)';
    if (s >= 60) return 'rgba(251, 191, 36, 0.1)';
    return 'rgba(244, 63, 94, 0.1)';
  };

  return (
    <div className="bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-2xl backdrop-blur-md relative overflow-hidden group">
       <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-all duration-700" />
       
       <div className="flex items-center gap-8 relative z-10">
          <div className="relative w-24 h-24 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-950" />
                <circle 
                  cx="48" cy="48" r="42" 
                  stroke="currentColor" strokeWidth="4" 
                  fill="transparent" 
                  strokeLinecap="round"
                  className={`${getScoreColor(score)} transition-all duration-1000 ease-out`} 
                  strokeDasharray={2 * Math.PI * 42} 
                  strokeDashoffset={2 * Math.PI * 42 * (1 - score / 100)} 
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-white brand-font leading-none">{score}</p>
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Ready</p>
             </div>
          </div>
          
          <div className="space-y-1">
             <p className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em] italic mb-1">Status Report</p>
             <h4 className="text-xl font-black text-white italic uppercase tracking-tighter brand-font">
                {score >= 85 ? 'Peak State' : score >= 70 ? 'Operational' : 'Recovery Focus'}
             </h4>
             <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-600 uppercase">Sleep Cycle</span>
                  <span className="text-xs font-bold text-slate-300">{sleep}h / 8h</span>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-600 uppercase">Load Index</span>
                  <span className={`text-xs font-bold ${stress === 'Low' ? 'text-green-400' : stress === 'Moderate' ? 'text-amber-400' : 'text-rose-400'}`}>{stress}</span>
                </div>
             </div>
          </div>
       </div>

       <div className="hidden md:flex flex-col items-end gap-2">
          <div className="px-4 py-1.5 bg-slate-950 rounded-full border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Biometric Sync</span>
          </div>
          <p className="text-[9px] font-bold text-slate-600 italic">Updated real-time</p>
       </div>
    </div>
  );
};

export default ReadinessHUD;
