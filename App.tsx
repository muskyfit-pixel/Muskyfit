
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
import { generatePersonalizedPlan } from './services/geminiService';
import { MOCK_CLIENTS } from './constants';
import { Client, IntakeData, WeeklyCheckIn, WeeklyReview } from './types';

const App = () => {
  const [role, setRole] = useState<'COACH' | 'CLIENT'>('CLIENT');
  const [activeTab, setActiveTab] = useState('client-dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('muskyfit_clients_v3');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  
  const [currentClientId, setCurrentClientId] = useState<string | null>(() => {
    return localStorage.getItem('muskyfit_active_client_v3') || (clients.length > 0 ? clients[0].id : null);
  });

  useEffect(() => {
    localStorage.setItem('muskyfit_clients_v3', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (currentClientId) {
      localStorage.setItem('muskyfit_active_client_v3', currentClientId);
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
    } catch (e) {
      console.error("Plan Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReview = (clientId: string, review: WeeklyReview) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const newCheckIn: WeeklyCheckIn = {
          date: review.date,
          energyLevel: 5,
          stressLevel: 5,
          sleepHours: 8,
          digestionStatus: 'Good',
          clientComments: 'Coach review update',
          review: review
        };
        return { ...c, checkIns: [newCheckIn, ...c.checkIns] };
      }
      return c;
    }));
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
          onSendReview={handleSendReview}
          isLoading={isLoading} 
        />
      );
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') {
      return <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />;
    }

    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-slate-900/50 rounded-3xl border border-slate-800">
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-3xl font-bold text-white mb-4">Application Under Review</h2>
          <p className="text-slate-400 mb-8">Hi {currentClient.profile.name}. Your coach is building your bespoke protocol. Check back soon.</p>
          <button onClick={() => setRole('COACH')} className="bg-white text-black px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Switch to Coach View</button>
        </div>
      );
    }

    switch (activeTab) {
      case 'log': return <DailyLogging onSave={(log) => updateClientData(currentClient.id, { logs: [log, ...currentClient.logs] })} targetMacros={currentClient.plan?.trainingDayMacros} />;
      case 'workout': return currentClient.plan ? <WorkoutTracker currentWorkout={currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex]} previousProgress={currentClient.exerciseProgress} onFinish={() => { setActiveTab('client-dashboard'); updateClientData(currentClient.id, { currentWorkoutIndex: (currentClient.currentWorkoutIndex + 1) % currentClient.plan!.workoutSplit.length }); }} /> : null;
      case 'check-in': return <WeeklyCheckInForm onSubmit={(ci) => updateClientData(currentClient.id, { checkIns: [ci, ...currentClient.checkIns] })} />;
      case 'concierge': return <MuskyFitSupport client={currentClient} />;
      case 'plans': return currentClient.plan ? <PlanDisplay mealPlan={currentClient.plan.mealPlan} workoutSplit={currentClient.plan.workoutSplit} trainingDayMacros={currentClient.plan.trainingDayMacros} /> : null;
      case 'vault': return <MuskyFitVault />;
      case 'transformation': return <TransformationHub photos={currentClient.photos} onUpload={(p) => updateClientData(currentClient.id, { photos: [p, ...currentClient.photos] })} biometrics={`${currentClient.intake?.weight}kg, ${currentClient.intake?.height}cm`} />;
      case 'reviews': return <WeeklyReviewView reviews={currentClient.checkIns.filter(ci => ci.review).map(ci => ci.review!)} />;
      case 'strength': return <StrengthMatrix pbs={currentClient.personalBests} />;
      case 'radar': return <ResourceRadar />;
      default: 
        return (
          <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Hi, {currentClient.profile.name}</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold italic">MUSKYFIT Elite Status Active</p>
              </div>
              <div className="px-4 py-1 bg-cyan-600/10 text-cyan-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 shadow-lg shadow-cyan-500/10">Active</div>
            </div>

            <ReadinessHUD score={92} sleep={7.5} stress="Optimal" />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col justify-between group hover:border-cyan-500 transition-all cursor-pointer shadow-xl" onClick={() => setActiveTab('workout')}>
                 <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Next Session</h3>
                    <p className="text-xl font-bold text-white mb-6 italic uppercase">{currentClient.plan?.workoutSplit[currentClient.currentWorkoutIndex]?.title || 'Rest Day'}</p>
                 </div>
                 <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl text-xs group-hover:bg-cyan-500 group-hover:text-white transition shadow-lg">Start Session</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setActiveTab('log')} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-xl mb-1 block group-hover:scale-110 transition-transform">🥗</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Food Diary</p>
                 </button>
                 <button onClick={() => setActiveTab('plans')} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-xl mb-1 block group-hover:scale-110 transition-transform">📋</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">My Plan</p>
                 </button>
                 <button onClick={() => setActiveTab('concierge')} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-xl mb-1 block group-hover:scale-110 transition-transform">💬</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Concierge</p>
                 </button>
                 <button onClick={() => setActiveTab('check-in')} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-center hover:border-cyan-500 transition shadow-lg group">
                    <span className="text-xl mb-1 block group-hover:scale-110 transition-transform">📅</span>
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Check-In</p>
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <button onClick={() => setActiveTab('vault')} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[9px] font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 uppercase transition tracking-widest">The Vault</button>
               <button onClick={() => setActiveTab('transformation')} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[9px] font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 uppercase transition tracking-widest">Progress</button>
               <button onClick={() => setActiveTab('strength')} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[9px] font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 uppercase transition tracking-widest">Strength</button>
               <button onClick={() => setActiveTab('radar')} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[9px] font-bold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 uppercase transition tracking-widest">Radar</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500/30">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-4xl mx-auto py-6 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
