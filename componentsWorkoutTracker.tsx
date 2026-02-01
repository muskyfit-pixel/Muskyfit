
import React, { useState, useEffect, useRef } from 'react';
import { WorkoutDay, ExerciseLog, SetLog } from '../types';

interface WorkoutTrackerProps {
  currentWorkout: WorkoutDay;
  previousProgress: Record<string, number>;
  onFinish: (logs: ExerciseLog[]) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ currentWorkout, previousProgress, onFinish }) => {
  const parseReps = (val: string): number => {
    const match = val.match(/\d+/);
    return match ? parseInt(match[0]) : 10;
  };

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(
    currentWorkout.exercises.map(ex => ({
      exerciseId: ex.id,
      sets: Array.from({ length: ex.sets }).map(() => ({
        weight: previousProgress[ex.id] || 0,
        reps: parseReps(ex.reps),
        rpe: ex.targetRpe || 8, 
        completed: false
      }))
    }))
  );

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const updateSet = (exIdx: number, setIdx: number, updates: Partial<SetLog>) => {
    setExerciseLogs(prev => {
      const newLogs = [...prev];
      newLogs[exIdx].sets[setIdx] = { ...newLogs[exIdx].sets[setIdx], ...updates };
      return newLogs;
    });
  };

  const toggleSetCompletion = (exIdx: number, setIdx: number) => {
    const isNowCompleted = !exerciseLogs[exIdx].sets[setIdx].completed;
    updateSet(exIdx, setIdx, { completed: isNowCompleted });
    if (isNowCompleted) {
      setTimeLeft(currentWorkout.exercises[exIdx].isWarmup ? 15 : 90);
      setTimerActive(true);
    }
  };

  const progressPercent = (exerciseLogs.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0) / 
                           (exerciseLogs.reduce((acc, ex) => acc + ex.sets.length, 0) || 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-40 px-4 md:px-0 animate-in fade-in duration-700">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl sticky top-20 z-40 backdrop-blur-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter metallic-text">{currentWorkout.title}</h2>
            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{currentWorkout.day} Protocol</p>
          </div>
          <div className="text-right">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Completion</p>
             <p className="text-2xl font-black text-white">{Math.round(progressPercent)}%</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {currentWorkout.exercises.map((ex, exIdx) => (
          <div key={ex.id} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
             <div className="bg-slate-950 px-8 py-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-white italic">{ex.name}</h3>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{ex.sets} Sets × {ex.reps}</span>
             </div>
             <div className="p-6 space-y-4">
                {exerciseLogs[exIdx].sets.map((set, setIdx) => (
                   <div key={setIdx} className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all ${set.completed ? 'bg-cyan-950/20 border-cyan-900/30' : 'bg-slate-950 border-slate-800'}`}>
                      <div className="col-span-1 text-center font-black text-slate-600 text-xs">{setIdx + 1}</div>
                      <div className="col-span-4">
                         <input type="number" value={set.weight || ''} disabled={set.completed} onChange={e => updateSet(exIdx, setIdx, { weight: Number(e.target.value) })} placeholder="Weight" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-center text-sm font-black text-white outline-none" />
                      </div>
                      <div className="col-span-3">
                         <input type="number" value={set.reps || ''} disabled={set.completed} onChange={e => updateSet(exIdx, setIdx, { reps: Number(e.target.value) })} placeholder="Reps" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-center text-sm font-black text-white outline-none" />
                      </div>
                      <div className="col-span-2">
                         <select value={set.rpe} disabled={set.completed} onChange={e => updateSet(exIdx, setIdx, { rpe: Number(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 text-center text-xs font-black text-cyan-500 outline-none">
                            {[6,7,8,9,10].map(v => <option key={v} value={v}>{v}</option>)}
                         </select>
                      </div>
                      <div className="col-span-2 flex justify-center">
                         <button onClick={() => toggleSetCompletion(exIdx, setIdx)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}>
                           {set.completed ? '✓' : ''}
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        ))}
      </div>

      {timerActive && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
           <div className="bg-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-4 border-cyan-500">
              <p className="text-3xl font-black text-black tabular-nums">{timeLeft}s</p>
              <button onClick={() => setTimerActive(false)} className="bg-slate-100 p-2 rounded-full">■</button>
           </div>
        </div>
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-sm px-6">
        <button onClick={() => onFinish(exerciseLogs)} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-cyan-500 hover:text-white transition-all italic border-4 border-slate-900">
          Finish Session
        </button>
      </div>
    </div>
  );
};

export default WorkoutTracker;
v
