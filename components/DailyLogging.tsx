
import React, { useState, useRef } from 'react';
import { searchUniversalFood, analyzeMealPhoto } from '../services/geminiService';
import { DailyLog, MealCategory, LoggedFood, MacroSplit } from '../types';

interface DailyLoggingProps {
  onSave: (log: DailyLog) => void;
  targetMacros?: MacroSplit;
}

const DailyLogging: React.FC<DailyLoggingProps> = ({ onSave, targetMacros = { calories: 2400, p: 180, c: 220, f: 70 } }) => {
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
      // Specifically hint for UK/Asian nutrition to Gemini for MuskyFit
      const res = await searchUniversalFood(`${searchTerm} UK nutrition values for Asian male diet`);
      if (res) {
        // We add missing mandatory fields like 'id' and 'servingSize' to satisfy the Type system
        const newFood: LoggedFood = {
          id: 'ai_' + Date.now(),
          logId: Date.now(),
          name: res.name || searchTerm,
          calories: res.calories || 0,
          protein: res.protein || 0,
          carbs: res.carbs || 0,
          fats: res.fats || 0,
          servingSize: res.servingSize || '1 portion',
          category: currentMeal
        };
        setSelectedFoods(prev => [...prev, newFood]);
      }
      setSearchTerm('');
      setCurrentMeal(null);
    } catch (err) {
      console.error("MuskyFit AI Search failed", err);
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
      try {
        const res = await analyzeMealPhoto(base64);
        if (res) {
          const newFood: LoggedFood = {
            id: 'photo_' + Date.now(),
            logId: Date.now(),
            name: res.name || 'Analyzed Meal',
            calories: res.calories || 0,
            protein: res.protein || 0,
            carbs: res.carbs || 0,
            fats: res.fats || 0,
            servingSize: res.servingSize || 'As pictured',
            category: currentMeal
          };
          setSelectedFoods(prev => [...prev, newFood]);
        }
      } catch (err) {
        console.error("Photo analysis failed", err);
      } finally {
        setCurrentMeal(null);
        setIsSearching(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-48 px-2 animate-in fade-in duration-700">
      {/* HUD: Macro Summary - The Dashboard of the Protocol */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">Nutrient Density Status</p>
          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
            {totals.calories} 
            <span className="text-slate-700 text-xl font-normal ml-2">/ {targetMacros.calories} kcal</span>
          </h2>
        </div>
        <div className="flex gap-3">
           <div className="text-center px-5 py-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Protein</p>
              <p className="text-lg font-black text-cyan-500 italic">{totals.p}g</p>
           </div>
           <div className="text-center px-5 py-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Carbs</p>
              <p className="text-lg font-black text-white italic">{totals.c}g</p>
           </div>
           <div className="text-center px-5 py-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Fats</p>
              <p className="text-lg font-black text-slate-400 italic">{totals.f}g</p>
           </div>
        </div>
      </div>

      {/* Meal Slots with MuskyFit Styling */}
      <div className="grid md:grid-cols-2 gap-6">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] as MealCategory[]).map(cat => (
          <div key={cat} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg group hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">{cat}</h3>
              <button 
                onClick={() => setCurrentMeal(cat)} 
                className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-cyan-500 hover:bg-cyan-600 hover:text-white transition shadow-lg font-bold"
              >
                +
              </button>
            </div>
            <div className="space-y-3">
              {selectedFoods.filter(f => f.category === cat).map(f => (
                <div key={f.logId} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs font-bold italic shadow-sm group/item">
                  <div className="flex flex-col">
                    <span className="text-slate-300">{f.name}</span>
                    <span className="text-[10px] text-slate-600 font-normal">{f.servingSize} | P: {f.protein}g</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-500">{f.calories} kcal</span>
                    <button 
                      onClick={() => setSelectedFoods(prev => prev.filter(item => item.logId !== f.logId))}
                      className="text-red-900 hover:text-red-500 transition-colors px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {selectedFoods.filter(f => f.category === cat).length === 0 && (
                <p className="text-[11px] text-slate-700 italic py-4 text-center tracking-widest uppercase">Protocol Pending</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Modal */}
      {currentMeal && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-[60] flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-white mb-8 italic uppercase tracking-tighter">Log {currentMeal}</h3>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="E.g. 200g Lean Tandoori Chicken breast..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white outline-none mb-8 focus:border-cyan-500 transition-all text-lg font-medium"
            />
            <div className="flex gap-4">
               <button 
                onClick={handleAiSearch} 
                disabled={isSearching} 
                className="flex-1 py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] shadow-xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50"
               >
                 {isSearching ? 'Analysing...' : 'AI Search'}
               </button>
               <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-1 py-5 bg-slate-800 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] shadow-xl hover:border-cyan-500 transition-all"
               >
                 Photo Scan
               </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            <button 
              onClick={() => { setCurrentMeal(null); setSearchTerm(''); }} 
              className="w-full mt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Persistent Save Button */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-6">
         <button 
           onClick={() => {
             onSave({ 
               date: new Date().toISOString(), 
               steps: 10000, 
               caloriesConsumed: totals.calories, 
               proteinConsumed: totals.p, 
               carbsConsumed: totals.c, 
               fatsConsumed: totals.f, 
               workoutCompleted: false, 
               foods: selectedFoods 
             });
             alert("Protocol Committed to History.");
           }}
           className="w-full py-6 bg-cyan-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_25px_50px_rgba(6,182,212,0.4)] hover:bg-cyan-500 transition-all italic text-[11px] border border-cyan-400/30"
         >
           Commit Daily Protocol
         </button>
      </div>
    </div>
  );
};

export default DailyLogging;
v
