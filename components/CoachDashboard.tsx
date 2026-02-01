
import React, { useState } from 'react';
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
      <h2 className="text-3xl font-bold text-white">Coach Dashboard</h2>
      
      {pendingClient && (
        <div className="bg-cyan-900/20 border border-cyan-500/30 p-8 rounded-2xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">New Client Application</h3>
            <p className="text-sm text-slate-400">{pendingClient.profile.name} is waiting for their plan.</p>
          </div>
          <button 
            onClick={() => onFinalise(pendingClient.id, {})} 
            disabled={isLoading}
            className="bg-white text-black px-8 py-3 rounded-xl font-bold text-sm"
          >
            {isLoading ? 'Creating Plan...' : 'Create Plan'}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {clients.filter(c => c.planStatus === 'PLAN_READY').map(client => (
          <div key={client.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h4 className="text-lg font-bold text-white">{client.profile.name}</h4>
            <p className="text-xs text-slate-500 uppercase font-bold mt-1">Status: {client.performanceStatus}</p>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between">
               <span className="text-xs text-slate-400">Total Logs: {client.logs.length}</span>
               <button className="text-xs font-bold text-cyan-500 uppercase">View Progress</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachDashboard;
