
import React from 'react';
import { DailyLog } from '../types';

interface ClientProgressSummaryProps {
  logs: DailyLog[];
}

const ClientProgressSummary: React.FC<ClientProgressSummaryProps> = ({ logs }) => {
  const recentLogs = [...logs].reverse().slice(-7);
  const maxSteps = Math.max(...recentLogs.map(l => l.steps), 10000);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 text-center italic">7-Day Biometric Adherence</h4>
        
        <div className="flex items-end justify-between gap-2 h-32 px-4">
          {recentLogs.map((log, i) => {
            const heightPercent = (log.steps / maxSteps) * 100;
            const isTargetHit = log.steps >= 10000;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="absolute -top-10 bg-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-all shadow-2xl border border-slate-800 pointer-events-none whitespace-nowrap z-10 scale-90 group-hover:scale-100">
                  {log.steps.toLocaleString()} steps
                </div>
                <div 
                  className={`w-full rounded-t-xl transition-all duration-1000 ${isTargetHit ? 'bg-cyan-500 cyan-glow shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-800'}`}
                  style={{ height: `${Math.max(heightPercent, 8)}%` }}
                />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mt-1">
                  {new Date(log.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-around">
           <div className="text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Avg Steps</p>
              <p className="text-xl font-black text-white">
                {Math.round(recentLogs.reduce((a, b) => a + b.steps, 0) / (recentLogs.length || 1)).toLocaleString()}
              </p>
           </div>
           <div className="text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Ritual Score</p>
              <p className="text-xl font-black text-cyan-500">94%</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProgressSummary;
