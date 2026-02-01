
import React from 'react';
import { Client, WeeklyReview } from '../types';

interface CoachDashboardProps {
  clients: Client[];
  pendingClient: Client | null;
  onFinalise: (id: string, overrides: any) => void;
  onSendReview: (clientId: string, review: WeeklyReview) => void;
  isLoading: boolean;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ clients, pendingClient, onFinalise, onSendReview, isLoading }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white italic uppercase tracking-tight">Coach Centre</h2>
          <p className="text-sm text-slate-500">Managing your UK-based athletes.</p>
        </div>
      </div>
      
      {pendingClient && (
        <div className="bg-cyan-950/20 border border-cyan-500/30 p-8 rounded-3xl flex justify-between items-center shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white">New Application: {pendingClient.profile.name}</h3>
            <p className="text-sm text-slate-400">Waiting for programme deployment.</p>
          </div>
          <button 
            onClick={() => onFinalise(pendingClient.id, {})} 
            disabled={isLoading}
            className="bg-white text-black px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl hover:bg-cyan-500 hover:text-white transition active:scale-95 disabled:opacity-30"
          >
            {isLoading ? 'Analysing...' : 'Deploy Programme'}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {clients.filter(c => c.planStatus === 'PLAN_READY').map(client => (
          <div key={client.id} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-cyan-900 transition">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h4 className="text-xl font-bold text-white">{client.profile.name}</h4>
                  <p className="text-xs text-slate-500 uppercase font-bold mt-1 tracking-wider">{client.intake?.goal.replace('_', ' ')}</p>
               </div>
               <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${client.performanceStatus === 'ON_TRACK' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                  {client.performanceStatus}
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
               <div className="text-center">
                  <p className="text-[10px] text-slate-600 font-bold uppercase">Total Logs</p>
                  <p className="text-lg font-bold text-white">{client.logs.length}</p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] text-slate-600 font-bold uppercase">Weight</p>
                  <p className="text-lg font-bold text-white">{client.intake?.weight}kg</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachDashboard;
