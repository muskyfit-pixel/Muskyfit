
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
import { Client, IntakeData, ExerciseLog, DailyLog, WeeklyCheckIn, ProgressPhoto } from './types';

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
      profile: { id: 'user_' + newId, name: data.name, role: 'CLIENT', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.name}` },
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

  const handleCoachFinalise = async (clientId: string, overrides: Partial<IntakeData>) => {
    setIsLoading(true);
    try {
      const targetClient = clients.find(c => c.id === clientId);
      if (targetClient && targetClient.intake) {
        const updatedIntake = { ...targetClient.intake, ...overrides };
        const plan = await generatePersonalizedPlan(updatedIntake);
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, intake: updatedIntake, plan, planStatus: 'PLAN_READY' } : c));
      }
    } catch (err) {
      console.error("Plan generation failed", err);
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

  const renderContent = () => {
    if (role === 'COACH') {
      const pending = clients.find(c => c.planStatus === 'CONSULTATION_SUBMITTED') || null;
      return <CoachDashboard clients={clients.filter(c => c.planStatus === 'PLAN_READY')} pendingClient={pending} onFinalise={handleCoachFinalise} isLoading={isLoading} />;
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') {
      return <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />;
    }

    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-3xl mx-auto text-center py-24 px-4">
          <div className="mb-10 inline-flex items-center justify-center w-28 h-28 rounded-full bg-slate-900 border-4 border-cyan-500 cyan-glow"><span className="text-5xl">🧬</span></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">Building Protocol</h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">Your MuskyFit coach is analyzing your profile to build your bespoke 12-week V-Taper protocol.</p>
        </div>
      );
    }

    if (activeTab === 'client-dashboard') {
      const latestCheckIn = currentClient.checkIns?.[0];
      const readinessScore = latestCheckIn ? Math.max(10, 100 - (latestCheckIn.stressLevel * 10)) : 85;

      return (
        <div className="space-y-10 pb-20 px-4 sm:px-0">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                   <h2 className="text-5xl font-black text-white metallic-text uppercase mb-2 italic tracking-tighter">Elite Hub</h2>
                   <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px]">Commander {currentClient.profile.name.split(' ')[0]}</p>
                </div>
                <ReadinessHUD score={readinessScore} sleep={latestCheckIn?.sleepHours || 7.5} stress={latestCheckIn?.stressLevel <= 4 ? 'Zen' : 'Physical Load'} />
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <button onClick={() => setActiveTab('workout')} className="p-8 bg-white rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-2xl">
               <span className="text-3xl block mb-4">⚔️</span>
               <h3 className="font-black text-black italic uppercase tracking-tighter">TRAIN</h3>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Protocol</p>
            </button>
            <button onClick={() => setActiveTab('log')} className="p-8 bg-cyan-600 rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-2xl">
               <span className="text-3xl block mb-4">🥗</span>
               <h3 className="font-black text-white italic uppercase tracking-tighter">MACROS</h3>
               <p className="text-[8px] font-bold text-cyan-200 uppercase tracking-widest mt-1">Log Intake</p>
            </button>
            <button onClick={() => setActiveTab('vault')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-2xl">
               <span className="text-3xl block mb-4">🧠</span>
               <h3 className="font-black text-white italic uppercase tracking-tighter">VAULT</h3>
               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Intel</p>
            </button>
            <button onClick={() => setActiveTab('concierge')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-2xl">
               <span className="text-3xl block mb-4">💬</span>
               <h3 className="font-black text-white italic uppercase tracking-tighter">AGENT</h3>
               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">24/7 Support</p>
            </button>
            <button onClick={() => setActiveTab('photos')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-2xl">
               <span className="text-3xl block mb-4">🖼️</span>
               <h3 className="font-black text-white italic uppercase tracking-tighter">PROOFS</h3>
               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Progress</p>
            </button>
            <button onClick={() => setActiveTab('checkin')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-left hover:scale-[1.02] transition-transform shadow-2xl">
               <span className="text-3xl block mb-4">📈</span>
               <h3 className="font-black text-white italic uppercase tracking-tighter">REFLECT</h3>
               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Weekly</p>
            </button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10">
             <ClientProgressSummary logs={currentClient.logs} />
             <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic text-center">Coach's Directive</h4>
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 italic text-sm text-slate-400 leading-relaxed shadow-inner">
                   "{currentClient.plan?.coachAdvice || 'Movement is non-negotiable for metabolic health.'}"
                </div>
             </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'log') return <DailyLogging onSave={handleLogSave} targetMacros={currentClient?.plan?.trainingDayMacros} />;
    if (activeTab === 'checkin') return <WeeklyCheckInForm onSubmit={handleCheckInSubmit} />;
    if (activeTab === 'vault') return <MuskyFitVault />;
    if (activeTab === 'concierge') return <MuskyFitSupport client={currentClient!} />;
    if (activeTab === 'workout') return <WorkoutTracker currentWorkout={currentClient.plan!.workoutSplit[currentClient.currentWorkoutIndex]} previousProgress={currentClient.exerciseProgress} onFinish={() => setActiveTab('client-dashboard')} />;
    if (activeTab === 'plans') return <PlanDisplay mealPlan={currentClient.plan?.mealPlan || []} workoutSplit={currentClient.plan?.workoutSplit || []} trainingDayMacros={currentClient.plan?.trainingDayMacros} restDayMacros={currentClient.plan?.restDayMacros} coachAdvice={currentClient.plan?.coachAdvice} />;
    if (activeTab === 'photos') return <TransformationHub photos={currentClient?.photos || []} onUpload={(p) => setClients(prev => prev.map(c => c.id === currentClientId ? { ...c, photos: [...c.photos, p] } : c))} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#070b14]">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto pt-12">{renderContent()}</main>
    </div>
  );
};

export default App;
