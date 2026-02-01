
import React, { useState } from 'react';
import { ProgressPhoto } from '../types';
import { generateGoalVisualization } from '../services/geminiService';
import { Sparkles, Camera, Loader2, Info, Key } from 'lucide-react';

interface TransformationHubProps {
  photos: ProgressPhoto[];
  onUpload: (photo: ProgressPhoto) => void;
  biometrics?: string;
  gender?: string;
  dob?: string;
}

const TransformationHub: React.FC<TransformationHubProps> = ({ photos, onUpload, biometrics, gender = "male", dob }) => {
  const [activeType, setActiveType] = useState<'FRONT' | 'SIDE' | 'BACK'>('FRONT');
  const [goalImage, setGoalImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const typePhotos = photos.filter(p => p.type === activeType).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleGenerateVision = async () => {
    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio?.openSelectKey();
    }

    setIsGenerating(true);
    const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : 30;
    
    try {
      const goalText = gender.toLowerCase() === 'female' 
        ? "Athletic Hourglass Physique, Lean Aesthetic Definition" 
        : "Elite Athletic Build, Lean Functional Muscle";
        
      const vision = await generateGoalVisualization(goalText, biometrics || "Asian Professional", gender.toLowerCase(), age);
      if (vision) {
        setGoalImage(vision);
      }
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found")) {
        alert("Verification required. Please select your paid API key.");
        await (window as any).aistudio?.openSelectKey();
      }
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
    <div className="space-y-10 pb-24 animate-in fade-in duration-700">
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
        <Key className="text-amber-500 shrink-0 mt-1" size={20} />
        <div className="space-y-2">
           <p className="text-sm text-slate-200 font-bold italic leading-relaxed">
             AI Goal Visualization requires a paid Gemini Project.
           </p>
           <p className="text-[11px] text-slate-500 italic leading-relaxed">
             This process uses high-fidelity neural imaging. If prompted, please ensure you select an API key linked to a paid billing project. 
             Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-cyan-500 underline">billing documentation</a>.
           </p>
        </div>
      </div>
    </div>
  );
};

export default TransformationHub;
