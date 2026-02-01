import React, { useState } from 'react';
import { searchUniversalFood } from '../services/geminiService';
import { MacroSplit, DailyLog, MealCategory, LoggedFood, FoodItem } from '../types';

interface DailyLoggingProps {
  onSave: (log: DailyLog) => void;
  targetMacros?: MacroSplit;
}

const DailyLogging: React.FC<DailyLoggingProps> = ({ onSave, targetMacros = { calories: 2400, p: 180, c: 220, f: 70 } }) => {
  const [steps, setSteps] = useState(8000);
  const [selectedFoods, setSelectedFoods] = useState<LoggedFood[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<MealCategory | null>(null);

  const totals = selectedFoods.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    p: acc.p + f.protein,
    c: acc.c + f.carbs,
    f: acc.f + f.fats
  }), { calories: 0, p: 0, c: 0, f: 0 });

  const handleAiSearch = async () => {
    if (!searchTerm.trim() || !currentMeal) return;
    setIsAiSearching(true);
    const result = await searchUniversalFood(searchTerm);
    if (result) {
      setSelectedFoods(prev => [...prev, { ...result, logId: Date.now(), category: currentMeal }]);
      setSearchTerm('');
      setCurrentMeal(null);
    }
    setIsAiSearching(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 space-y-8 px-4">
      <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 text-center">
        <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2 italic">Energy Management</p>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{totals.calories} / {targetMacros.calories} kcal</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] as MealCategory[]).map(meal => (
          <div key={meal} className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-500 uppercase">{meal}</h3>
              <button onClick={() => setCurrentMeal(meal)} className="text-[10px] font-black text-cyan-500 uppercase">+ Add</button>
            </div>
            <div className="space-y-2">
              {selectedFoods.filter(f => f.category === meal).map(f => (
                <div key={f.logId} className="flex justify-between text-xs text-white bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span>{f.name}</span>
                  <span className="font-black">{f.calories}kcal</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {currentMeal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
            <h3 className="text-xl font-black text-white italic uppercase mb-6">Log {currentMeal}</h3>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search food..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none mb-6" />
            <div className="flex gap-4">
              <button onClick={() => setCurrentMeal(null)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-xl font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleAiSearch} disabled={isAiSearching} className="flex-2 py-4 bg-cyan-600 text-white rounded-xl font-black uppercase text-[10px]">
                {isAiSearching ? 'Identifying...' : 'Search AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => onSave({ date: new Date().toISOString().split('T')[0], steps, water: 2, caloriesConsumed: totals.calories, proteinConsumed: totals.p, carbsConsumed: totals.c, fatsConsumed: totals.f, workoutCompleted: false, foods: selectedFoods })} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl border-4 border-slate-900 italic">
        Sync Log
      </button>
    </div>
  );
};

export default DailyLogging;
