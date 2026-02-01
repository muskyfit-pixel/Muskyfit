
import React, { useState } from 'react';
import { ProgressPhoto } from '../types';
import { generateGoalVisualization } from '../services/geminiService';
import { Sparkles, Camera, Loader2, Info } from 'lucide-react';

interface TransformationHubProps {
  photos: ProgressPhoto[];
  onUpload: (photo: ProgressPhoto) => void;
  biometrics?: string;
}

const TransformationHub: React.FC<TransformationHubProps> = ({ photos, onUpload, biometrics }) => {
  const [activeType, setActiveType] = useState<'FRONT' | 'SIDE' | 'BACK'>('FRONT');
  const [goalImage, setGoalImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const typePhotos = photos.filter(p => p.type === activeType).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // [FIX] Added API key selection check for image generation
  const handleGenerateVision = async () => {
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGenerating(true);
    try {
      const vision = await generateGoalVisualization("Extreme V-Taper, Lean Aesthetic", biometrics || "Asian Male, Professional");
      setGoalImage(vision);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpload({
        id: 'photo_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        url: url,
        type: activeType,
        weight: 0
      });
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter metallic-text">Transformation Vault</h2>
           <p className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Visual Evidence Protocol</p>
        </div>
        <div className="flex gap-2">
          {(['FRONT', 'SIDE', 'BACK'] as const).map(type => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeType === type ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* BASELINE */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center italic">Baseline Status</p>
          <div className="aspect-[3/4] bg-slate-950 rounded-[2.5rem] border border-slate-800 flex items-center justify-center overflow-hidden relative">
             {typePhotos[0] ? (
               <img src={typePhotos[0].url} className="w-full h-full object-cover" alt="Baseline" />
             ) : (
               <Camera size={40} className="text-slate-800" />
             )}
             <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg text-[8px] font-black text-slate-400 uppercase">Week 0</div>
          </div>
        </div>

        {/* CURRENT */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest text-center italic">Current State</p>
          <div className="aspect-[3/4] bg-slate-950 rounded-[2.5rem] border border-cyan-900/20 flex items-center justify-center relative overflow-hidden group">
             {typePhotos.length > 1 ? (
               <img src={typePhotos[typePhotos.length - 1].url} className="w-full h-full object-cover" alt="Current" />
             ) : (
               <div className="text-center p-8">
                  <p className="text-xs text-slate-600 italic mb-6">Upload required</p>
                  <label className="p-4 bg-slate-900 rounded-full cursor-pointer hover:bg-cyan-600 transition inline-block">
                     <Camera size={24} className="text-white" />
                     <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
               </div>
             )}
             <div className="absolute top-4 left-4 bg-cyan-600 px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase">Week {typePhotos.length > 0 ? typePhotos.length : 0}</div>
          </div>
        </div>

        {/* VISION */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center italic">AI Goal Vision</p>
          <div className="aspect-[3/4] bg-slate-950 rounded-[2.5rem] border border-amber-900/20 flex items-center justify-center relative overflow-hidden group shadow-[0_0_30px_rgba(245,158,11,0.05)]">
             {goalImage ? (
               <img src={goalImage} className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" alt="Goal Vision" />
             ) : (
               <div className="text-center p-8">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic animate-pulse">Synthesizing Target...</p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleGenerateVision}
                      className="flex flex-col items-center gap-4 hover:scale-110 transition-all duration-500 group"
                    >
                      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                        <Sparkles size={28} className="text-amber-500 group-hover:text-white" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest italic">Generate Vision</p>
                    </button>
                  )}
               </div>
             )}
             <div className="absolute top-4 left-4 bg-amber-600 px-3 py-1 rounded-lg text-[8px] font-black text-white uppercase">Target</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex items-start gap-4">
        <Info className="text-cyan-500 shrink-0" size={20} />
        <p className="text-sm text-slate-500 italic leading-relaxed">
          The **AI Goal Vision** uses your metabolic profile to estimate your maximal natural potential after the first 12-week block. Use this as your North Star during high-intensity training sessions.
        </p>
      </div>
    </div>
  );
};

export default TransformationHub;
