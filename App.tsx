
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
import { generatePersonalizedPlan } from './services/geminiService';
import { MOCK_CLIENTS } from './constants';
import { Client, IntakeData } from './types';

const App = () => {
  const [role, setRole] = useState<'COACH' | 'CLIENT'>('CLIENT');
  const [activeTab, setActiveTab] = useState('client-dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('muskyfit_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  
  const [currentClientId, setCurrentClientId] = useState<string | null>(() => {
    return localStorage.getItem('muskyfit_active_client') || (clients.length > 0 ? clients[0].id : null);
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
    setActiveTab('client-dashboard');
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
      console.error("Plan creation failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (role === 'COACH') {
      return (
        <CoachDashboard 
          clients={clients} 
          pendingClient={clients.find(c => c.planStatus === 'CONSULTATION_SUBMITTED') || null} 
          onFinalise={handleFinalisePlan} 
          onSendReview={(id, rev) => setClients(prev => prev.map(c => c.id === id ? {...c, checkIns: [{...c.checkIns[0], review: rev}, ...c.checkIns.slice(1)]} : c))}
          isLoading={isLoading} 
        />
      );
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') {
      return <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />;
    }

    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-slate-900 rounded-3xl border border-slate-800">
          <div className="text-4xl mb-6">📝</div>
          <h2 className="text-3xl font-bold text-white mb-4">Application Sent</h2>
          <p className="text-slate-400 mb-8">Thanks {currentClient.profile.name}. Your details are being reviewed. Your bespoke 12-week programme will be ready to view shortly.</p>
          <button onClick={() => setRole('COACH')} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm">Review as Coach</button>
        </div>
      );
    }

    switch (activeTab) {
      case 'log': return <DailyLogging onSave={(log) => setClients(prev => prev.map(c => c.id === currentClientId ? {...c, logs: [log, ...c.logs]} : c))} targetMacros={currentClient.plan?.trainingDayMacros} />;
      case 'workout': return currentClient.plan ? <WorkoutTracker currentWorkout={currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex]} previousProgress={currentClient.exerciseProgress} onFinish={() => setActiveTab('client-dashboard')} /> : null;
      case 'check-in': return <WeeklyCheckInForm onSubmit={(ci) => setClients(prev => prev.map(c => c.id === currentClientId ? {...c, checkIns: [ci, ...c.checkIns]} : c))} />;
      case 'concierge': return <MuskyFitSupport client={currentClient} />;
      case 'plans': return currentClient.plan ? <PlanDisplay mealPlan={currentClient.plan.mealPlan} workoutSplit={currentClient.plan.workoutSplit} trainingDayMacros={currentClient.plan.trainingDayMacros} coachAdvice={currentClient.plan.coachAdvice} /> : null;
      default: 
        return (
          <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
               <div>
                  <h2 className="text-2xl font-bold text-white">Welcome, {currentClient.profile.name}</h2>
                  <p className="text-sm text-slate-500">Your bespoke training is ready.</p>
               </div>
            </div>

            <ReadinessHUD 
              score={currentClient.performanceStatus === 'ON_TRACK' ? 100 : 50} 
              sleep={currentClient.checkIns[0]?.sleepHours || 8} 
              stress={currentClient.checkIns[0]?.stressLevel > 6 ? 'High' : 'Normal'} 
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                 <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Current Workout</h3>
                 <p className="text-2xl font-bold text-white mb-6">{currentClient.plan?.workoutSplit[currentClient.currentWorkoutIndex]?.title || 'Rest Day'}</p>
                 <button onClick={() => setActiveTab('workout')} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-500 hover:text-white transition shadow-xl">Start Training</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setActiveTab('log')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">🍽️</span>
                    <p className="text-xs font-bold text-white">Log Food</p>
                 </button>
                 <button onClick={() => setActiveTab('plans')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">📋</span>
                    <p className="text-xs font-bold text-white">Plan</p>
                 </button>
                 <button onClick={() => setActiveTab('concierge')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">💬</span>
                    <p className="text-xs font-bold text-white">Coach Chat</p>
                 </button>
                 <button onClick={() => setActiveTab('check-in')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">📅</span>
                    <p className="text-xs font-bold text-white">Check-in</p>
                 </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-4xl mx-auto py-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
