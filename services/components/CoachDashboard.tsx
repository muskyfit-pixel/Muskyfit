
import React, { useState } from 'react';
import { Client, WeeklyCheckIn } from '../types';
import { generatePerformanceReport } from '../services/geminiService';

interface CoachDashboardProps {
  clients: Client[];
  pendingClient: Client | null;
  onFinalise: (id: string, overrides: any) => void;
  isLoading: boolean;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ clients, pendingClient, onFinalise, isLoading }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'DEEP_DIVE'>('OVERVIEW');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleGenerateReport = async () => {
    if (!selectedClient) return;
    setIsReporting(true);
    const mockCheckIn: WeeklyCheckIn = selectedClient.checkIns?.[0] || {
      date: new Date().toISOString(),
      energyLevel: 8,
      stressLevel: 4,
      sleepHours: 7,
      digestionStatus: 'Normal',
      clientComments: 'Active and consistent.'
    };
    const report = await generatePerformanceReport(selectedClient.profile.name, selectedClient.logs, mockCheckIn);
    setGeneratedReport(report);
    setIsReporting(false);
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-4 md:px-0">
        <div>
          <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Command Center</h2>
          <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Elite Analytics & Deployment</p>
        </div>
        {viewMode === 'DEEP_DIVE' && (
          <button onClick={() => setViewMode('OVERVIEW')} className="bg-slate-900 px-6 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-slate-800 hover:bg-slate-800 transition">
            Close Deep Dive
          </button>
        )}
      </div>

      {viewMode === 'OVERVIEW' ? (
        <div className="grid md:grid-cols-3 gap-6 px-4 md:px-0">
           {pendingClient && (
             <div className="bg-cyan-950/10 border border-cyan-500/20 p-8 rounded-[2.5rem] flex items-center justify-between col-span-full mb-8">
                <div>
                  <h3 className="text-white font-black italic uppercase">New Prospect Pending</h3>
                  <p className="text-xs text-slate-400">{pendingClient.profile.name} - Ready for Protocol Deployment</p>
                </div>
                <button onClick={() => onFinalise(pendingClient.id, {})} className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 transition">Build Bespoke Plan</button>
             </div>
           )}

           {clients.map(client => (
             <div key={client.id} onClick={() => { setSelectedClientId(client.id); setViewMode('DEEP_DIVE'); }} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 cursor-pointer hover:border-cyan-500 transition group relative">
                <div className="flex items-center gap-4 mb-6">
                  <img src={client.profile.avatar} className="w-12 h-12 rounded-full border border-slate-700" alt="" />
                  <div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{client.profile.name}</h4>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Protocol Active</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Status</p>
                      <p className="text-xs font-black text-green-400">ON TRACK</p>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Rituals</p>
                      <p className="text-xs font-black text-cyan-400">92%</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        selectedClient && (
          <div className="grid lg:grid-cols-12 gap-8 px-4 md:px-0 animate-in slide-in-from-right-4 duration-500">
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center">
                  <img src={selectedClient.profile.avatar} className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-slate-950 shadow-2xl" alt="" />
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedClient.profile.name}</h3>
                  <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center gap-8 text-center">
                     <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Weight</p>
                        <p className="text-xl font-black text-white">{selectedClient.intake?.weight}kg</p>
                     </div>
                     <div className="w-px h-10 bg-slate-800" />
                     <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Goal</p>
                        <p className="text-xl font-black text-cyan-500">{selectedClient.intake?.goal.split('_')[0]}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                  <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-6 italic">Ritual Adherence</h4>
                  <div className="space-y-4">
                     {selectedClient.logs[0]?.rituals ? Object.entries(selectedClient.logs[0].rituals).map(([habit, val]) => (
                        <div key={habit} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <span>{habit.replace(/([A-Z])/g, ' $1')}</span>
                           <span className={val ? 'text-green-500' : 'text-red-500'}>{val ? 'DONE' : 'MISSED'}</span>
                        </div>
                     )) : <p className="text-xs italic text-slate-600">No ritual data logged for today.</p>}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
               <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">AI Performance Synthesis</h4>
                     <button onClick={handleGenerateReport} disabled={isReporting} className="px-6 py-2 bg-white text-black text-[9px] font-black uppercase rounded-lg shadow-lg hover:bg-cyan-500 transition-all active:scale-95">
                        {isReporting ? 'Analyzing...' : 'Generate AI Intel'}
                     </button>
                  </div>
                  <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 min-h-[150px] text-sm text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                     {generatedReport || "Click 'Generate' to run deep analysis on compliance, stress, and biometric response."}
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="px-8 py-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Biometric Audit</h4>
                  </div>
                  <div className="p-4 space-y-3">
                     {selectedClient.logs.slice(0, 5).map((log, i) => (
                        <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-cyan-500/30 transition-all">
                           <div>
                              <p className="text-xs font-black text-white">{log.date}</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">{log.workoutCompleted ? '⚔️ Trained' : '🌙 Rest'}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-black text-cyan-500">{log.caloriesConsumed} kcal</p>
                              <p className="text-[8px] text-slate-600 font-bold uppercase">{log.steps.toLocaleString()} Steps</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CoachDashboard;
