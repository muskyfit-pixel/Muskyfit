
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
    trainingDaysPerWeek: 4,
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
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden mb-20">
      <div className="p-10 md:p-16">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-black metallic-text tracking-tighter mb-4 uppercase italic">INTAKE PROTOCOL</h2>
          <p className="text-cyan-500 font-bold text-[10px] uppercase tracking-[0.5em]">Defining Your Genetic Potential</p>
        </div>

        <div className="flex gap-2 mb-16">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-800 relative overflow-hidden">
               <div className={`absolute inset-0 bg-cyan-500 transition-all duration-700 ${step >= i ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">01 Identity & Contact</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Maya Sharma" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Biological Identity</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MALE', 'FEMALE'] as Gender[]).map((g) => (
                    <button 
                      key={g}
                      type="button"
                      onClick={() => setFormData({...formData, gender: g})} 
                      className={`py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email (Reports Delivery)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white" />
              </div>
            </div>
            <button onClick={nextStep} disabled={!formData.name || !formData.email} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-white transition-all shadow-xl disabled:opacity-20 border-b-4 border-slate-300">Proceed to Lifestyle</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">02 Professional Lifestyle</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Corporate Stress</label>
                <select name="stressLevel" value={formData.stressLevel} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="Low">Zen (Balanced)</option>
                  <option value="Moderate">Moderate (Busy Professional)</option>
                  <option value="High">Intense (Executive Level)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Sleep Profile</label>
                <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="Poor">Restless (4-5h)</option>
                  <option value="Average">Decent (6-7h)</option>
                  <option value="Good">Optimal (8h+)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] border-b-4 border-slate-300">Define Objective</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">03 Primary Objective</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'FAT_LOSS', label: 'Fat Loss', sub: 'Lean & Athletic', icon: '🔥' },
                { id: 'MUSCLE_GAIN', label: 'Hypertrophy', sub: 'Structural Density', icon: '🦾' },
                { id: 'LONGEVITY_HEALTH', label: 'Longevity', sub: 'Executive Health', icon: '🧬' },
                { id: 'ATHLETIC_PERFORMANCE', label: 'Performance', sub: 'Elite Athleticism', icon: '⚡' }
              ].map(g => (
                <button 
                  key={g.id}
                  onClick={() => setFormData({...formData, goal: g.id as any})}
                  className={`p-10 rounded-[2.5rem] border text-left transition-all relative overflow-hidden group ${formData.goal === g.id ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  <span className="text-4xl mb-6 block group-hover:scale-110 transition duration-500">{g.icon}</span>
                  <p className="text-xs font-black uppercase tracking-[0.2em] mb-1">{g.label}</p>
                  <p className="text-[10px] opacity-70 font-bold italic">{g.sub}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] border-b-4 border-slate-300">Fueling Design</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">04 Fueling & Nutrition</h3>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Dietary Preference</label>
                <select name="dietPreference" value={formData.dietPreference} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="NON_VEG">Standard (Non-Veg)</option>
                  <option value="VEGETARIAN">Vegetarian (Pure)</option>
                  <option value="VEGAN">Plant-Based (Vegan)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Food Culture Context</label>
                <select name="culturalPreference" value={formData.culturalPreference} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white">
                  <option value="INDIAN">South Asian / Indian Staples</option>
                  <option value="WESTERN">Global / Western Cuisines</option>
                  <option value="MIXED">Fusion / Corporate Lunching</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button onClick={nextStep} className="flex-[2] bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] border-b-4 border-slate-300">Final Validation</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">05 Final Commitment</h3>
            <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 space-y-6">
              <p className="text-sm text-slate-400 italic leading-relaxed">
                "I confirm that all biometric and medical data provided is accurate. I am ready to commit to the MUSKYFIT protocol for the next 12 weeks to achieve my professional physical peak."
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-cyan-600/20 border border-cyan-500 flex items-center justify-center text-cyan-500">✓</div>
                 <div>
                    <p className="text-xs font-black text-white uppercase">{formData.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol Enrolment Pending</p>
                 </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 bg-slate-800 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest">Back</button>
              <button 
                onClick={() => onSubmit(formData)} 
                disabled={isLoading} 
                className="flex-[2] bg-cyan-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-cyan-500 transition-all border-b-4 border-cyan-900"
              >
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
