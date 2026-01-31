import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import IntakeForm from './components/IntakeForm';
import PlanDisplay from './components/PlanDisplay';
import CoachDashboard from './components/CoachDashboard';
import DailyLogging from './components/DailyLogging';
import WorkoutTracker from './components/WorkoutTracker';
import WeeklyCheckInForm from './components/WeeklyCheckInForm';
import ClientProgressSummary from './components/ClientProgressSummary';
import { generatePersonalizedPlan } from './services/geminiService';
import { MOCK_CLIENTS } from './constants';
import { Client, IntakeData, ExerciseLog, DailyLog, WeeklyCheckIn } from './types';

const App = () => {
  const [role, setRole] = useState<'COACH' | 'CLIENT'>('CLIENT');
  const [activeTab, setActiveTab] = useState('client-dashboard');
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('muskyfit_clients');
    try {
      return saved ? JSON.parse(saved) : MOCK_CLIENTS;
    } catch (e) {
      return MOCK_CLIENTS;
    }
  });
  
  const [currentClientId, setCurrentClientId] = useState<string | null>(() => {
    const saved = localStorage.getItem('muskyfit_active_client');
    if (saved) return saved;
    return MOCK_CLIENTS.length > 0 ? MOCK_CLIENTS[0].id : null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('muskyfit_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClientId) {
      localStorage.setItem('muskyfit_active_client', currentClientId);
    }
  }, [currentClientId]);

  const currentClient = clients.find(c => c.id === currentClientId) || null;

  useEffect(() => {
    setActiveTab(role === 'COACH' ? 'coach-dashboard' : 'client-dashboard');
  }, [role]);

  const handleIntakeSubmit = async (data: IntakeData) => {
    setIsLoading(true);
    const newId = 'client_' + Date.now();
    const newClient: Client = {
      id: newId,
      profile: { id: 'user_' + newId, name: data.name, email: data.email, phone: data.phone, role: 'CLIENT', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}` },
      intake: data,
      planStatus: 'CONSULTATION_SUBMITTED',
      currentWorkoutIndex: 0,
      exerciseProgress: {},
      logs: [],
      checkIns: [],
      performanceStatus: 'ON_TRACK'
    };
    setClients(prev => [...prev, newClient]);
    setCurrentClientId(newId);
    setIsLoading(false);
    setActiveTab('client-dashboard');
  };

  const handleCoachFinalise = async (clientId: string, overrides: Partial<IntakeData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const targetClient = clients.find(c => c.id === clientId);
      if (targetClient && targetClient.intake) {
        const updatedIntake = { ...targetClient.intake, ...overrides };
        const plan = await generatePersonalizedPlan(updatedIntake);
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, intake: updatedIntake, plan, planStatus: 'PLAN_READY', currentWorkoutIndex: 0 } : c));
      }
    } catch (err) {
      setError("Failed to build bespoke plan. Check AI connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSave = (log: DailyLog) => {
    setClients(prev => prev.map(c => c.id === currentClientId ? { ...c, logs: [log, ...c.logs] } : c));
    setActiveTab('client-dashboard');
  };

  const handleCheckInSubmit = (checkIn: WeeklyCheckIn) => {
    setClients(prev => prev.map(c => c.id === currentClientId ? { ...c, checkIns: [checkIn, ...(c.checkIns || [])] } : c));
    setActiveTab('client-dashboard');
  };

  const handleWorkoutFinish = (exerciseLogs: ExerciseLog[]) => {
    if (!currentClient || !currentClient.plan) return;
    const workoutCount = currentClient.plan.workoutSplit.length;
    const nextIndex = (currentClient.currentWorkoutIndex + 1) % workoutCount;
    const newProgress = { ...currentClient.exerciseProgress };
    exerciseLogs.forEach(log => {
      const maxWeight = Math.max(...log.sets.map(s => s.weight), 0);
      if (maxWeight > 0) newProgress[log.exerciseId] = maxWeight;
    });
    const newLog: DailyLog = {
      date: new Date().toISOString().split('T')[0],
      steps: 0, water: 0, caloriesConsumed: 0, proteinConsumed: 0, carbsConsumed: 0, fatsConsumed: 0,
      workoutCompleted: true, exerciseLogs, workoutId: currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex].id
    };
    setClients(prev => prev.map(c => c.id === currentClientId ? { ...c, currentWorkoutIndex: nextIndex, exerciseProgress: newProgress, logs: [newLog, ...c.logs] } : c));
    setActiveTab('client-dashboard');
  };

  const renderContent = () => {
    if (role === 'COACH') {
      const pending = clients.find(c => c.planStatus === 'CONSULTATION_SUBMITTED') || null;
      return <CoachDashboard clients={clients.filter(c => c.planStatus === 'PLAN_READY')} pendingClient={pending} onFinalise={handleCoachFinalise} isLoading={isLoading} />;
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') {
      return (
        <div className="py-10">
          <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />
        </div>
      );
    }

    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-3xl mx-auto text-center py-24 px-4">
          <div className="mb-10 inline-flex items-center justify-center w-28 h-28 rounded-full bg-slate-900 border-4 border-cyan-500 cyan-glow"><span className="text-5xl">🧬</span></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">Building Protocol</h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto mb-10">Analysis of your biomechanical and lifestyle profile is underway. Your MuskyFit coach will publish your plan shortly.</p>
        </div>
      );
    }

    if (activeTab === 'client-dashboard') {
      return (
        <div className="space-y-10 pb-20 px-4 sm:px-0">
          <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-800">
             <h2 className="text-4xl font-black text-white metallic-text uppercase mb-2">Elite Hub</h2>
             <p className="text-cyan-500 font-bold uppercase tracking-widest text-xs">Welcome back, {currentClient.profile.name}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <button onClick={() => setActiveTab('workout')} className="p-8 bg-white rounded-3xl text-left"><span className="text-3xl block mb-4">🏋️</span><h3 className="font-black text-black italic">TRAIN</h3></button>
            <button onClick={() => setActiveTab('log')} className="p-8 bg-cyan-600 rounded-3xl text-left"><span className="text-3xl block mb-4">🥗</span><h3 className="font-black text-white italic">MACROS</h3></button>
            <button onClick={() => setActiveTab('checkin')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-left"><span className="text-3xl block mb-4">📅</span><h3 className="font-black text-white italic">CHECK-IN</h3></button>
          </div>
          <ClientProgressSummary logs={currentClient.logs} />
        </div>
      );
    }
    if (activeTab === 'log') return <DailyLogging onSave={handleLogSave} targetMacros={currentClient?.plan?.trainingDayMacros} />;
    if (activeTab === 'checkin') return <WeeklyCheckInForm onSubmit={handleCheckInSubmit} />;
    if (activeTab === 'workout') return <WorkoutTracker currentWorkout={currentClient.plan!.workoutSplit[currentClient.currentWorkoutIndex]} previousProgress={currentClient.exerciseProgress} onFinish={handleWorkoutFinish} />;
    if (activeTab === 'plans') return <PlanDisplay mealPlan={currentClient.plan?.mealPlan || []} workoutSplit={currentClient.plan?.workoutSplit || []} trainingDayMacros={currentClient.plan?.trainingDayMacros} restDayMacros={currentClient.plan?.restDayMacros} coachAdvice={currentClient.plan?.coachAdvice} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#070b14]">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto pt-6 md:pt-12">{renderContent()}</main>
    </div>
  );
};

export default App;
