
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
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Metabolic Status</p>
          <h2 className="text-4xl font-bold text-white italic tracking-tighter">{totals.calories} <span className="text-slate-700 text-xl font-normal">/ {targetMacros.calories} kcal</span></h2>
        </div>
        <div className="flex gap-2">
           <div className="text-center px-5 py-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Protein</p>
              <p className="text-sm font-bold text-cyan-500 italic">{totals.p}g</p>
           </div>
           <div className="text-center px-5 py-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Carbs</p>
              <p className="text-sm font-bold text-white italic">{totals.c}g</p>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] as MealCategory[]).map(cat => (
          <div key={cat} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{cat}</h3>
              <button onClick={() => setCurrentMeal(cat)} className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-500 hover:bg-cyan-600 hover:text-white transition shadow-lg">+</button>
            </div>
            <div className="space-y-2">
              {selectedFoods.filter(f => f.category === cat).map(f => (
                <div key={f.logId} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between text-xs font-bold italic shadow-sm">
                  <span className="text-slate-300">{f.name}</span>
                  <span className="text-cyan-500">{f.calories} kcal</span>
                </div>
              ))}
              {selectedFoods.filter(f => f.category === cat).length === 0 && (
                <p className="text-[10px] text-slate-700 italic py-2 text-center">Nothing logged</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentMeal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-6 italic uppercase tracking-tighter">Log {currentMeal}</h3>
            <input 
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="E.g. 200g Lean Lamb Chops..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white outline-none mb-6 focus:border-cyan-500 transition-colors"
            />
            <div className="flex gap-3">
               <button onClick={handleAiSearch} disabled={isSearching} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-lg hover:bg-cyan-500 hover:text-white transition-all">{isSearching ? 'Analysing...' : 'AI Search'}</button>
               <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-4 bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-lg hover:border-cyan-500 transition-all">Photo Scan</button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            <button onClick={() => setCurrentMeal(null)} className="w-full mt-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
         <button 
           onClick={() => onSave({ date: new Date().toISOString(), steps: 10000, caloriesConsumed: totals.calories, proteinConsumed: totals.p, carbsConsumed: totals.c, fatsConsumed: totals.f, workoutCompleted: false, foods: selectedFoods })}
           className="w-full py-5 bg-cyan-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_40px_rgba(6,182,212,0.3)] hover:bg-cyan-500 transition-all italic text-xs"
         >
           Save Daily Protocol
         </button>
      </div>
    </div>
  );
};

export default DailyLogging;
