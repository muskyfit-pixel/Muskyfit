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
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-700 cyan-glow">
               <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <path d="M20 80 L20 20 L50 50 L80 20 L80 80" fill="none" stroke="url(#metallic)" strokeWidth="12" strokeLinecap="square" />
                  <path d="M40 55 L70 55" fill="none" stroke="#06b6d4" strokeWidth="8" />
                  <defs>
                    <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="50%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter metallic-text">MUSKYFIT</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase">Personal Coaching</span>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-6">
            {role === 'COACH' ? (
              <>
                <button 
                  onClick={() => setActiveTab('coach-dashboard')}
                  className={`${activeTab === 'coach-dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'} hover:text-white px-1 py-2 text-[10px] font-black uppercase tracking-widest transition`}
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('client-dashboard')}
                  className={`${activeTab === 'client-dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'} hover:text-white px-1 py-2 text-[10px] font-black uppercase tracking-widest transition`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setActiveTab('log')}
                  className={`${activeTab === 'log' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'} hover:text-white px-1 py-2 text-[10px] font-black uppercase tracking-widest transition`}
                >
                  Log
                </button>
                <button 
                  onClick={() => setActiveTab('check-in')}
                  className={`${activeTab === 'check-in' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'} hover:text-white px-1 py-2 text-[10px] font-black uppercase tracking-widest transition`}
                >
                  Check-In
                </button>
                <button 
                  onClick={() => setActiveTab('plans')}
                  className={`${activeTab === 'plans' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'} hover:text-white px-1 py-2 text-[10px] font-black uppercase tracking-widest transition`}
                >
                  Protocol
                </button>
                <button 
                  onClick={() => setActiveTab('concierge')}
                  className={`${activeTab === 'concierge' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'} hover:text-white px-1 py-2 text-[10px] font-black uppercase tracking-widest transition`}
                >
                  Concierge
                </button>
                <button 
                  onClick={() => setActiveTab('vault')}
                  className={`${activeTab === 'vault' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400'} hover:text-white px-1 py-2 text-[10px] font-black uppercase tracking-widest transition`}
                >
                  Vault
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setRole(newRole);
              }}
              className="bg-slate-900 text-[10px] border border-slate-700 rounded-md px-3 py-1.5 text-slate-300 font-black uppercase tracking-widest focus:ring-1 focus:ring-cyan-500 outline-none"
            >
              <option value="COACH">COACH VIEW</option>
              <option value="CLIENT">CLIENT VIEW</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
