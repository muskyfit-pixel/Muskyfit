import React, { useState } from 'react';
import { FOOD_DATABASE } from '../constants';
import { searchUniversalFood } from '../services/geminiService';
import { MacroSplit, DailyLog, MealCategory, LoggedFood, FoodItem } from '../types';

interface DailyLoggingProps {
  onSave: (log: DailyLog) => void;
  targetMacros?: MacroSplit;
  initialFoods?: LoggedFood[];
}

const DailyLogging: React.FC<DailyLoggingProps> = ({ 
  onSave, 
  targetMacros = { calories: 2400, p: 180, c: 220, f: 70 },
  initialFoods = []
}) => {
  const [steps, setSteps] = useState(8000);
  const [water, setWater] = useState(2.0); 
  const [selectedFoods, setSelectedFoods] = useState<LoggedFood[]>(initialFoods);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLoggingMeal, setCurrentLoggingMeal] = useState<MealCategory | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [rituals, setRituals] = useState({ mobility: false, supplements: false, morningSunlight: false, noPhoneBeforeBed: false });

  const totals = selectedFoods.reduce((acc, f) => ({
    calories: acc.calories + (f.calories || 0),
    p: acc.p + (f.protein || 0),
    c: acc.c + (f.carbs || 0),
    f: acc.f + (f.fats || 0)
  }), { calories: 0, p: 0, c: 0, f: 0 });

  const remaining = (targetMacros?.calories || 2400) - totals.calories;

  const handleAddFood = (food: FoodItem, category?: MealCategory) => {
    const targetCategory = category || currentLoggingMeal;
    if (!targetCategory) return;
    const logged: LoggedFood = { ...food, logId: Date.now(), category: targetCategory };
    setSelectedFoods(prev => [...prev, logged]);
    setSearchTerm('');
    setCurrentLoggingMeal(null);
  };

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsAiSearching(true);
    try {
      const result = await searchUniversalFood(searchTerm);
      if (result) handleAddFood(result);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4 sm:px-0">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-20 z-40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
             <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                   <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                   <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className={`${remaining >= 0 ? 'text-cyan-500' : 'text-red-500'} transition-all`} strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - Math.min(totals.calories / (targetMacros.calories || 2400), 1))} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <p className="text-xs font-black text-slate-500 uppercase leading-none">Left</p>
                   <p className="text-xl font-black text-white leading-none mt-1">{remaining}</p>
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Daily Intake</p>
                <p className="text-3xl font-black text-white">{totals.calories}<span className="text-xs text-slate-600 ml-1">kcal</span></p>
             </div>
          </div>
          <div className="flex flex-col items-end gap-2">
             <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Steps</label>
             <input type="number" value={steps} onChange={e => setSteps(Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-black text-center outline-none w-32" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
         <div className="md:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 h-fit">
            <h3 className="text-sm font-black text-white italic uppercase tracking-tighter mb-6">High-Performance Rituals</h3>
            <div className="space-y-3">
               {[
                 { id: 'mobility', label: 'Mobility Routine', icon: '🧘' },
                 { id: 'supplements', label: 'Daily Supplements', icon: '💊' },
                 { id: 'morningSunlight', label: 'Morning Sunlight', icon: '☀️' },
                 { id: 'noPhoneBeforeBed', label: 'Digital Sunset', icon: '📱' }
               ].map(r => (
                  <button key={r.id} onClick={() => setRituals(prev => ({ ...prev, [r.id]: !(prev as any)[r.id] }))} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${(rituals as any)[r.id] ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                     <span className="text-[10px] font-black uppercase tracking-widest">{r.label}</span>
                     <span>{r.icon}</span>
                  </button>
               ))}
            </div>
         </div>
         <div className="md:col-span-8 space-y-6">
            {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] as MealCategory[]).map((sectionId) => {
              const sectionFoods = selectedFoods.filter(f => f.category === sectionId);
              return (
                <div key={sectionId} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
                  <div className="px-8 py-5 flex justify-between items-center bg-slate-950/50 border-b border-slate-800">
                    <h3 className="text-xs font-black text-white italic uppercase">{sectionId}</h3>
                    <p className="text-sm font-black text-cyan-500">{sectionFoods.reduce((acc, f) => acc + f.calories, 0)} kcal</p>
                  </div>
                  <div className="p-4">
                    {sectionFoods.map(food => (
                      <div key={food.logId} className="p-4 bg-slate-950 rounded-xl mb-2 flex justify-between items-center border border-slate-800">
                        <p className="text-xs font-bold text-white">{food.name}</p>
                        <button onClick={() => setSelectedFoods(prev => prev.filter(f => f.logId !== food.logId))} className="text-red-500">×</button>
                      </div>
                    ))}
                    <button onClick={() => setCurrentLoggingMeal(sectionId)} className="w-full text-center py-4 text-[9px] font-black text-cyan-500 uppercase tracking-widest border-2 border-dashed border-slate-800 rounded-xl hover:border-cyan-500">+ Add Food</button>
                  </div>
                </div>
              );
            })}
         </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-6">
        <button onClick={() => onSave({ date: new Date().toISOString().split('T')[0], steps, water, caloriesConsumed: totals.calories, proteinConsumed: totals.p, carbsConsumed: totals.c, fatsConsumed: totals.f, workoutCompleted: false, foods: selectedFoods, rituals })} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-cyan-500 hover:text-white transition-all italic border-4 border-slate-900">
          Sync Day Log
        </button>
      </div>

      {currentLoggingMeal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl p-6 overflow-y-auto">
           <div className="max-w-4xl mx-auto py-12">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Logging {currentLoggingMeal}</h2>
                 <button onClick={() => setCurrentLoggingMeal(null)} className="text-slate-500 text-4xl">&times;</button>
              </div>
              <div className="flex gap-4 mb-8">
                <input autoFocus type="text" placeholder="Search Staples or AI..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSearch()} className="flex-1 p-6 bg-slate-900 border border-slate-700 rounded-2xl text-white outline-none focus:border-cyan-500" />
                <button onClick={handleAiSearch} disabled={isAiSearching || !searchTerm} className="px-8 py-4 bg-cyan-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">AI Check</button>
              </div>
              <div className="grid gap-4">
                  {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8).map(food => (
                    <button key={food.id} onClick={() => handleAddFood(food)} className="w-full text-left p-6 bg-slate-900 hover:bg-slate-800 rounded-2xl flex justify-between items-center transition-all border border-slate-800">
                      <div><p className="font-bold text-white">{food.name}</p><p className="text-[8px] text-slate-500 uppercase">{food.servingSize}</p></div>
                      <p className="text-xl font-black text-white">{food.calories} kcal</p>
                    </button>
                  ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogging;
