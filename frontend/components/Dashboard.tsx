import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Contact, SafetyStatus, SOSCategory } from '../types';
import { Shield, Navigation, ShieldAlert, MapPin, Users, Building2, Mic, Radio, MicOff, Zap, Power, Siren } from 'lucide-react';
import { backend, RiskAnalysis } from '../services/backendSimulator';

interface Props {
  user: UserProfile;
  contacts: Contact[];
  onTriggerSOS: (category: SOSCategory) => void;
  location: {lat: number, lng: number} | null;
  irisVoiceActive: boolean;
  startIrisVoice: () => void;
  startSingleVoiceCommand: () => void;
  stopIrisVoice: () => void;
  irisOutput: string;
  irisMapUrl: string | null;
  demoHighRisk: boolean;
}

const Dashboard: React.FC<Props> = ({ 
  user, contacts, onTriggerSOS, location, 
  irisVoiceActive, startIrisVoice, startSingleVoiceCommand, stopIrisVoice, irisOutput, irisMapUrl, demoHighRisk
}) => {
  const [irisAnalysis, setIrisAnalysis] = useState<RiskAnalysis | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [sosCategory, setSosCategory] = useState<SOSCategory>(SOSCategory.FAMILY);
  
  const holdIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (location) {
      const crowd = backend.generateCrowdData(location.lat, location.lng);
      const analysis = backend.calculateSafetyLevel(location.lat, location.lng, crowd);
      if (demoHighRisk) {
        analysis.status = SafetyStatus.DANGER;
        analysis.level = "RISK 🔴";
        analysis.color = "rose";
        analysis.score = 96;
      }
      setIrisAnalysis(analysis);
    }
  }, [location, demoHighRisk]);

  const handleHoldStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    setHoldProgress(0);
    setIsHolding(true);
    holdIntervalRef.current = window.setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
          setIsHolding(false);
          onTriggerSOS(sosCategory);
          return 100;
        }
        return prev + 1;
      });
    }, 30); // 3 seconds total
  };

  const handleHoldEnd = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
    setIsHolding(false);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      
      {/* IRIS HEADER */}
      <div className="text-center space-y-1 py-4">
        <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-tighter uppercase leading-none">IRIS ASSISTANT</h1>
        <div className="flex items-center justify-center space-x-2 text-rose-500 font-bold">
           <Siren size={20} className="animate-pulse" />
           <p className="text-2xl uppercase tracking-tighter font-black">Police : 100</p>
        </div>
      </div>

      {/* SOS CATEGORY SELECTOR */}
      <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-3xl border border-white/20 flex shadow-sm">
        <button 
          onClick={() => setSosCategory(SOSCategory.FAMILY)} 
          className={`flex-1 py-3.5 rounded-[1.25rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${sosCategory === SOSCategory.FAMILY ? 'bg-rose-600 text-white shadow-md' : 'text-white/60'}`}
        >
          <Users size={14} /><span>Circle SOS</span>
        </button>
        <button 
          onClick={() => setSosCategory(SOSCategory.POLICE)} 
          className={`flex-1 py-3.5 rounded-[1.25rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${sosCategory === SOSCategory.POLICE ? 'bg-slate-900 text-white shadow-md' : 'text-white/60'}`}
        >
          <Building2 size={14} /><span>Police SOS</span>
        </button>
      </div>

      {/* MAIN SOS TRIGGER */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        <div className="relative w-64 h-64">
          <svg
            viewBox="0 0 256 256"
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          >
            {/* Background Circle */}
            <circle
              cx="128"
              cy="128"
              r="90"
              fill="transparent"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            {/* Progress Circle */}
            <circle
              cx="128"
              cy="128"
              r="90"
              fill="transparent"
              stroke="#e11d48"
              strokeWidth="12"
              strokeDasharray={2 * Math.PI * 90}
              strokeDashoffset={(2 * Math.PI * 90) * (1 - holdProgress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.03s linear' }}
            />
          </svg>

          {/* SOS Button */}
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className={`absolute inset-0 m-8 bg-rose-600 rounded-full shadow-2xl flex flex-col items-center justify-center text-white select-none touch-none transition-all duration-300 panic-pulse ${isHolding ? 'scale-95 bg-rose-700' : 'hover:scale-105 active:scale-95'}`}
          >
            {isHolding ? <ShieldAlert size={60} className="animate-pulse" /> : <Shield size={60} />}
            <span className="mt-2 font-black text-4xl tracking-tighter uppercase">SOS</span>
          </button>
        </div>
        <p className="mt-6 text-[9px] font-black text-rose-100/60 uppercase tracking-[0.3em]">
          Hold for 3s to engage broadcast
        </p>
      </div>

      {/* IRIS ENGINE PANEL */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
        {/* AI Powered Glow Badge */}
        <div className="absolute top-4 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-[10px] uppercase tracking-widest animate-pulse shadow-lg">
          AI POWERED
        </div>

        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl text-white shadow-lg transition-all ${irisVoiceActive ? 'bg-blue-600 animate-pulse animate-bounce' : 'bg-slate-700'}`}>
              {irisVoiceActive ? <Mic size={20} /> : <MicOff size={20} />}
            </div>
            <div>
              <h2 className="font-black text-white text-base tracking-tight uppercase leading-none">IRIS Engine</h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{irisVoiceActive ? 'Active' : 'Standby'}</p>
            </div>
          </div>
          <div className="flex space-x-2.5">
            <button onClick={startIrisVoice} className={`p-2.5 rounded-full transition-all ${irisVoiceActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm'}`}>
              <Zap size={16} />
            </button>
            <button onClick={startSingleVoiceCommand} className="bg-rose-600 text-white p-2.5 rounded-full active:scale-90 transition-all shadow-lg">
              <Mic size={16} />
            </button>
            {irisVoiceActive && <button onClick={stopIrisVoice} className="p-2 text-slate-400 hover:text-white transition-colors"><Power size={18} /></button>}
          </div>
        </div>

        {/* Status Indicator Screen */}
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-3">
            <Radio size={14} className="text-blue-500 animate-pulse" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Index Output</p>
          </div>
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 min-h-[60px] flex flex-col justify-center">
            <p className="text-blue-50 font-black text-lg tracking-tight uppercase leading-snug whitespace-pre-wrap">{irisOutput}</p>
          </div>
        </div>

        {/* Main Voice Commands Cheat Sheet */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 animate-slide-up">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
            MAIN VOICE COMMANDS
          </p>
          <ul className="text-slate-200 text-sm font-bold space-y-1">
            <li className="animate-pulse">• IRIS WHERE AM I</li>
            <li className="animate-pulse delay-150">• IRIS EMERGENCY</li>
            <li className="animate-pulse delay-300">• IRIS CHECK AREA</li>
          </ul>
        </div>

        {/* Tactical Map Link */}
        {irisMapUrl && (
          <a href={irisMapUrl} target="_blank" rel="noopener noreferrer" className="w-full p-5 bg-emerald-600 text-white rounded-[1.5rem] block text-center font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all hover:scale-105 border border-emerald-500 flex items-center justify-center space-x-3">
            <MapPin size={18} fill="white" />
            <span>Tactical Grid Link</span>
          </a>
        )}
      </div>

      {/* FAST DISPATCH CALL */}
      <a href="tel:100" className="bg-white/90 backdrop-blur-md p-7 rounded-[3rem] border border-white/20 flex items-center justify-between shadow-md active:bg-white transition-all">
        <div className="flex items-center space-x-5">
          <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 shadow-inner"><Siren size={28} /></div>
          <div>
            <p className="text-xl font-black tracking-tighter leading-none uppercase text-slate-900">Priority Link</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Direct 100/112 Channel</p>
          </div>
        </div>
        <Navigation size={22} className="text-slate-300" />
      </a>

    </div>
  );
};

export default Dashboard;