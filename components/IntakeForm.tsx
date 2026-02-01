
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
    <div className="max-w-2xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2 italic uppercase">Client Intake</h2>
        <p className="text-sm text-slate-500">Please provide your details for your bespoke programme.</p>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="Enter your name" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white" placeholder="email@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white" />
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-500 hover:text-white transition">Next Step</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">What is your main goal?</label>
            <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white">
              <option value="FAT_LOSS">Fat Loss / Toning</option>
              <option value="MUSCLE_GAIN">Build Muscle / Strength</option>
              <option value="STRENGTH">Power / Strength</option>
              <option value="LONGEVITY_HEALTH">General Health & Longevity</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dietary Choice</label>
            <select name="dietPreference" value={formData.dietPreference} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white">
              <option value="NON_VEG">Eat Meat & Vegetables</option>
              <option value="VEGETARIAN">Vegetarian</option>
              <option value="VEGAN">Vegan</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-xl">Back</button>
            <button onClick={() => onSubmit(formData)} disabled={isLoading} className="flex-[2] py-4 bg-cyan-600 text-white font-bold rounded-xl">
              {isLoading ? 'Creating Plan...' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntakeForm;
