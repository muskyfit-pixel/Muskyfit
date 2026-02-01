
import React from 'react';
import { DailyLog } from '../types';

interface ClientProgressSummaryProps {
  logs: DailyLog[];
}

const ClientProgressSummary: React.FC<ClientProgressSummaryProps> = ({ logs }) => {
  const recentLogs = [...logs].reverse().slice(0, 7);
  const maxSteps = Math.max(...recentLogs.map(l => l.steps || 0), 10000);

  return (
    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 text-center italic">7-Day Biometric Adherence</h4>
      
      <div className="flex items-end justify-between gap-2 h-32 px-4">
        {recentLogs.map((log, i) => {
          const heightPercent = ((log.steps || 0) / maxSteps) * 100;
          const isTargetHit = (log.steps || 0) >= 10000;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div 
                className={`w-full rounded-t-xl transition-all duration-1000 ${isTargetHit ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-800'}`}
                style={{ height: `${Math.max(heightPercent, 10)}%` }}
              />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter mt-1">
                {new Date(log.date).toLocaleDateString('en-GB', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
        {recentLogs.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-slate-700 italic text-[10px] uppercase tracking-widest">
            Data Pending
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-around">
         <div className="text-center">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Avg Steps</p>
            <p className="text-xl font-black text-white">
              {recentLogs.length > 0 ? Math.round(recentLogs.reduce((a, b) => a + (b.steps || 0), 0) / recentLogs.length).toLocaleString() : '0'}
            </p>
         </div>
         <div className="text-center">
            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Ritual Score</p>
            <p className="text-xl font-black text-cyan-500">92%</p>
         </div>
      </div>
    </div>
  );
};

export default ClientProgressSummary;
