
import React, { useState, useEffect } from 'react';
import { SafetyStatus, CrowdPoint } from '../types';
import { MapPin, AlertCircle, ShieldCheck, Radio, Activity, Lightbulb, Users, Globe, ExternalLink } from 'lucide-react';
import { backend, RiskAnalysis } from '../services/backendSimulator';
import { getRecentIncidents, LocalIncident } from '../services/geminiService';

interface Props {
  location: {lat: number, lng: number} | null;
  demoHighRisk?: boolean;
}

const SafetyMap: React.FC<Props> = ({ location, demoHighRisk }) => {
  const [crowd, setCrowd] = useState<CrowdPoint[]>([]);
  const [irisData, setIrisData] = useState<RiskAnalysis | null>(null);
  const [incidents, setIncidents] = useState<{text: string, links: LocalIncident[]}>({ text: '', links: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!location) return;

    const initialCrowd = backend.generateCrowdData(location.lat, location.lng);
    setCrowd(initialCrowd);

    const analyze = async () => {
      setIsLoading(true);
      const risk = backend.calculateSafetyLevel(location.lat, location.lng, initialCrowd);
      if (demoHighRisk) {
        risk.status = SafetyStatus.DANGER;
        risk.level = "PRIORITY WARNING";
        risk.color = "rose";
        risk.score = 96;
        risk.suggestion = "IRIS: Low visibility cluster detected. Immediate exit advised.";
      }
      setIrisData(risk);
      
      const reports = await getRecentIncidents("Delhi"); // Fallback city for intel
      setIncidents(reports);
      
      setIsLoading(false);
    };
    analyze();

    const interval = setInterval(() => {
      setCrowd(prev => prev.map(p => ({
        ...p,
        lat: p.lat + (Math.random() - 0.5) * 0.0004,
        lng: p.lng + (Math.random() - 0.5) * 0.0004,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [location, demoHighRisk]);

  return (
    <div className="h-full relative flex flex-col bg-slate-900 overflow-hidden">
      <div className="absolute top-6 left-6 right-6 z-20">
          <div className="bg-white/95 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-2xl border border-white/50 flex items-center justify-between">
              <div>
                  <h2 className="font-black text-slate-900 tracking-tight text-base flex items-center uppercase">
                    IRIS RADAR 
                    {isLoading && <span className="ml-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
                  </h2>
                  <div className="flex items-center space-x-1">
                      <Radio size={12} className="text-rose-500 animate-pulse" />
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Live Grid Intelligence</p>
                  </div>
              </div>
              {irisData && (
                <div className={`px-4 py-2 rounded-2xl border-2 bg-${irisData.color}-50 border-${irisData.color}-200 text-${irisData.color}-700`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">{irisData.level}</span>
                </div>
              )}
          </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-16 gap-px opacity-[0.1] pointer-events-none">
            {Array.from({length: 192}).map((_, i) => <div key={i} className="border border-slate-700" />)}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className={`w-[150vw] h-[150vw] rounded-full blur-[140px] opacity-30 transition-colors duration-[2s] ${
               irisData?.status === SafetyStatus.SAFE ? 'bg-emerald-500' :
               irisData?.status === SafetyStatus.CAUTION ? 'bg-amber-500' : 'bg-rose-600'
             }`} />
             <div className="absolute w-[80vw] h-[80vw] border border-white/10 rounded-full radar-scan" />
             <div className="absolute w-[40vw] h-[40vw] border border-white/20 rounded-full" />
        </div>

        {crowd.map((p, i) => (
            <div 
                key={p.id}
                className="absolute transition-all duration-[2000ms] ease-linear"
                style={{ 
                    left: `${50 + (p.lng - (location?.lng || 0)) * 6000}%`,
                    top: `${50 + (p.lat - (location?.lat || 0)) * 6000}%`,
                }}
            >
                <div className={`w-2 h-2 rounded-full ${
                  i % 10 === 0 ? 'bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.8)]' : 'bg-slate-600'
                }`} />
            </div>
        ))}

        {location && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                    <div className="absolute -inset-16 bg-blue-500/10 rounded-full animate-ping" />
                    <div className="w-10 h-10 bg-blue-600 rounded-full border-[5px] border-white shadow-2xl flex items-center justify-center relative z-10">
                        <MapPin size={20} className="text-white fill-white" />
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="bg-white p-6 border-t border-slate-200 rounded-t-[3.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] relative z-30 max-h-[60%] overflow-y-auto">
          <div className="flex items-center justify-between mb-5 sticky top-0 bg-white py-2 z-10">
              <h3 className="font-black text-slate-400 text-[10px] tracking-[0.4em] uppercase">Sector Diagnostics</h3>
              <div className="flex items-center space-x-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[9px] font-black text-slate-400 uppercase">Synchronized</span></div>
          </div>
          
          {irisData && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-2.5">
                 <Diag icon={<AlertCircle size={14} />} label="Risk" value={`${irisData.crimeScore}%`} color="rose" />
                 <Diag icon={<Lightbulb size={14} />} label="Lux" value={`${irisData.lighting}%`} color="amber" />
                 <Diag icon={<Users size={14} />} label="Density" value={`${irisData.crowd}%`} color="emerald" />
                 <Diag icon={<Activity size={14} />} label="Flow" value={`${irisData.timeFactor}%`} color="slate" />
              </div>

              {/* LOCAL INTELLIGENCE (GROUNDED SEARCH) */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Globe size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local Safety Intelligence</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed italic">"{incidents.text}"</p>
                  <div className="space-y-2">
                    {incidents.links.map((link, idx) => (
                      <a key={idx} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black uppercase text-blue-600 truncate max-w-[150px]">{link.title}</span>
                          <span className="text-[8px] text-slate-400 font-bold">{link.source}</span>
                        </div>
                        <ExternalLink size={12} className="text-slate-300" />
                      </a>
                    ))}
                  </div>
              </div>

              <div className={`p-6 rounded-[2.5rem] border-2 flex items-start space-x-4 transition-all bg-${irisData.color}-50 border-${irisData.color}-100`}>
                  <div className={`p-4 rounded-3xl bg-${irisData.color}-100 text-${irisData.color}-600`}>
                      {irisData.status === SafetyStatus.SAFE ? <ShieldCheck size={28} /> : <AlertCircle size={28} />}
                  </div>
                  <div>
                      <h4 className={`font-black text-xs uppercase tracking-widest text-${irisData.color}-700`}>{irisData.level}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 font-bold leading-relaxed">{irisData.suggestion}</p>
                  </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

const Diag = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
    <div className={`mx-auto mb-1 flex justify-center text-${color}-600`}>{icon}</div>
    <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{label}</p>
    <p className="text-[11px] font-black text-slate-900 mt-1">{value}</p>
  </div>
);

export default SafetyMap;
