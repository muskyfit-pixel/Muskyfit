
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import IntakeForm from './components/IntakeForm';
import PlanDisplay from './components/PlanDisplay';
import CoachDashboard from './components/CoachDashboard';
import DailyLogging from './components/DailyLogging';
import WorkoutTracker from './components/WorkoutTracker';
import WeeklyCheckInForm from './components/WeeklyCheckInForm';
import ReadinessHUD from './components/ReadinessHUD';
import MuskyFitSupport from './components/MuskyFitSupport';
import TransformationHub from './components/TransformationHub';
import MuskyFitVault from './components/MuskyFitVault';
import WeeklyReviewView from './components/WeeklyReviewView';
import StrengthMatrix from './components/StrengthMatrix';
import ResourceRadar from './components/ResourceRadar';
import ClientProgressSummary from './components/ClientProgressSummary';
import { generatePersonalizedPlan } from './services/geminiService';
import { MOCK_CLIENTS } from './constants';
import { Client, IntakeData } from './types';

const App = () => {
  const [role, setRole] = useState<'COACH' | 'CLIENT'>('CLIENT');
  const [activeTab, setActiveTab] = useState('client-dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('muskyfit_clients_v5');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  
  const [currentClientId, setCurrentClientId] = useState<string | null>(() => {
    return localStorage.getItem('muskyfit_active_client_v5') || (clients.length > 0 ? clients[0].id : null);
  });

  useEffect(() => {
    localStorage.setItem('muskyfit_clients_v5', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClientId) {
      localStorage.setItem('muskyfit_active_client_v5', currentClientId);
    }
  }, [currentClientId]);

  const currentClient = clients.find(c => c.id === currentClientId) || null;

  const handleIntakeSubmit = async (data: IntakeData) => {
    setIsLoading(true);
    const newId = 'c_' + Date.now();
    const newClient: Client = {
      id: newId,
      profile: { 
        id: 'u_' + newId, 
        name: data.name, 
        role: 'CLIENT', 
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}` 
      },
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
    } catch (e) {
      console.error(e);
      alert("Plan Generation Failed.");
    } finally {
      setIsLoading(false);
    }
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
        <div className="max-w-2xl mx-auto text-center py-24 px-6 bg-slate-900/40 rounded-[3rem] border border-slate-800 backdrop-blur-sm shadow-2xl animate-pulse">
          <div className="text-6xl mb-8">🧬</div>
          <h2 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tighter">Analysing Phenotype</h2>
          <p className="text-slate-400 mb-10 max-w-md mx-auto italic">Your bespoke V-Taper protocol is being engineered. Switch to COACH VIEW to publish it.</p>
          <button onClick={() => setRole('COACH')} className="bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-cyan-500 transition shadow-xl">Coach Command Center</button>
        </div>
      );
    }

    switch (activeTab) {
      case 'log': 
        return <DailyLogging onSave={(log) => updateClientData(currentClient.id, { logs: [log, ...currentClient.logs] })} targetMacros={currentClient.plan?.trainingDayMacros} />;
      case 'workout': 
        return currentClient.plan ? <WorkoutTracker currentWorkout={currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex]} previousProgress={currentClient.exerciseProgress} onFinish={() => { setActiveTab('client-dashboard'); updateClientData(currentClient.id, { currentWorkoutIndex: (currentClient.currentWorkoutIndex + 1) % currentClient.plan!.workoutSplit.length }); }} /> : null;
      case 'plans': 
        return currentClient.plan ? <PlanDisplay mealPlan={currentClient.plan.mealPlan} workoutSplit={currentClient.plan.workoutSplit} trainingDayMacros={currentClient.plan.trainingDayMacros} /> : null;
      case 'concierge': return <MuskyFitSupport client={currentClient} />;
      case 'transformation': return <TransformationHub photos={currentClient.photos} onUpload={(p) => updateClientData(currentClient.id, { photos: [p, ...currentClient.photos] })} biometrics={`${currentClient.intake?.weight}kg, ${currentClient.intake?.height}cm`} />;
      case 'vault': return <MuskyFitVault />;
      case 'check-in': return <WeeklyCheckInForm onSubmit={(ci) => updateClientData(currentClient.id, { checkIns: [ci, ...currentClient.checkIns] })} />;
      case 'reviews': return <WeeklyReviewView reviews={currentClient.checkIns.filter(ci => ci.review).map(ci => ci.review!)} />;
      case 'strength': return <StrengthMatrix pbs={currentClient.personalBests} />;
      case 'radar': return <ResourceRadar />;
      default: 
        return (
          <div className="space-y-6 pb-24 animate-in fade-in duration-700">
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 flex justify-between items-center shadow-xl">
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Hi, {currentClient.profile.name}</h2>
                <p className="text-[10px] text-cyan-500 uppercase tracking-[0.4em] font-black mt-1 italic">Protocol Active</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
            <ReadinessHUD score={94} sleep={7.8} stress="Optimal" />
            <ClientProgressSummary logs={currentClient.logs} />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 flex flex-col justify-between group hover:border-cyan-500 transition-all cursor-pointer shadow-2xl relative overflow-hidden" onClick={() => setActiveTab('workout')}>
                 <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl font-black italic uppercase select-none">Lift</div>
                 <h3 className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest italic">Next Session</h3>
                 <p className="text-2xl font-black text-white mb-8 italic uppercase tracking-tight">{currentClient.plan?.workoutSplit[currentClient.currentWorkoutIndex]?.title || 'Rest Day'}</p>
                 <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] shadow-lg">Execute Session</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setActiveTab('log')} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-2xl mb-2 block group-hover:scale-125 transition">🥗</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Diary</p>
                 </button>
                 <button onClick={() => setActiveTab('plans')} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-2xl mb-2 block group-hover:scale-125 transition">📋</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Protocol</p>
                 </button>
                 <button onClick={() => setActiveTab('concierge')} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-2xl mb-2 block group-hover:scale-125 transition">💬</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Support</p>
                 </button>
                 <button onClick={() => setActiveTab('transformation')} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-2xl mb-2 block group-hover:scale-125 transition">📸</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest italic">Vault</p>
                 </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-4xl mx-auto py-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
