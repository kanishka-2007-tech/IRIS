
import React from 'react';
import { XCircle, Phone, ShieldAlert, CheckCircle2, Smartphone, Loader2, MessageCircle, Mic } from 'lucide-react';

interface Props {
  onStop: () => void;
  isSent: boolean;
  whatsappUrls?: {name: string, url: string}[];
  isRecording?: boolean;
}

const SOSOverlay: React.FC<Props> = ({ onStop, isSent, whatsappUrls, isRecording }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-rose-600 flex flex-col items-center justify-start p-8 text-white overflow-y-auto animate-in fade-in duration-300">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-white rounded-full animate-ping" />
      </div>

      <div className="relative mt-12 mb-8">
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-125"></div>
          <div className="relative z-10 w-32 h-32 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-2xl">
              {isSent ? (
                <CheckCircle2 size={70} className="animate-in zoom-in duration-500" />
              ) : (
                <ShieldAlert size={70} className="animate-pulse" />
              )}
          </div>
      </div>

      <div className="text-center space-y-2 mb-8 relative z-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
          {isSent ? 'SIGNAL SENT' : 'ACTIVATING SOS'}
        </h1>
        <p className="text-rose-100 text-sm font-bold opacity-80 uppercase tracking-widest">
          {isSent ? "Monitoring Response Circle" : "Broadcasting Emergency Signal..."}
        </p>
      </div>

      {isRecording && (
        <div className="mb-6 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full flex items-center space-x-3 border border-white/10 animate-pulse relative z-10">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <Mic size={16} className="text-red-500" />
          <span className="font-black text-[10px] uppercase tracking-widest text-red-100">Live Recording Active</span>
        </div>
      )}

      <div className="w-full max-w-sm space-y-4 mb-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70 text-center">Response Circle</h3>
          <div className="space-y-3">
            {whatsappUrls?.map((item, idx) => (
              <button
                key={idx}
                onClick={() => window.open(item.url, "_blank")}
                className="w-full bg-white text-rose-600 py-4 px-6 rounded-2xl font-black flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle size={20} className="fill-rose-600" />
                  <span className="text-sm">Alert: {item.name}</span>
                </div>
                <Smartphone size={16} className="opacity-40" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm space-y-4 relative z-10 pb-12">
          <button 
            onClick={onStop}
            className="flex items-center justify-center space-x-3 bg-black/40 text-white w-full py-6 rounded-[2.5rem] font-black text-lg border border-white/20"
          >
            <XCircle size={24} />
            <span>DISMISS ALERT</span>
          </button>
          
          <a 
            href="tel:112" 
            className="flex items-center justify-center space-x-2 text-rose-600 font-black uppercase tracking-widest text-xs py-5 bg-white rounded-[2.5rem] shadow-2xl"
          >
            <Phone size={18} className="fill-rose-600" />
            <span>CALL POLICE (112)</span>
          </a>
      </div>
    </div>
  );
};

export default SOSOverlay;
