
import React from 'react';
import { UserRole } from '../types';

interface NavigationProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ role, setRole, activeTab, setActiveTab }) => {
  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('client-dashboard')}>
          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center font-bold text-cyan-500 shadow-lg">M</div>
          <span className="text-xl font-bold tracking-tight text-white italic">MUSKYFIT</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          {role === 'COACH' ? (
            <button onClick={() => setActiveTab('coach-dashboard')} className="text-xs font-bold text-white uppercase tracking-widest">Command Centre</button>
          ) : (
            <>
              <button onClick={() => setActiveTab('client-dashboard')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'client-dashboard' ? 'text-cyan-500' : 'text-slate-400'}`}>Home</button>
              <button onClick={() => setActiveTab('plans')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'plans' ? 'text-cyan-500' : 'text-slate-400'}`}>My Programme</button>
              <button onClick={() => setActiveTab('log')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'log' ? 'text-cyan-500' : 'text-slate-400'}`}>Nutrition Log</button>
              <button onClick={() => setActiveTab('concierge')} className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'concierge' ? 'text-cyan-500' : 'text-slate-400'}`}>Support</button>
            </>
          )}
        </div>

        <button 
          onClick={() => setRole(role === 'COACH' ? 'CLIENT' : 'COACH')}
          className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition"
        >
          {role === 'COACH' ? 'Switch to Client' : 'Switch to Coach'}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
