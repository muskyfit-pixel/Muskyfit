
import React, { useState, useRef } from 'react';
import { searchUniversalFood, analyzeMealPhoto } from '../services/geminiService';
import { MacroSplit, DailyLog, MealCategory, LoggedFood } from '../types';

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
  const [rituals, setRituals] = useState({ mobility: false, supplements: false, morningSunlight: false, noPhoneBeforeBed: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totals = selectedFoods.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    p: acc.p + f.protein,
    c: acc.c + f.carbs,
    f: acc.f + f.fats
  }), { calories: 0, p: 0, c: 0, f: 0 });

  const handleAiSearch = async () => {
    if (!searchTerm.trim() || !currentMeal) return;
    setIsAiSearching(true);
    try {
      const result = await searchUniversalFood(searchTerm);
      if (result) {
        setSelectedFoods(prev => [...prev, { ...result, logId: Date.now(), category: currentMeal }]);
        setSearchTerm('');
        setCurrentMeal(null);
      }
    } finally {
      setIsAiSearching(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentMeal) return;

    setIsAiSearching(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeMealPhoto(base64);
      if (result) {
        setSelectedFoods(prev => [...prev, { 
          id: 'v_' + Date.now(),
          name: result.name || 'Analyzed Meal',
          calories: result.calories || 0,
          protein: result.protein || 0,
          carbs: result.carbs || 0,
          fats: result.fats || 0,
          type: 'WESTERN',
          servingSize: result.servingSize || '1 portion',
          logId: Date.now(), 
          category: currentMeal 
        }]);
        setCurrentMeal(null);
      }
      setIsAiSearching(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto pb-40 space-y-8 px-4">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-center md:text-left">
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1 italic">Energy Balance</p>
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                 {totals.calories} <span className="text-slate-600">/</span> {targetMacros.calories}
              </h2>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-2">kCal Consumed Today</p>
           </div>
           <div className="flex gap-4">
              <div className="text-center bg-slate-950 p-4 rounded-2xl border border-slate-800 w-24">
                 <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Protein</p>
                 <p className="text-sm font-black text-white">{totals.p}g</p>
              </div>
              <div className="text-center bg-slate-950 p-4 rounded-2xl border border-slate-800 w-24">
                 <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Carbs</p>
                 <p className="text-sm font-black text-white">{totals.c}g</p>
              </div>
              <div className="text-center bg-slate-950 p-4 rounded-2xl border border-slate-800 w-24">
                 <p className="text-[7px] font-black text-slate-600 uppercase mb-1">Fats</p>
                 <p className="text-sm font-black text-white">{totals.f}g</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'] as MealCategory[]).map(meal => (
          <div key={meal} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 group hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">{meal}</h3>
              <button 
                onClick={() => setCurrentMeal(meal)}
                className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-cyan-500 border border-slate-800 hover:border-cyan-500 transition-all"
              >
                +
              </button>
            </div>
            <div className="space-y-3">
              {selectedFoods.filter(f => f.category === meal).map(f => (
                <div key={f.logId} className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800 group/item">
                  <div>
                    <p className="text-xs font-black text-white">{f.name}</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">{f.servingSize}</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-black text-cyan-500">{f.calories}</span>
                     <button onClick={() => setSelectedFoods(prev => prev.filter(x => x.logId !== f.logId))} className="text-slate-700 hover:text-red-500 transition-colors">×</button>
                  </div>
                </div>
              ))}
              {selectedFoods.filter(f => f.category === meal).length === 0 && (
                <p className="text-[10px] text-slate-600 italic text-center py-4">No data logged for this window.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentMeal && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[60] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="max-w-xl w-full bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative">
            <button onClick={() => setCurrentMeal(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white text-2xl">×</button>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Log {currentMeal}</h3>
            <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.3em] mb-10">Select Method</p>
            
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 bg-slate-950 border border-slate-800 rounded-3xl text-center hover:border-cyan-500 transition-all group"
                  >
                    <span className="text-3xl mb-3 block group-hover:scale-110 transition">📸</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Vision</span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handlePhotoUpload} />
                  
                  <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl text-center">
                    <span className="text-3xl mb-3 block">⌨️</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Manual</span>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-800">
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Search or describe meal..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white outline-none focus:border-cyan-500 transition-all placeholder:text-slate-700" 
                    onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                  />
                  <button 
                    onClick={handleAiSearch} 
                    disabled={isAiSearching || !searchTerm.trim()} 
                    className="w-full mt-4 py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-cyan-500 hover:text-white transition-all italic disabled:opacity-20"
                  >
                    {isAiSearching ? 'Analyzing...' : 'Commit Search'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
         <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 italic">Consistency Protocol</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'mobility', label: 'Mobility', icon: '🧘' },
              { id: 'supplements', label: 'Supps', icon: '💊' },
              { id: 'morningSunlight', label: 'Sunlight', icon: '☀️' },
              { id: 'noPhoneBeforeBed', label: 'Digital Sunset', icon: '📱' }
            ].map(r => (
               <button 
                  key={r.id}
                  onClick={() => setRituals(prev => ({ ...prev, [r.id]: !(prev as any)[r.id] }))}
                  className={`p-5 rounded-2xl border transition-all text-center ${(rituals as any)[r.id] ? 'bg-cyan-600/10 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
               >
                  <span className="text-xl block mb-2">{r.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{r.label}</span>
               </button>
            ))}
         </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-[50]">
        <button 
          onClick={() => onSave({ 
            date: new Date().toISOString().split('T')[0], 
            steps, 
            water: 2, 
            caloriesConsumed: totals.calories, 
            proteinConsumed: totals.p, 
            carbsConsumed: totals.c, 
            fatsConsumed: totals.f, 
            workoutCompleted: false, 
            foods: selectedFoods,
            rituals
          })} 
          className="w-full py-6 bg-cyan-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl border-4 border-slate-900 hover:bg-cyan-500 transition-all italic"
        >
          Commit Day Log
        </button>
      </div>
    </div>
  );
};

export default DailyLogging;
