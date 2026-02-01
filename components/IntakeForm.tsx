
import React, { useState } from 'react';
import { IntakeData, Gender } from '../types';

interface IntakeFormProps {
  onSubmit: (data: IntakeData) => void;
  isLoading: boolean;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<IntakeData>({
    name: '', email: '', phone: '', dob: '', gender: 'MALE',
    weight: 75, height: 175, heartCondition: false, chestPainActivity: false,
    chestPainRest: false, dizzinessLossBalance: false, boneJointProblem: false,
    bloodPressureMedication: false, otherReasonNoExercise: false, pregnant: false,
    chronicCondition: false, currentMedications: '', activityLevel: 'Moderately Active',
    jobType: 'Desk', sleepQuality: 'Average', stressLevel: 'Moderate',
    trainingDaysPerWeek: 4, goal: 'FAT_LOSS', dietPreference: 'NON_VEG',
    culturalPreference: 'INDIAN', religiousExclusions: '', allergies: '',
    injuries: '', trainingHistory: ''
  });

  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 rounded-[3rem] border border-slate-800 p-10 shadow-2xl mb-20 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-2 italic uppercase metallic-text">MuskyFit Application</h2>
        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.4em] italic mt-2">Elite Lifestyle Protocol</p>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500 transition" placeholder="Enter your name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="NON_BINARY">Other/Prefer not to say</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500" />
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] shadow-xl hover:bg-cyan-500 hover:text-white transition-all">Next Phase</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Primary Objective</label>
            <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500">
              <option value="FAT_LOSS">Fat Loss & Aesthetic Definition</option>
              <option value="MUSCLE_GAIN">Hypertrophy & Athletic Build</option>
              <option value="LONGEVITY_HEALTH">Longevity & Metabolic Health (30+)</option>
              <option value="STRENGTH">Functional Power & Resilience</option>
              <option value="ATHLETIC_PERFORMANCE">Peak Sport Conditioning</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Lifestyle Environment</label>
            <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-cyan-500">
              <option value="Desk">Corporate / High Stress Desk</option>
              <option value="Active">Mobile / On-the-go</option>
              <option value="Physical Labour">High Intensity Physical</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl text-[10px]">Back</button>
            <button onClick={() => onSubmit(formData)} disabled={isLoading} className="flex-[2] py-5 bg-cyan-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] shadow-xl hover:bg-cyan-500 transition-all">
              {isLoading ? 'Engineering Protocol...' : 'Finalise Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntakeForm;
