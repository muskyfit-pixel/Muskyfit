
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
import { generatePersonalizedPlan } from './services/geminiService';
import { MOCK_CLIENTS } from './constants';
import { Client, IntakeData, ExerciseLog, DailyLog, WeeklyCheckIn, WeeklyReview } from './types';

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
      personalBests: [
        { exercise: 'Bench Press', weight: 0, date: '', history: [] },
        { exercise: 'Squat', weight: 0, date: '', history: [] },
        { exercise: 'Deadlift', weight: 0, date: '', history: [] },
        { exercise: 'Shoulder Press', weight: 0, date: '', history: [] }
      ],
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
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.intake) return;
    
    setIsLoading(true);
    try {
      const plan = await generatePersonalizedPlan(client.intake);
      setClients(prev => prev.map(c => c.id === clientId ? {
        ...c,
        plan,
        planStatus: 'PLAN_READY'
      } : c));
    } catch (e) {
      console.error("Failed to generate plan", e);
      alert("AI Protocol Deployment Failed. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReview = (clientId: string, review: WeeklyReview) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const newCheckIns = [...c.checkIns];
        if (newCheckIns.length > 0) {
          newCheckIns[0] = { ...newCheckIns[0], review };
        }
        return { ...c, checkIns: newCheckIns, performanceStatus: review.status === 'RED' ? 'OFF_TRACK' : 'ON_TRACK' };
      }
      return c;
    }));
  };

  const handleLogSave = (log: DailyLog) => {
    setClients(prev => prev.map(c => c.id === currentClientId ? { ...c, logs: [log, ...c.logs] } : c));
    setActiveTab('client-dashboard');
  };

  const handleCheckInSubmit = (checkIn: WeeklyCheckIn) => {
    setClients(prev => prev.map(c => c.id === currentClientId ? { ...c, checkIns: [checkIn, ...c.checkIns] } : c));
    setActiveTab('performance');
  };

  const handleWorkoutFinish = (exerciseLogs: ExerciseLog[]) => {
    if (!currentClient || !currentClient.plan) return;
    const workoutCount = currentClient.plan.workoutSplit.length;
    const nextIndex = (currentClient.currentWorkoutIndex + 1) % workoutCount;
    
    const updatedPBs = [...(currentClient.personalBests || [])];
    const today = new Date().toISOString().split('T')[0];
    
    exerciseLogs.forEach(log => {
      const exerciseName = currentClient.plan!.workoutSplit[currentClient.currentWorkoutIndex].exercises.find(e => e.id === log.exerciseId)?.name;
      if (exerciseName) {
        const pbIdx = updatedPBs.findIndex(p => p.exercise.toLowerCase().includes(exerciseName.toLowerCase()) || exerciseName.toLowerCase().includes(p.exercise.toLowerCase()));
        if (pbIdx !== -1) {
          const maxWeightThisSession = Math.max(...log.sets.map(s => s.weight));
          if (maxWeightThisSession > updatedPBs[pbIdx].weight) {
            updatedPBs[pbIdx] = {
              ...updatedPBs[pbIdx],
              weight: maxWeightThisSession,
              date: today,
              history: [...updatedPBs[pbIdx].history, { weight: maxWeightThisSession, date: today }]
            };
          }
        }
      }
    });

    const newLog: DailyLog = {
      date: today,
      steps: 0, water: 0, caloriesConsumed: 0, proteinConsumed: 0, carbsConsumed: 0, fatsConsumed: 0,
      workoutCompleted: true, exerciseLogs, workoutId: currentClient.plan.workoutSplit[currentClient.currentWorkoutIndex].id
    };

    setClients(prev => prev.map(c => c.id === currentClientId ? { 
      ...c, 
      currentWorkoutIndex: nextIndex,
      logs: [newLog, ...c.logs],
      personalBests: updatedPBs
    } : c));
    setActiveTab('client-dashboard');
  };

  const renderContent = () => {
    if (role === 'COACH') {
      return <CoachDashboard 
        clients={clients} 
        pendingClient={clients.find(c => c.planStatus === 'CONSULTATION_SUBMITTED') || null} 
        onFinalise={handleFinaliseProtocol} 
        onSendReview={handleSendReview}
        isLoading={isLoading} 
      />;
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') return <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />;

    if (currentClient.planStatus === 'CONSULTATION_SUBMITTED') {
      return (
        <div className="max-w-3xl mx-auto text-center py-24 px-4">
          <div className="mb-10 inline-flex items-center justify-center w-28 h-28 rounded-full bg-slate-900 border-4 border-cyan-500 cyan-glow animate-pulse"><span className="text-5xl">🧬</span></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">Building Protocol</h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">Coach Arjun is analyzing your biometrics to build your bespoke 12-week protocol. Your elite roadmap is being synthesized.</p>
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
      case 'check-in':
        return <WeeklyCheckInForm onSubmit={handleCheckInSubmit} />;
      case 'performance':
        return <WeeklyReviewView reviews={currentClient.checkIns.filter(c => c.review).map(c => c.review!)} />;
      case 'concierge': 
        return <MuskyFitSupport client={currentClient} />;
      case 'vault': 
        return <MuskyFitVault />;
      case 'photos': 
        return <TransformationHub photos={currentClient.photos} onUpload={(p) => setClients(prev => prev.map(c => c.id === currentClientId ? {...c, photos: [...c.photos, p]} : c))} />;
      case 'strength':
        return <StrengthMatrix pbs={currentClient.personalBests || []} />;
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
          <div className="space-y-10 px-4 md:px-0 pb-32 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Status Dashboard</h2>
                  <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Executive Performance Cockpit</p>
               </div>
               <div className="bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800 text-right">
                  <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Active Goal</p>
                  <p className="text-xs font-black text-white italic">{currentClient.intake?.goal.replace(/_/g, ' ')}</p>
               </div>
            </div>

            <ReadinessHUD score={88} sleep={currentClient.checkIns[0]?.sleepHours || 7.5} stress={currentClient.checkIns[0]?.stressLevel > 5 ? 'High' : 'Optimal'} />

            <div className="grid lg:grid-cols-2 gap-8">
              <ClientProgressSummary logs={currentClient.logs} />
              
              <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col justify-between">
                 <div>
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Next Protocol Session</h4>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">
                       {currentClient.plan?.workoutSplit[currentClient.currentWorkoutIndex].title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                       Session {currentClient.currentWorkoutIndex + 1} of {currentClient.plan?.workoutSplit.length}. Optimized for V-Taper aesthetics.
                    </p>
                 </div>
                 <button 
                   onClick={() => setActiveTab('workout')}
                   className="mt-8 w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-xl italic"
                 >
                   Initiate Training Protocol
                 </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div onClick={() => setActiveTab('performance')} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 hover:border-cyan-500 transition cursor-pointer text-center group">
                 <span className="text-2xl mb-3 block">📈</span>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition">View Performance Review</p>
              </div>
              <div onClick={() => setActiveTab('strength')} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 hover:border-cyan-500 transition cursor-pointer text-center group">
                 <span className="text-2xl mb-3 block">⚔️</span>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition">Strength Matrix Stats</p>
              </div>
              <div onClick={() => setActiveTab('vault')} className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 hover:border-cyan-500 transition cursor-pointer text-center group">
                 <span className="text-2xl mb-3 block">🔐</span>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400 transition">Access MuskyFit Vault</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation role={role} setRole={setRole} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-10">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
