import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import IntakeForm from './components/IntakeForm';
import PlanDisplay from './components/PlanDisplay';
import CoachDashboard from './components/CoachDashboard';
import DailyLogging from './components/DailyLogging';
import WorkoutTracker from './components/WorkoutTracker';
import ReadinessHUD from './components/ReadinessHUD';
import MuskyFitSupport from './components/MuskyFitSupport';
import MuskyFitVault from './components/MuskyFitVault';
import ClientProgressSummary from './components/ClientProgressSummary';
import TransformationHub from './components/TransformationHub';
import StrengthMatrix from './components/StrengthMatrix';
import ResourceRadar from './components/ResourceRadar';
import WeeklyReviewView from './components/WeeklyReviewView';
import { generatePersonalizedPlan } from './services/geminiService';
import { MOCK_CLIENTS } from './constants';
import { Client, IntakeData } from './types';
// Fixed missing Camera import from lucide-react
import { LayoutDashboard, Flame, ClipboardList, BookOpen, MessageSquare, Target, User, TrendingUp, MapPin, Camera } from 'lucide-react';

const App = () => {
  const [role, setRole] = useState<'COACH' | 'CLIENT'>('CLIENT');
  const [activeTab, setActiveTab] = useState('client-dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('muskyfit_db_v4');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  
  const [currentClientId, setCurrentClientId] = useState<string | null>(() => {
    return localStorage.getItem('muskyfit_active_id_v4') || (clients.length > 0 ? clients[0].id : null);
  });

  useEffect(() => {
    localStorage.setItem('muskyfit_db_v4', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClientId) {
      localStorage.setItem('muskyfit_active_id_v4', currentClientId);
    }
  }, [currentClientId]);

  const currentClient = clients.find(c => c.id === currentClientId) || null;

  const handleIntakeSubmit = async (data: IntakeData) => {
    setIsLoading(true);
    const newId = 'c_' + Date.now();
    const newClient: Client = {
      id: newId,
      profile: { id: 'u_' + newId, name: data.name, role: 'CLIENT', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}` },
      intake: data,
      planStatus: 'CONSULTATION_SUBMITTED',
      currentWorkoutIndex: 0,
      exerciseProgress: {},
      personalBests: [],
      logs: [],
      checkIns: [],
      photos: [],
      performanceStatus: 'ON_TRACK'
    };
    setClients(prev => [...prev, newClient]);
    setCurrentClientId(newId);
    setIsLoading(false);
  };

  const handleFinalisePlan = async (clientId: string) => {
    setIsLoading(true);
    try {
      const client = clients.find(c => c.id === clientId);
      if (client?.intake) {
        const plan = await generatePersonalizedPlan(client.intake);
        if (plan) {
          setClients(prev => prev.map(c => c.id === clientId ? { ...c, plan, planStatus: 'PLAN_READY' } : c));
        }
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const updateClientData = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
  };

  const renderContent = () => {
    if (role === 'COACH') {
      return (
        <CoachDashboard 
          clients={clients} 
          pendingClient={clients.find(c => c.planStatus === 'CONSULTATION_SUBMITTED') || null} 
          onFinalise={handleFinalisePlan}
          onSendReview={() => {}}
          isLoading={isLoading} 
        />
      );
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') {
      return <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />;
    }

    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-2xl mx-auto text-center py-24 px-6 bg-slate-900/20 rounded-[3rem] border border-white/5 backdrop-blur-xl animate-in fade-in duration-1000">
          <div className="w-24 h-24 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Target className="text-cyan-500 w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter brand-font">Protocol Synthesis</h2>
          <p className="text-slate-400 mb-10 italic leading-relaxed">Your head coach is analyzing your intake data and metabolic profile. Your bespoke 12-week blueprint is being finalized.</p>
          <div className="space-y-4">
            <button onClick={() => setRole('COACH')} className="w-full bg-white text-black px-8 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-cyan-500 hover:text-white transition shadow-2xl">Access Admin Portal</button>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Awaiting Authorization from MUSKYFIT Command</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'log': return <DailyLogging onSave={(log) => updateClientData(currentClient.id, { logs: [log, ...currentClient.logs] })} targetMacros={currentClient.plan?.trainingDayMacros} />;
      case 'plans': return currentClient.plan ? <PlanDisplay mealPlan={currentClient.plan.mealPlan} workoutSplit={currentClient.plan.workoutSplit} trainingDayMacros={currentClient.plan.trainingDayMacros} /> : null;
      case 'concierge': return <MuskyFitSupport client={currentClient} />;
      case 'vault': return <MuskyFitVault />;
      case 'workout': return currentClient.plan ? <WorkoutTracker currentWorkout={currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex]} previousProgress={currentClient.exerciseProgress} onFinish={() => { setActiveTab('client-dashboard'); updateClientData(currentClient.id, { currentWorkoutIndex: (currentClient.currentWorkoutIndex + 1) % currentClient.plan!.workoutSplit.length }); }} /> : null;
      case 'visuals': return <TransformationHub photos={currentClient.photos} onUpload={(photo) => updateClientData(currentClient.id, { photos: [...currentClient.photos, photo] })} biometrics={JSON.stringify(currentClient.intake)} gender={currentClient.intake?.gender} dob={currentClient.intake?.dob} />;
      case 'strength': return <StrengthMatrix pbs={currentClient.personalBests} />;
      case 'radar': return <ResourceRadar />;
      case 'audit': return <WeeklyReviewView reviews={currentClient.checkIns.filter(c => c.review).map(c => c.review!)} />;
      default: 
        return (
          <div className="space-y-6 pb-32 animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.4em] italic mb-1">Status: Elite Active</p>
                <h2 className="text-4xl font-black text-white italic tracking-tighter brand-font uppercase leading-none">Hello, {currentClient.profile.name.split(' ')[0]}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-lg">
                 <User size={24} className="text-cyan-500" />
              </div>
            </div>

            <ReadinessHUD score={94} sleep={7.8} stress="Optimal" />
            
            <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('workout')}>
               <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl font-black italic uppercase select-none group-hover:opacity-10 transition-opacity">Execute</div>
               <h3 className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-widest italic">Phase 1: Power Foundation</h3>
               <p className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter brand-font">{currentClient.plan?.workoutSplit[currentClient.currentWorkoutIndex]?.title || 'Protocol Rest'}</p>
               <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] shadow-lg hover:bg-cyan-500 hover:text-white transition-all">Begin Session</button>
            </div>

            <ClientProgressSummary logs={currentClient.logs} />
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 text-center group cursor-pointer hover:border-cyan-500/30 transition-all" onClick={() => setActiveTab('plans')}>
                  <Flame className="mx-auto mb-4 text-orange-500 group-hover:scale-110 transition" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Target KCAL</p>
                  <p className="text-base font-black text-white mt-1 brand-font">{currentClient.plan?.trainingDayMacros?.calories || 0}</p>
               </div>
               <div className="bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 text-center group cursor-pointer hover:border-cyan-500/30 transition-all" onClick={() => setActiveTab('vault')}>
                  <BookOpen className="mx-auto mb-4 text-cyan-500 group-hover:scale-110 transition" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Intelligence</p>
                  <p className="text-base font-black text-white mt-1 brand-font">VAULT</p>
               </div>
            </div>

            {/* Quick Links Row */}
            <div className="grid grid-cols-3 gap-3">
               <button onClick={() => setActiveTab('strength')} className="p-4 bg-slate-900/30 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:bg-slate-900/50 transition">
                  <TrendingUp size={18} className="text-slate-500" />
                  <span className="text-[8px] font-black uppercase text-slate-400">Strength</span>
               </button>
               <button onClick={() => setActiveTab('visuals')} className="p-4 bg-slate-900/30 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:bg-slate-900/50 transition">
                  <Camera size={18} className="text-slate-500" />
                  <span className="text-[8px] font-black uppercase text-slate-400">Visuals</span>
               </button>
               <button onClick={() => setActiveTab('radar')} className="p-4 bg-slate-900/30 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:bg-slate-900/50 transition">
                  <MapPin size={18} className="text-slate-500" />
                  <span className="text-[8px] font-black uppercase text-slate-400">Radar</span>
               </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        {renderContent()}
      </main>

      {role === 'CLIENT' && currentClient?.planStatus === 'PLAN_READY' && (
        <div className="fixed bottom-0 left-0 w-full z-50 bottom-nav-glass pb-safe">
           <div className="max-w-md mx-auto h-20 flex justify-around items-center px-4">
              <button onClick={() => setActiveTab('client-dashboard')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'client-dashboard' ? 'text-cyan-400' : 'text-slate-600'}`}>
                <LayoutDashboard size={22} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Home</span>
              </button>
              <button onClick={() => setActiveTab('plans')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'plans' ? 'text-cyan-400' : 'text-slate-600'}`}>
                <ClipboardList size={22} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Blueprint</span>
              </button>
              <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'log' ? 'text-cyan-400' : 'text-slate-600'}`}>
                <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center -mt-10 shadow-xl shadow-cyan-900/40 text-white">
                   <PlusIcon />
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Log</span>
              </button>
              <button onClick={() => setActiveTab('audit')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'audit' ? 'text-cyan-400' : 'text-slate-600'}`}>
                <TrendingUp size={22} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Audit</span>
              </button>
              <button onClick={() => setActiveTab('concierge')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'concierge' ? 'text-cyan-400' : 'text-slate-600'}`}>
                <MessageSquare size={22} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Coach</span>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default App;
