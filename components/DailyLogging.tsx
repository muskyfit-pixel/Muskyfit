
import React, { useState, useRef } from 'react';
import { searchUniversalFood, analyzeMealPhoto } from '../services/geminiService';
import { DailyLog, MealCategory, LoggedFood, MacroSplit } from '../types';

interface DailyLoggingProps {
  onSave: (log: DailyLog) => void;
  targetMacros?: MacroSplit;
}

const DailyLogging: React.FC<DailyLoggingProps> = ({ onSave, targetMacros = { calories: 2500, p: 200, c: 250, f: 80 } }) => {
  const [selectedFoods, setSelectedFoods] = useState<LoggedFood[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<MealCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totals = selectedFoods.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    p: acc.p + f.protein,
    c: acc.c + f.carbs,
    f: acc.f + f.fats
  }), { calories: 0, p: 0, c: 0, f: 0 });

  const handleAiSearch = async () => {
    if (!searchTerm.trim() || !currentMeal) return;
    setIsSearching(true);
    try {
      const res = await searchUniversalFood(searchTerm);
      if (res) setSelectedFoods(prev => [...prev, { ...res, logId: Date.now(), category: currentMeal }]);
      setSearchTerm('');
      setCurrentMeal(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentMeal) return;
    setIsSearching(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const res = await analyzeMealPhoto(base64);
      if (res) setSelectedFoods(prev => [...prev, { ...res, logId: Date.now(), category: currentMeal }]);
      setCurrentMeal(null);
      setIsSearching(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-40 px-4 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Energy Progress</p>
          <h2 className="text-4xl font-bold text-white italic">{totals.calories} <span className="text-slate-700 text-xl font-normal">/ {targetMacros.calories} kcal</span></h2>
        </div>
        <div className="flex gap-2">
           <div className="text-center px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
              <p className="text-[8px] font-black text-slate-600 uppercase">Protein</p>
              <p className="text-sm font-bold text-cyan-500">{totals.p}g</p>
           </div>
           <div className="text-center px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
              <p className="text-[8px] font-black text-slate-600 uppercase">Carbs</p>
              <p className="text-sm font-bold text-white">{totals.c}g</p>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] as MealCategory[]).map(cat => (
          <div key={cat} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{cat}</h3>
              <button onClick={() => setCurrentMeal(cat)} className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-500 hover:bg-cyan-600 hover:text-white transition">+</button>
            </div>
            <div className="space-y-2">
              {selectedFoods.filter(f => f.category === cat).map(f => (
                <div key={f.logId} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between text-xs font-bold italic">
                  <span className="text-slate-300">{f.name}</span>
                  <span className="text-cyan-500">{f.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {currentMeal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6 italic uppercase">Log {currentMeal}</h3>
            <input 
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="E.g. 200g Grilled Chicken Tandoori..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none mb-4"
            />
            <div className="flex gap-2">
               <button onClick={handleAiSearch} disabled={isSearching} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl text-xs">{isSearching ? 'Analysing...' : 'Search'}</button>
               <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-slate-800 text-white font-black uppercase tracking-widest rounded-xl text-xs">Photo Log</button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            <button onClick={() => setCurrentMeal(null)} className="w-full mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
         <button 
           onClick={() => onSave({ date: new Date().toISOString(), steps: 10000, caloriesConsumed: totals.calories, proteinConsumed: totals.p, carbsConsumed: totals.c, fatsConsumed: totals.f, workoutCompleted: false, foods: selectedFoods })}
           className="w-full py-4 bg-cyan-600 text-white font-black uppercase tracking-widest rounded-xl shadow-2xl hover:bg-cyan-500 transition"
         >
           Commit Daily Diary
         </button>
      </div>
    </div>
  );
};

export default DailyLogging;
