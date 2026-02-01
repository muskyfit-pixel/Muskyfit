
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
import { Client, IntakeData, ExerciseLog, DailyLog, WeeklyCheckIn, WeeklyReview, PersonalBest } from './types';

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
    setActiveTab('client-dashboard');
  };

  const handleWorkoutFinish = (exerciseLogs: ExerciseLog[]) => {
    if (!currentClient || !currentClient.plan) return;
    const workoutCount = currentClient.plan.workoutSplit.length;
    const nextIndex = (currentClient.currentWorkoutIndex + 1) % workoutCount;
    
    // Check for PBs
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
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">Your coach is analyzing your biometrics to build your bespoke 12-week protocol. Please stand by.</p>
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
          <div className="space-y-10 px
