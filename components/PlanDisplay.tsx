
import React, { useState } from 'react';
import { Meal, WorkoutDay, MacroSplit } from '../types';
import { ChefHat, Dumbbell, Zap, Target } from 'lucide-react';

interface PlanDisplayProps {
  mealPlan: Meal[];
  workoutSplit: WorkoutDay[];
  trainingDayMacros?: MacroSplit;
  restDayMacros?: MacroSplit;
  coachAdvice?: string;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ mealPlan, workoutSplit, trainingDayMacros, restDayMacros, coachAdvice }) => {
  const [activeView, setActiveView] = useState<'MEALS' | 'EXERCISES'>('MEALS');

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col items-center gap-6">
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 w-full max-w-sm shadow-2xl">
          <button 
            onClick={() => setActiveView('MEALS')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'MEALS' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ChefHat size={14} /> Nutrition
          </button>
          <button 
            onClick={() => setActiveView('EXERCISES')} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'EXERCISES' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Dumbbell size={14} /> Training
          </button>
        </div>
      </div>

      {activeView === 'MEALS' ? (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
             <div className="flex items-center gap-3 mb-6">
                <Target size={16} className="text-cyan-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Precision Macro Targets</h3>
             </div>
             <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-2xl font-black text-white brand-font">{trainingDayMacros?.calories}</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase mt-1">Kcal</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-2xl font-black text-cyan-400 brand-font">{trainingDayMacros?.p}g</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase mt-1">Protein</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-2xl font-black text-white brand-font">{trainingDayMacros?.c}g</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase mt-1">Carbs</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                    <p className="text-2xl font-black text-slate-400 brand-font">{trainingDayMacros?.f}g</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase mt-1">Fats</p>
                </div>
             </div>
          </div>

          {mealPlan.map((meal, i) => (
            <div key={i} className="bg-slate-900/30 p-8 rounded-[2.5rem] border border-white/5 hover:border-cyan-900/20 transition-all duration-500 group">
              <div className="flex justify-between items-start mb-6">
                <div>
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] italic mb-2 block">{meal.mealType}</span>
                    <h4 className="text-2xl font-black text-white italic tracking-tight group-hover:text-cyan-400 transition-colors brand-font">{meal.name}</h4>
                </div>
                <div className="px-4 py-2 bg-slate-950 rounded-xl text-[10px] font-black text-slate-500 border border-white/5">
                    {meal.macros.calories} KCAL
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-800" /> Elements
                    </p>
                    <ul className="space-y-2">
                       {meal.ingredients.map((ing, j) => (
                         <li key={j} className="text-sm text-slate-400 font-medium italic flex items-start gap-2">
                           <span className="text-cyan-500 mt-1">•</span> {ing}
                         </li>
                       ))}
                    </ul>
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-px bg-slate-800" /> Protocol
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed italic">{meal.instructions}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 max-w-3xl mx-auto">
          {workoutSplit.map((day, i) => (
            <div key={i} className="bg-slate-900/30 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl group">
               <div className="bg-slate-950 p-8 border-b border-white/5 flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter brand-font uppercase">{day.title}</h3>
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.4em] mt-2 italic">{day.day} Session</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-600/10 rounded-2xl flex items-center justify-center text-cyan-500">
                    <Zap size={20} />
                  </div>
               </div>
               <div className="p-6 space-y-3">
                  {day.exercises.map((ex, j) => (
                    <div key={j} className="flex justify-between items-center p-5 bg-slate-950/30 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group/ex">
                       <div className="flex gap-6 items-center">
                          <span className="text-xs font-black text-slate-700 group-hover/ex:text-cyan-500 transition-colors">0{j+1}</span>
                          <div>
                            <p className="text-base font-black text-white italic tracking-tight brand-font">{ex.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{ex.notes}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-cyan-500 italic brand-font">{ex.sets} × {ex.reps}</p>
                          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Sets/Reps</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanDisplay;
