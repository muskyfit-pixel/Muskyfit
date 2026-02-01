
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
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}` 
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
      console.error("Plan generation failed:", e);
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
    
    // Step 1: Intake if no client or plan
    if (!currentClient || currentClient.planStatus === 'NONE') {
      return (
        <div className="space-y-12">
          <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />
          <div className="text-center pb-20">
             <button 
               onClick={() => setRole('COACH')}
               className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-cyan-500 transition border border-slate-800 px-4 py-2 rounded-lg"
             >
               Skip to Admin Command Center
             </button>
          </div>
        </div>
      );
    }

    // Step 2: Waiting for approval
    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-3xl mx-auto text-center py-32 px-4">
          <div className="mb-10 inline-flex items-center justify-center w-28 h-28 rounded-full bg-slate-900 border-4 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-pulse">
            <span className="text-5xl">🥋</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">Reviewing Intake</h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Welcome to MUSKYFIT, {currentClient.profile.name}. Your profile is now being audited. Coach will deploy your 12-week high-performance protocol shortly.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => setRole('COACH')} className="bg-white text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition">Approve as Coach</button>
          </div>
        </div>
      );
    }

    // Step 3: Full App Dashboard
    switch (activeTab) {
      case 'log': return <DailyLogging onSave={(log) => setClients(prev => prev.map(c => c.id === currentClientId ? {...c, logs: [log, ...c.logs]} : c))} targetMacros={currentClient.plan?.trainingDayMacros} />;
      case 'workout': return currentClient.plan ? <WorkoutTracker currentWorkout={currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex]} previousProgress={currentClient.exerciseProgress} onFinish={() => setActiveTab('client-dashboard')} /> : null;
      case 'check-in': return <WeeklyCheckInForm onSubmit={(ci) => setClients(prev => prev.map(c => c.id === currentClientId ? {...c, checkIns: [ci, ...c.checkIns]} : c))} />;
      case 'performance': return <WeeklyReviewView reviews={currentClient.checkIns.filter(c => c.review).map(c => c.review!)} />;
      case 'concierge': return <MuskyFitSupport client={currentClient} />;
      case 'radar': return <ResourceRadar />;
      case 'vault': return <MuskyFitVault />;
      case 'photos': return <TransformationHub photos={currentClient.photos} onUpload={(p) => setClients(prev => prev.map(c => c.id === currentClientId ? {...c, photos: [...c.photos, p]} : c))} />;
      case 'strength': return <StrengthMatrix pbs={currentClient.personalBests} />;
      case 'plans': return currentClient.plan ? <PlanDisplay mealPlan={currentClient.plan.mealPlan} workoutSplit={currentClient.plan.workoutSplit} trainingDayMacros={currentClient.plan.trainingDayMacros} coachAdvice={currentClient.plan.coachAdvice} /> : null;
      default: 
        return (
          <div className="space-y-10 px-4 md:px-0 pb-32 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                  <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">Status Cockpit</h2>
                  <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Executive Performance Hub</p>
               </div>
               <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800">
                  <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Active Client</p>
                  <p className="text-xs font-black text-white italic">{currentClient.profile.name} • {currentClient.intake?.gender}</p>
               </div>
            </div>

            <ReadinessHUD 
              score={currentClient.performanceStatus === 'ON_TRACK' ? 88 : 42} 
              sleep={currentClient.checkIns[0]?.sleepHours || 7.5} 
              stress={currentClient.checkIns[0]?.stressLevel > 6 ? 'Intense' : 'Optimal'} 
            />

            <div className="grid lg:grid-cols-2 gap-8">
              <ClientProgressSummary logs={currentClient.logs} />
              
              <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col justify-between group">
                 <div className="relative overflow-hidden">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Daily Mission</h4>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 group-hover:text-cyan-400 transition">
                       {currentClient.plan?.workoutSplit[currentClient.currentWorkoutIndex]?.title || 'Rest & Recovery'}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                       Focused on {currentClient.intake?.gender === 'FEMALE' ? 'Resilience & Lean Tone' : 'Structural Density & Power'}. Aim for perfect form.
                    </p>
                 </div>
                 <button 
                   onClick={() => setActiveTab('workout')}
                   className="mt-10 w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-xl italic border-b-4 border-slate-300"
                 >
                   Deploy Training
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { id: 'log', label: 'Nutrient Log', icon: '🍛' },
                { id: 'concierge', label: 'AI Coach', icon: '🤖' },
                { id: 'radar', label: 'Radar', icon: '📡' },
                { id: 'vault', label: 'Vault', icon: '💎' }
              ].map(item => (
                <div key={item.id} onClick={() => setActiveTab(item.id)} className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 hover:border-cyan-500 transition cursor-pointer text-center group relative overflow-hidden">
                   <span className="text-3xl mb-4 block group-hover:scale-125 transition duration-500">{item.icon}</span>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-10 px-4 md:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
