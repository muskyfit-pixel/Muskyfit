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

  const renderContent = () => {
    if (role === 'COACH') {
      return <CoachDashboard clients={clients} pendingClient={clients.find(c => c.planStatus === 'CONSULTATION_SUBMITTED') || null} onFinalise={() => {}} isLoading={isLoading} />;
    }
    
    if (!currentClient || currentClient.planStatus === 'NONE') return <IntakeForm onSubmit={handleIntakeSubmit} isLoading={isLoading} />;

    switch (activeTab) {
      case 'log': return <DailyLogging onSave={(log) => {}} targetMacros={currentClient.plan?.trainingDayMacros} />;
      case 'workout': return <WorkoutTracker currentWorkout={currentClient.plan?.workoutSplit[0]!} previousProgress={{}} onFinish={() => setActiveTab('client-dashboard')} />;
      case 'concierge': return <MuskyFitSupport client={currentClient} />;
      case 'vault': return <MuskyFitVault />;
      case 'photos': return <TransformationHub photos={currentClient.photos} onUpload={() => {}} />;
      default: return (
        <div className="space-y-10 px-4 md:px-0">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
             <ReadinessHUD score={85} sleep={7.5} stress="Low" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
             <button onClick={() => setActiveTab('workout')} className="p-8 bg-white rounded-3xl text-black font-black italic uppercase text-left hover:scale-105 transition">Train</button>
             <button onClick={() => setActiveTab('log')} className="p-8 bg-cyan-600 rounded-3xl text-white font-black italic uppercase text-left hover:scale-105 transition">Macros</button>
             <button onClick={() => setActiveTab('concierge')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white font-black italic uppercase text-left hover:scale-105 transition">Concierge</button>
             <button onClick={() => setActiveTab('vault')} className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white font-black italic uppercase text-left hover:scale-105 transition">Vault</button>
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
