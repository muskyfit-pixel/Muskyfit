
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import IntakeForm from './components/IntakeForm';
import PlanDisplay from './components/PlanDisplay';
import CoachDashboard from './components/CoachDashboard';
import DailyLogging from './components/DailyLogging';
import WorkoutTracker from './components/WorkoutTracker';
import WeeklyCheckInForm from './components/WeeklyCheckInForm';
import ReadinessHUD from './components/ReadinessHUD';
import MuskyFitVault from './components/MuskyFitVault';
import TransformationHub from './components/TransformationHub';
import MuskyFitSupport from './components/MuskyFitSupport';
import WeeklyReviewView from './components/WeeklyReviewView';
import StrengthMatrix from './components/StrengthMatrix';
import ResourceRadar from './components/ResourceRadar';
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

  const handleFinaliseProtocol = async (clientId: string) => {
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
          onFinalise={handleFinaliseProtocol} 
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
          <div className="text-4xl mb-6">⏳</div>
          <h2 className="text-3xl font-bold text-white mb-4">Application Submitted</h2>
          <p className="text-slate-400 mb-8">Hi {currentClient.profile.name}, your information has been sent to the coach. We are reviewing your details and will create your bespoke plan shortly.</p>
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
                  <h2 className="text-2xl font-bold text-white">Welcome back, {currentClient.profile.name}</h2>
                  <p className="text-sm text-slate-500">Your plan is active and on track.</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold">Goal</p>
                  <p className="text-cyan-500 font-bold">{currentClient.intake?.goal.replace('_', ' ')}</p>
               </div>
            </div>

            <ReadinessHUD 
              score={currentClient.performanceStatus === 'ON_TRACK' ? 90 : 50} 
              sleep={currentClient.checkIns[0]?.sleepHours || 7} 
              stress={currentClient.checkIns[0]?.stressLevel > 6 ? 'High' : 'Normal'} 
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                 <h3 className="text-sm font-bold text-slate-500 uppercase mb-6">Today's Training</h3>
                 <p className="text-2xl font-bold text-white mb-2">{currentClient.plan?.workoutSplit[currentClient.currentWorkoutIndex]?.title || 'Rest Day'}</p>
                 <p className="text-sm text-slate-400 mb-6">Follow your bespoke programme for maximum results.</p>
                 <button onClick={() => setActiveTab('workout')} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-cyan-500 hover:text-white transition">Start Workout</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setActiveTab('log')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">🍎</span>
                    <p className="text-xs font-bold text-white">Log Food</p>
                 </button>
                 <button onClick={() => setActiveTab('plans')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">🍽️</span>
                    <p className="text-xs font-bold text-white">Meal Plan</p>
                 </button>
                 <button onClick={() => setActiveTab('concierge')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">💬</span>
                    <p className="text-xs font-bold text-white">Coach Chat</p>
                 </button>
                 <button onClick={() => setActiveTab('check-in')} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition">
                    <span className="text-2xl mb-2 block">📋</span>
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
      <main className="max-w-5xl mx-auto py-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
