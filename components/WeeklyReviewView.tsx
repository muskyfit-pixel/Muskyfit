
import React from 'react';
import { WeeklyReview } from '../types';

interface WeeklyReviewViewProps {
  reviews: WeeklyReview[];
}

const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({ reviews }) => {
  const latest = reviews[reviews.length - 1];

  if (!latest) return <div className="text-center py-20 italic text-slate-500">No performance reviews published yet.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-40 space-y-10 px-4 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
         <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase metallic-text">Performance Audit</h2>
         <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px]">Elite MuskyFit Review</p>
      </div>

      <div className="bg-slate-900 p-10 md:p-16 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-12 text-6xl opacity-10 italic font-black`}>
          {latest.adherenceScore}%
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-12">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black ${latest.status === 'GREEN' ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}>
              {latest.adherenceScore}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weekly Score</p>
              <h3 className="text-3xl font-black text-white italic uppercase">{latest.status === 'GREEN' ? 'ELITE ADHERENCE' : 'NEEDS FOCUS'}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Review Date: {latest.date}</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-4 italic">Coach Directive</h4>
            <p className="text-xl text-slate-200 leading-relaxed font-medium italic">
              "{latest.coachMessage}"
            </p>
          </div>

          <div className="mt-12 space-y-4">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Protocol Adjustments for Next Week</h4>
             <div className="grid md:grid-cols-3 gap-6">
                {latest.directives.map((d, i) => (
                   <div key={i} className="p-6 bg-slate-950 rounded-[2rem] border border-slate-800 flex flex-col gap-4">
                      <span className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-[10px] font-black text-white italic">0{i+1}</span>
                      <p className="text-sm text-slate-300 font-bold italic leading-relaxed">{d}</p>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-4">Historical Performance</h4>
           <div className="space-y-3">
              {reviews.slice(0, -1).reverse().map(rev => (
                <div key={rev.id} className="flex justify-between items-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
                   <div>
                      <p className="text-xs font-black text-white">{rev.date}</p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase">Archive Record</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-cyan-500">{rev.adherenceScore}%</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReviewView;
