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
  const [weight, setWeight] = useState(0); 
  const [selectedFoods, setSelectedFoods] = useState<LoggedFood[]>(initialFoods);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentLoggingMeal, setCurrentLoggingMeal] = useState<MealCategory | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const totals = selectedFoods.reduce((acc, f) => ({
    calories: acc.calories + (f.calories || 0),
    p: acc.p + (f.protein || 0),
    c: acc.c + (f.carbs || 0),
    f: acc.f + (f.fats || 0)
  }), { calories: 0, p: 0, c: 0, f: 0 });

  const remaining = targetMacros.calories - totals.calories;

  const handleAddFood = (food: FoodItem, category?: MealCategory) => {
    const targetCategory = category || currentLoggingMeal;
    if (!targetCategory) return;
    
    const logged: LoggedFood = {
      ...food,
      logId: Date.now(),
      category: targetCategory,
    };

    setSelectedFoods(prev => [...prev, logged]);
    setSearchTerm('');
    setCurrentLoggingMeal(null);
  };

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsAiSearching(true);
    try {
      const result = await searchUniversalFood(searchTerm);
      if (result) {
        handleAddFood(result);
      } else {
        alert("Could not identify food. Try a simpler name.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiSearching(false);
    }
  };

  const stepPercent = Math.min((steps / 10000) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 px-4 sm:px-0">
      <div className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-20 z-40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
             <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                   <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                   <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className={`${stepPercent >= 100 ? 'text-green-500' : 'text-cyan-500'} transition-all duration-1000`} strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - stepPercent / 100)} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <p className="text-lg font-black text-white leading-none">{steps.toLocaleString()}</p>
                   <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-1">Steps</p>
                </div>
             </div>
             
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Discipline</p>
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${remaining >= 0 ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                   <p className="text-3xl font-black text-white">{remaining}<span className="text-xs text-slate-600 ml-1">kcal left</span></p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 flex flex-col items-center">
                <p className="text-[8px] font-black text-cyan-500 uppercase tracking-widest mb-1 italic">Weight</p>
                <input type="number" step="0.1" value={weight || ''} onChange={e => setWeight(Number(e.target.value))} className="w-16 bg-transparent text-white font-black text-xl text-center outline-none" placeholder="0.0" />
             </div>
             <button onClick={() => setSteps(steps + 1000)} className="px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black text-white">+1k Steps</button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] as MealCategory[]).map((sectionId) => {
          const sectionFoods = selectedFoods.filter(f => f.category === sectionId);
          const sTotal = sectionFoods.reduce((acc, f) => acc + f.calories, 0);

          return (
            <div key={sectionId} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-8 py-6 flex justify-between items-center bg-slate-950/50 border-b border-slate-800">
                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">{sectionId}</h3>
                <p className="text-xl font-black text-cyan-500">{sTotal} <span className="text-[10px] text-slate-500 uppercase">Kcal</span></p>
              </div>
              <div className="divide-y divide-slate-800/50">
                {sectionFoods.map(food => (
                  <div key={food.logId} className="px-8 py-5 flex justify-between items-center group">
                    <div>
                      <p className="text-sm font-bold text-white">{food.name}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase">P:{food.protein}g C:{food.carbs}g F:{food.fats}g</p>
                    </div>
                    <button onClick={() => setSelectedFoods(prev => prev.filter(f => f.logId !== food.logId))} className="text-red-500 text-lg font-black">×</button>
                  </div>
                ))}
                <button onClick={() => setCurrentLoggingMeal(sectionId)} className="w-full text-left px-8 py-4 text-xs font-black text-cyan-500 uppercase tracking-widest transition hover:bg-slate-800">+ Add Food</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-6">
        <button 
          onClick={() => onSave({ 
            date: new Date().toISOString().split('T')[0], 
            steps, 
            water, 
            caloriesConsumed: totals.calories, 
            proteinConsumed: totals.p, 
            carbsConsumed: totals.c, 
            fatsConsumed: totals.f, 
            workoutCompleted: false, 
            foods: selectedFoods 
          })} 
          className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-cyan-500 hover:text-white transition-all italic border-4 border-slate-900 active:scale-95"
        >
          Save Daily Logs
        </button>
      </div>

      {currentLoggingMeal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl p-6 md:p-12 overflow-y-auto">
           <div className="max-w-4xl mx-auto space-y-8 pb-20">
              <div className="flex justify-between items-center">
                 <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Logging {currentLoggingMeal}</h2>
                 <button onClick={() => setCurrentLoggingMeal(null)} className="text-slate-500 hover:text-white font-black text-4xl transition">×</button>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  autoFocus 
                  type="text" 
                  placeholder="Search Database or use AI..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                  className="flex-1 p-6 bg-slate-900 border border-slate-700 rounded-2xl text-white text-xl outline-none focus:border-cyan-500 transition-all shadow-inner" 
                />
                <button 
                  onClick={handleAiSearch} 
                  disabled={isAiSearching || !searchTerm} 
                  className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 transition-all shadow-lg"
                >
                  {isAiSearching ? 'Identifying...' : 'AI Identify'}
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Database Results</p>
                <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden divide-y divide-slate-800/50 shadow-2xl">
                    {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8).map(food => (
                      <button key={food.id} onClick={() => handleAddFood(food)} className="w-full text-left p-6 hover:bg-slate-800 flex justify-between items-center transition-colors group">
                        <div>
                          <p className="font-bold text-white text-lg group-hover:text-cyan-400 transition">{food.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{food.servingSize}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white italic">{food.calories}</p>
                          <p className="text-[8px] text-slate-600 font-black uppercase">Kcal</p>
                        </div>
                      </button>
                    ))}
                    {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                      <div className="p-12 text-center">
                        <p className="text-slate-500 italic text-sm">No exact matches in database. Use "AI Identify" for best results.</p>
                      </div>
                    )}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DailyLogging;
