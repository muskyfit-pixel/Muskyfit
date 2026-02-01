
import React, { useState } from 'react';
import { Meal, WorkoutDay, MacroSplit } from '../types';

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-sm mx-auto">
        <button onClick={() => setActiveView('MEALS')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase ${activeView === 'MEALS' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>Nutrition</button>
        <button onClick={() => setActiveView('EXERCISES')} className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase ${activeView === 'EXERCISES' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>Training</button>
      </div>

      {activeView === 'MEALS' ? (
        <div className="grid gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
             <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Daily Nutrition Targets</h3>
             <div className="grid grid-cols-4 gap-4 text-center">
                <div><p className="text-xl font-bold text-white">{trainingDayMacros?.calories}</p><p className="text-[10px] text-slate-500 uppercase">Cals</p></div>
                <div><p className="text-xl font-bold text-white">{trainingDayMacros?.p}g</p><p className="text-[10px] text-slate-500 uppercase">Protein</p></div>
                <div><p className="text-xl font-bold text-white">{trainingDayMacros?.c}g</p><p className="text-[10px] text-slate-500 uppercase">Carbs</p></div>
                <div><p className="text-xl font-bold text-white">{trainingDayMacros?.f}g</p><p className="text-[10px] text-slate-500 uppercase">Fats</p></div>
             </div>
          </div>
          {mealPlan.map((meal, i) => (
            <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold text-cyan-500 uppercase">{meal.mealType}</span>
              <h4 className="text-lg font-bold text-white mb-4">{meal.name}</h4>
              <div className="space-y-4">
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Ingredients</p>
                    <ul className="text-sm text-slate-400 list-disc list-inside">
                       {meal.ingredients.map((ing, j) => <li key={j}>{ing}</li>)}
                    </ul>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Instructions</p>
                    <p className="text-sm text-slate-400">{meal.instructions}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {workoutSplit.map((day, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
               <div className="bg-slate-950 p-6 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white">{day.title}</h3>
                  <p className="text-xs text-slate-500">{day.day}</p>
               </div>
               <div className="p-4 space-y-2">
                  {day.exercises.map((ex, j) => (
                    <div key={j} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl">
                       <div>
                          <p className="text-sm font-bold text-white">{ex.name}</p>
                          <p className="text-xs text-slate-500">{ex.sets} sets × {ex.reps} reps</p>
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
