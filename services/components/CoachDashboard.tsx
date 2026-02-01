
import React, { useState } from 'react';
import { Client, DailyLog, ExerciseLog, WeeklyCheckIn } from '../types';
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

  const triageList = clients.filter(c => {
    const lastLog = c.logs?.[0];
    const daysSinceLog = lastLog ? (Date.now() - new Date(lastLog.date).getTime()) / (1000 * 3600 * 24) : 99;
    return (c.checkIns?.[0]?.stressLevel >= 8) || daysSinceLog > 2;
  });

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
          <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">MuskyFit Elite Protocol Management</p>
        </div>
        {viewMode === 'DEEP_DIVE' && (
          <button onClick={() => setViewMode('OVERVIEW')} className="bg-slate-900 px-6 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-slate-800 hover:bg-slate-800 transition">
            Close Deep Dive
          </button>
        )}
      </div>

      {viewMode === 'OVERVIEW' ? (
        <>
          <div className="grid lg:grid-cols-2 gap-8 mx-4 md:mx-0">
             {triageList.length > 0 && (
               <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-[2.5rem] animate-pulse">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" /> Triage Alerts (Attention Required)
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {triageList.map(c => (
                      <div key={c.id} onClick={() => { setSelectedClientId(c.id); setViewMode('DEEP_DIVE'); }} className="px-4 py-3 bg-slate-900 rounded-xl border border-red-500/10 cursor-pointer hover:bg-slate-800 transition">
                        <p className="text-xs font-black text-white">{c.profile.name}</p>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             {pendingClient && (
               <div className="bg-cyan-950/10 border border-cyan-500/20 p-8 rounded-[2.5rem] flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-black italic uppercase">Awaiting Protocol</h3>
                    <p className="text-xs text-slate-400">{pendingClient.profile.name} - Profile Loaded</p>
                  </div>
                  <button onClick={() => onFinalise(pendingClient.id, {})} className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 transition">Analyze & Deploy</button>
               </div>
             )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 px-4 md:px-0">
             {clients.map(client => (
               <div key={client.id} onClick={() => { setSelectedClientId(client.id); setViewMode('DEEP_DIVE'); }} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 cursor-pointer hover:border-cyan-500 transition group relative overflow-hidden">
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
                        <p className="text-xs font-black text-white">ON TRACK</p>
                     </div>
                     <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Rituals</p>
                        <p className="text-xs font-black text-cyan-400">95%</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </>
      ) : (
        selectedClient && (
          <div className="grid lg:grid-cols-12 gap-8 px-4 md:px-0 animate-in slide-in-from-right-4 duration-500">
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center">
                  <img src={selectedClient.profile.avatar} className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-slate-950 shadow-2xl" alt="" />
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedClient.profile.name}</h3>
                  <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center gap-8">
                     <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Shoulders</p>
                        <p className="text-xl font-black text-white">48"</p>
                     </div>
                     <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Waist</p>
                        <p className="text-xl font-black text-cyan-500">32"</p>
                     </div>
                  </div>
                  <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-6 italic">Target Ratio: 1.618 (Golden Ratio)</p>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                  <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-6 italic">Visual Proof History</h4>
                  <div className="grid grid-cols-2 gap-4">
                     {selectedClient.photos.slice(-2).map((p, i) => (
                        <div key={i} className="aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                           <img src={p.url} className="w-full h-full object-cover" alt="" />
                        </div>
                     ))}
                     {selectedClient.photos.length === 0 && <p className="col-span-2 text-[10px] text-slate-700 italic text-center py-10 uppercase tracking-widest">Awaiting Uploads</p>}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
               <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">AI Deep Analysis</h4>
                     <button onClick={handleGenerateReport} disabled={isReporting} className="px-6 py-2 bg-white text-black text-[9px] font-black uppercase rounded-lg shadow-lg hover:bg-cyan-500 transition-all active:scale-95">
                        {isReporting ? 'Processing...' : 'Sync Intelligence'}
                     </button>
                  </div>
                  <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 min-h-[150px] text-sm text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                     {generatedReport || "Sync Intelligence to analyze 7-day compliance and metabolic response."}
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="px-8 py-6 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Compliance Audit</h4>
                     <span className="text-[8px] text-slate-500 uppercase">Recent Metrics</span>
                  </div>
                  <div className="p-4 space-y-3">
                     {selectedClient.logs.slice(0, 5).map((log, i) => (
                        <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-cyan-500/30 transition-all">
                           <div>
                              <p className="text-xs font-black text-white">{log.date}</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">{log.workoutCompleted ? '⚔️ Protocol Executed' : '🌙 Recovery Phase'}</p>
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
