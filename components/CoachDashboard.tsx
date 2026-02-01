
import React, { useState } from 'react';
import { Client, WeeklyReview } from '../types';
import { analyzeWeeklyPerformanceDeep } from '../services/geminiService';
import { User, Activity, Brain, Target, ArrowRight, Loader2, Sparkles, Zap } from 'lucide-react';

interface CoachDashboardProps {
  clients: Client[];
  pendingClient: Client | null;
  onFinalise: (id: string, overrides: any) => void;
  onSendReview: (clientId: string, review: WeeklyReview) => void;
  isLoading: boolean;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ clients, pendingClient, onFinalise, onSendReview, isLoading }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'DEEP_DIVE'>('OVERVIEW');
  const [generatedReview, setGeneratedReview] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleAnalyzePerformance = async () => {
    if (!selectedClient || selectedClient.checkIns.length === 0) return;
    setIsAnalyzing(true);
    try {
      const review = await analyzeWeeklyPerformanceDeep(selectedClient.logs, selectedClient.checkIns[0]);
      setGeneratedReview(review);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="flex justify-between items-end px-4">
        <div>
          <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Command Center</h2>
          <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Elite Analytics & Deployment</p>
        </div>
        {viewMode === 'DEEP_DIVE' && (
          <button onClick={() => { setViewMode('OVERVIEW'); setGeneratedReview(null); }} className="bg-slate-900 px-6 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-slate-800 hover:bg-slate-800 transition">
            Overview
          </button>
        )}
      </div>

      {viewMode === 'OVERVIEW' ? (
        <div className="grid md:grid-cols-3 gap-6 px-4">
           {pendingClient && (
             <div className="bg-cyan-950/10 border border-cyan-500/20 p-10 rounded-[3rem] flex items-center justify-between col-span-full mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition duration-1000">
                   <Zap size={140} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Sparkles className="text-cyan-500" size={20} />
                    <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">New Prospect Intake</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                    {pendingClient.profile.name} • {pendingClient.intake?.gender} • {pendingClient.intake?.goal.replace('_', ' ')}
                  </p>
                </div>
                <button 
                  onClick={() => onFinalise(pendingClient.id, {})} 
                  disabled={isLoading}
                  className="relative z-10 bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:opacity-30 border-b-4 border-slate-300"
                >
                  {isLoading ? 'Deploying...' : 'Deploy Protocol'}
                </button>
             </div>
           )}

           {clients.filter(c => c.planStatus === 'PLAN_READY').map(client => (
             <div key={client.id} onClick={() => { setSelectedClientId(client.id); setViewMode('DEEP_DIVE'); }} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 cursor-pointer hover:border-cyan-500 transition group relative shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={client.profile.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{client.profile.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${client.performanceStatus === 'ON_TRACK' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{client.performanceStatus}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Avg Steps</p>
                      <p className="text-sm font-black text-white italic">{(client.logs.reduce((a,b)=>a+b.steps,0)/(client.logs.length||1)).toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Ritual Score</p>
                      <p className="text-sm font-black text-cyan-500 italic">94%</p>
                   </div>
                </div>
                <div className="absolute bottom-8 right-8 text-slate-700 group-hover:text-cyan-500 transition-colors">
                  <ArrowRight size={24} />
                </div>
             </div>
           ))}

           {clients.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-900/40 rounded-[3rem] border border-slate-800 border-dashed">
                 <p className="text-slate-500 italic font-medium">No active clients in the pipeline.</p>
              </div>
           )}
        </div>
      ) : (
        selectedClient && (
          <div className="grid lg:grid-cols-12 gap-8 px-4 animate-in slide-in-from-right-4 duration-500 pb-20">
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 text-center shadow-2xl">
                  <div className="w-32 h-32 rounded-3xl mx-auto mb-8 border-4 border-slate-950 shadow-2xl overflow-hidden relative group">
                    <img src={selectedClient.profile.avatar} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="" />
                    <div className="absolute inset-0 bg-cyan-600/10 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">{selectedClient.profile.name}</h3>
                  <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-10">{selectedClient.intake?.gender} Professional</p>
                  
                  <div className="pt-8 border-t border-slate-800 flex justify-center gap-10 text-center">
                     <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Goal</p>
                        <p className="text-xs font-black text-cyan-500 uppercase">{selectedClient.intake?.goal.split('_')[0]}</p>
                     </div>
                     <div className="w-px h-10 bg-slate-800" />
                     <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Status</p>
                        <p className={`text-xs font-black ${selectedClient.performanceStatus === 'ON_TRACK' ? 'text-green-500' : 'text-red-500'}`}>
                          {selectedClient.performanceStatus === 'ON_TRACK' ? 'ELITE' : 'CRITICAL'}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <Activity size={18} className="text-cyan-500" />
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Biometric Stats</h4>
                  </div>
                  {selectedClient.checkIns[0] ? (
                    <div className="space-y-8">
                      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 italic text-xs text-slate-400 leading-relaxed">
                        "{selectedClient.checkIns[0].clientComments}"
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                          <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Sleep Avg</p>
                          <p className="text-lg font-black text-white italic">{selectedClient.checkIns[0].sleepHours}h</p>
                        </div>
                        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
                          <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Stress</p>
                          <p className="text-lg font-black text-red-500 italic">{selectedClient.checkIns[0].stressLevel}/10</p>
                        </div>
                      </div>
                    </div>
                  ) : <p className="text-xs italic text-slate-600 text-center py-10">Pending initial check-in.</p>}
               </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
               <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                     <div className="flex items-center gap-4">
                        <Brain size={24} className="text-cyan-500" />
                        <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">AI Thinking Matrix</h4>
                     </div>
                     <button 
                        onClick={handleAnalyzePerformance} 
                        disabled={isAnalyzing || selectedClient.checkIns.length === 0} 
                        className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-xl shadow-2xl hover:bg-cyan-500 hover:text-white transition-all active:scale-95 disabled:opacity-20 flex items-center gap-3 border-b-4 border-slate-300"
                     >
                        {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isAnalyzing ? 'SYNTHESIZING...' : 'SYNTHESIZE REVIEW'}
                     </button>
                  </div>

                  {generatedReview ? (
                    <div className="space-y-10 animate-in zoom-in-95 duration-500">
                      <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 relative">
                        <div className="flex justify-between items-start mb-10">
                          <div>
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">Weekly Adherence Score</p>
                            <p className="text-6xl font-black text-white italic tracking-tighter">{generatedReview.adherenceScore}%</p>
                          </div>
                          <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${generatedReview.status === 'GREEN' ? 'bg-green-600/10 border-green-500/30 text-green-400' : 'bg-red-600/10 border-red-500/30 text-red-400'}`}>
                            {generatedReview.status} PROTOCOL
                          </div>
                        </div>
                        <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 mb-10 italic text-slate-300 leading-relaxed text-sm">
                          "{generatedReview.coachMessage}"
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                          {generatedReview.directives.map((d: string, i: number) => (
                            <div key={i} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-[11px] text-white font-bold italic leading-relaxed group hover:border-cyan-500 transition-all">
                              <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:bg-cyan-600 transition">
                                <Target size={14} className="text-cyan-500 group-hover:text-white" />
                              </div>
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          onSendReview(selectedClient.id, generatedReview);
                          setGeneratedReview(null);
                        }} 
                        className="w-full py-6 bg-cyan-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-cyan-500 transition-all italic border-4 border-slate-900"
                      >
                        PUBLISH STRATEGY BRIEF
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950 py-32 rounded-[3rem] border border-slate-800 text-center italic text-slate-700 text-sm">
                      Select 'Synthesize Review' to run high-budget thinking on client biometrics.
                    </div>
                  )}
               </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CoachDashboard;
