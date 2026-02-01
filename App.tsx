import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import IntakeForm from './components/IntakeForm';
import PlanDisplay from './components/PlanDisplay';
import CoachDashboard from './components/CoachDashboard';
import DailyLogging from './components/DailyLogging';
import WorkoutTracker from './components/WorkoutTracker';
import WeeklyCheckInForm from './components/WeeklyCheckInForm';
import ClientProgressSummary from './components/ClientProgressSummary';
import ReadinessHUD from './components/ReadinessHUD';
import MuskyFitVault from './components/MuskyFitVault';
import TransformationHub from './components/TransformationHub';
import MuskyFitSupport from './components/MuskyFitSupport';
import { generatePersonalizedPlan } from './services/geminiService';
import { MOCK_CLIENTS } from './constants';
import { Client, IntakeData, ExerciseLog, DailyLog, WeeklyCheckIn } from './types';

const App = () => {
  const [role, setRole] = useState<'COACH' | 'CLIENT'>('CLIENT');
  const [activeTab, setActiveTab] = useState('client-dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('muskyfit_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  
  const [currentClientId, setCurrentClientId] = useState<string | null>(() => {
    const saved = localStorage.getItem('muskyfit_active_client');
    return saved || (clients.length > 0 ? clients[0].id : null);
  });

  useEffect(() => {
    localStorage.setItem('muskyfit_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClientId) {
      localStorage.setItem('muskyfit_active_client', currentClientId);
    }
  }, [currentClientId]);

  const currentClient = clients.find(c => c.id === currentClientId) || null;

  const handleIntakeSubmit = async (data: IntakeData) => {
    setIsLoading(true);
    const newId = 'client_' + Date.now();
    const newClient: Client = {
      id: newId,
      profile: { id: 'u_' + newId, name: data.name, role: 'CLIENT', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}` },
      intake: data,
      planStatus: 'CONSULTATION_SUBMITTED',
      currentWorkoutIndex: 0,
      exerciseProgress: {},
      logs: [],
      checkIns: [],
      photos: [],
      performanceStatus: 'ON_TRACK'
    };
    setClients(prev => [...prev, newClient]);
    setCurrentClientId(newId);
    setIsLoading(false);
    setActiveTab('client-dashboard');
  };

  const handleLogSave = (log: DailyLog) => {
    setClients(prev => prev.map(c => c.id === currentClientId ? { ...c, logs: [log, ...c.logs] } : c));
    setActiveTab('client-dashboard');
  };

  const handleWorkoutFinish = (exerciseLogs: ExerciseLog[]) => {
    if (!currentClient || !currentClient.plan) return;
    const workoutCount = currentClient.plan.workoutSplit.length;
    const nextIndex = (currentClient.currentWorkoutIndex + 1) % workoutCount;
    
    const newLog: DailyLog = {
      date: new Date().toISOString().split('T')[0],
      steps: 0, water: 0, caloriesConsumed: 0, proteinConsumed: 0, carbsConsumed: 0, fatsConsumed: 0,
      workoutCompleted: true, exerciseLogs, workoutId: currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex].id
    };

    setClients(prev => prev.map(c => c.id === currentClientId ? { 
      ...c, 
      currentWorkoutIndex: nextIndex,
      logs: [newLog, ...c.logs]
    } : c));
    setActiveTab('client-dashboard');
  };

  const renderContent = () => {
    if (role === 'COACH') {
      return <CoachDashboard 
        clients={clients} 
        pendingClient={clients.find(c => c.planStatus === 'CONSULTATION_SUBMITTED') || null} 
        onFinalise={(id, overrides) => {}} 
        isLoading={isLoading} 
      />;
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') return <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />;

    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-3xl mx-auto text-center py-24 px-4">
          <div className="mb-10 inline-flex items-center justify-center w-28 h-28 rounded-full bg-slate-900 border-4 border-cyan-500 cyan-glow"><span className="text-5xl">🧬</span></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">Building Protocol</h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">Your coach is analyzing your biometrics to build your 12-week V-Taper protocol. Please stand by.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'log': 
        return <DailyLogging onSave={handleLogSave} targetMacros={currentClient.plan?.trainingDayMacros} />;
      case 'workout': 
        return <WorkoutTracker 
          currentWorkout={currentClient.plan!.workoutSplit[currentClient.currentWorkoutIndex]} 
          previousProgress={currentClient.exerciseProgress} 
          onFinish={handleWorkoutFinish} 
        />;
      case 'concierge': 
        return <MuskyFitSupport client={currentClient} />;
      case 'vault': 
        return <MuskyFitVault />;
      case 'photos': 
        return <TransformationHub photos={currentClient.photos} onUpload={(p) => setClients(prev => prev.map(c => c.id === currentClientId ? {...c, photos: [...c.photos, p]} : c))} />;
      case 'plans':
        return <PlanDisplay 
          mealPlan={currentClient.plan!.mealPlan} 
          workoutSplit={currentClient.plan!.workoutSplit} 
          trainingDayMacros={currentClient.plan!.trainingDayMacros}
          restDayMacros={currentClient.plan!.restDayMacros}
          coachAdvice={currentClient.plan!.coachAdvice}
        />;
      default: 
        return (
          <div className="space-y-10 px-4 md:px-0">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
               <ReadinessHUD score={85} sleep={7.5} stress="Zen" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
               <button onClick={() => setActiveTab('workout')} className="p-8 bg-white rounded-3xl text-black font-black italic uppercase text-left hover:scale-[1.02] transition shadow-xl">
                 <span className="text-2xl block mb-2">🏋️</span>
                 Train
               </button>
               <button onClick={() => setActiveTab('log')} className="p-8 bg-cyan-600 rounded-3xl text-white font-black italic uppercase text-left hover:scale-[1.02] transition shadow-xl">
                 <span className="text-2xl block mb-2">🥗</span>
                 Macros
               </button>
               <button onClick={() => setActiveTab('concierge')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white font-black italic uppercase text-left hover:scale-[1.02] transition shadow-xl">
                 <span className="text-2xl block mb-2">🤖</span>
                 Concierge
               </button>
               <button onClick={() => setActiveTab('vault')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white font-black italic uppercase text-left hover:scale-[1.02] transition shadow-xl">
                 <span className="text-2xl block mb-2">🧠</span>
                 Vault
               </button>
               <button onClick={() => setActiveTab('photos')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white font-black italic uppercase text-left hover:scale-[1.02] transition shadow-xl">
                 <span className="text-2xl block mb-2">📸</span>
                 Photos
               </button>
               <button onClick={() => setActiveTab('plans')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white font-black italic uppercase text-left hover:scale-[1.02] transition shadow-xl">
                 <span className="text-2xl block mb-2">📊</span>
                 Plan
               </button>
            </div>
            <ClientProgressSummary logs={currentClient.logs} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14]">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto pt-12">{renderContent()}</main>
    </div>
  );
};

export default App;
