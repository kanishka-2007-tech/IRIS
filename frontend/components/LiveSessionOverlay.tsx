
import React, { useEffect, useState } from 'react';
import { Mic, MicOff, PhoneOff, Radio, Volume2, Shield } from 'lucide-react';

interface Props {
  isActive: boolean;
  onClose: () => void;
  transcription: string;
  isModelSpeaking: boolean;
}

const LiveSessionOverlay: React.FC<Props> = ({ isActive, onClose, transcription, isModelSpeaking }) => {
  const [bars, setBars] = useState<number[]>(new Array(20).fill(10));

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setBars(new Array(20).fill(0).map(() => Math.random() * (isModelSpeaking ? 80 : 20) + 10));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isActive, isModelSpeaking]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-between p-8 animate-in fade-in zoom-in duration-300">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-rose-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">IRIS LIVE SECURE</span>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
          <PhoneOff size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center space-y-12 w-full">
        <div className="relative">
          <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-3xl transition-opacity duration-500 ${isModelSpeaking ? 'opacity-100 scale-150' : 'opacity-20 scale-100'}`} />
          <div className={`w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center relative z-10 transition-all duration-500 ${isModelSpeaking ? 'scale-110 border-blue-500/50' : ''}`}>
            <Shield size={64} className={`text-blue-500 transition-all ${isModelSpeaking ? 'animate-pulse scale-110' : ''}`} />
          </div>
        </div>

        <div className="flex items-end justify-center space-x-1.5 h-20 w-full">
          {bars.map((h, i) => (
            <div 
              key={i} 
              className={`w-1.5 rounded-full transition-all duration-100 ${isModelSpeaking ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} 
              style={{ height: `${h}%` }} 
            />
          ))}
        </div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 min-h-[120px] flex items-center justify-center">
           <p className="text-center text-blue-50 font-medium text-lg leading-relaxed italic">
             {transcription || "Listening for your voice..."}
           </p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center space-y-4 pb-8">
        <div className="flex items-center space-x-3 text-slate-500">
          <Radio size={16} className="animate-pulse text-rose-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Real-time Channel</span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Command: "IRIS, HELP ME NAVIGATE" or "IRIS, AM I SAFE?"</p>
      </div>
    </div>
  );
};

export default LiveSessionOverlay;
