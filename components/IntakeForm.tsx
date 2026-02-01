
import React, { useState } from 'react';
import { IntakeData, Gender } from '../types';

interface IntakeFormProps {
  onSubmit: (data: IntakeData) => void;
  isLoading: boolean;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<IntakeData>({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'MALE',
    weight: 75,
    height: 175,
    heartCondition: false,
    chestPainActivity: false,
    chestPainRest: false,
    dizzinessLossBalance: false,
    boneJointProblem: false,
    bloodPressureMedication: false,
    otherReasonNoExercise: false,
    pregnant: false,
    chronicCondition: false,
    currentMedications: '',
    activityLevel: 'Moderately Active',
    jobType: 'Desk',
    sleepQuality: 'Average',
    stressLevel: 'Moderate',
    trainingDaysPerWeek: 3,
    goal: 'FAT_LOSS',
    dietPreference: 'NON_VEG',
    culturalPreference: 'INDIAN',
    religiousExclusions: '',
    allergies: '',
    injuries: '',
    trainingHistory: ''
  });

  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(prev => prev - 1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden mb-20 animate-in fade-in duration-1000">
      <div className="p-12 md:p-16">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black metallic-text tracking-tighter mb-2 uppercase italic">Join MuskyFit</h2>
          <p className="text-cyan-500 font-bold text-[10px] uppercase tracking-[0.5em]">The Elite Team Protocol</p>
        </div>

        <div className="flex gap-3 mb-16 px-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-1000 ${step >= i ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-800'}`} />
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black text-white italic">1. Identity</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sarah J." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Gender Identity</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'] as Gender[]).map((g) => (
                    <button 
                      key={g}
                      onClick={() => setFormData({...formData, gender: g})} 
                      className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-cyan-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}
                    >
                      {g.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all" />
              </div>
            </div>
            <button onClick={nextStep} disabled={!formData.name || !formData.dob} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-cyan-400 hover:text-white transition-all shadow-xl disabled:opacity-30">Continue to Biometrics</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black text-white italic">2. Biometrics</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Height (cm)</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={nextStep} className="flex-2 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em]">Next: Health</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black text-white italic">3. Medical Clearance</h3>
            <div className="space-y-4">
              {[
                { name: 'heartCondition', label: 'Any history of heart issues?' },
                { name: 'chestPainActivity', label: 'Chest pain during physical exertion?' },
                { name: 'boneJointProblem', label: 'Existing bone/joint issues?' },
                { name: 'bloodPressureMedication', label: 'Taking blood pressure medication?' },
                { name: 'pregnant', label: 'Are you currently pregnant?' }
              ].map(q => (
                <label key={q.name} className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-700 transition-all group">
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{q.label}</span>
                  <input type="checkbox" name={q.name} checked={(formData as any)[q.name]} onChange={handleChange} className="w-6 h-6 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0" />
                </label>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={nextStep} className="flex-2 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em]">Lifestyle Audit</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black text-white italic">4. Lifestyle Audit</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Typical Work Day</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="Desk">Office / Remote Desk</option>
                  <option value="Active">On My Feet / Retail / Service</option>
                  <option value="Physical Labour">High Physical Activity</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Sleep Quality</label>
                <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="Poor">Poor (4-5 hours)</option>
                  <option value="Average">Average (6-7 hours)</option>
                  <option value="Good">Good (8+ hours)</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Training History & Injuries</label>
                <textarea name="trainingHistory" value={formData.trainingHistory} onChange={handleChange} placeholder="Tell me about your previous experience and any current injuries..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white h-32" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={nextStep} className="flex-2 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em]">Primary Objective</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black text-white italic">5. Your Elite Goal</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { id: 'FAT_LOSS', label: 'Fat Loss', sub: 'Lean & Toned', icon: '🔥' },
                { id: 'MUSCLE_GAIN', label: 'Hypertrophy', sub: 'Build Strength', icon: '💪' },
                { id: 'LONGEVITY_HEALTH', label: 'Longevity', sub: 'Health & Vitality', icon: '🧬' },
                { id: 'ATHLETIC_PERFORMANCE', label: 'Athleticism', sub: 'Speed & Power', icon: '⚡' }
              ].map(g => (
                <button 
                  key={g.id}
                  onClick={() => setFormData({...formData, goal: g.id as any})}
                  className={`p-8 rounded-[2rem] border text-left transition-all ${formData.goal === g.id ? 'bg-cyan-600 border-cyan-400 text-white shadow-2xl' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  <span className="text-3xl mb-4 block">{g.icon}</span>
                  <p className="text-xs font-black uppercase tracking-widest mb-1">{g.label}</p>
                  <p className="text-[10px] opacity-70 font-medium">{g.sub}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={nextStep} className="flex-2 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em]">Fueling Strategy</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-3xl font-black text-white italic">6. Fueling Strategy</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Diet Style</label>
                <select name="dietPreference" value={formData.dietPreference} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="NON_VEG">Standard (Meat Eater)</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="VEGAN">Plant-Based / Vegan</option>
                  <option value="PESCATARIAN">Pescatarian</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Exclusions</label>
                <input type="text" name="religiousExclusions" value={formData.religiousExclusions} onChange={handleChange} placeholder="e.g. No Pork, Halal Only..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Food Culture Context</label>
                <select name="culturalPreference" value={formData.culturalPreference} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="WESTERN">Global / Western</option>
                  <option value="INDIAN">South Asian / Indian</option>
                  <option value="MIXED">Mixed / Fusion</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={() => onSubmit(formData)} disabled={isLoading} className="flex-2 bg-cyan-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-cyan-500 transition-all">
                {isLoading ? 'Synthesizing Protocol...' : 'Finalize & Join Team'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntakeForm;
