
import React, { useState, useEffect } from 'react';
import { PoliceStation } from '../types';
import { Shield, Phone, Navigation, Clock, MapPin, Loader2, Siren, ArrowUpRight, Map } from 'lucide-react';
import { findNearestPoliceStations } from '../services/geminiService';

interface Props {
  location: {lat: number, lng: number} | null;
}

const PoliceDashboard: React.FC<Props> = ({ location }) => {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setLoading(true);
      findNearestPoliceStations(location.lat, location.lng)
        .then(res => {
          setStations(res);
          setLoading(false);
        });
    }
  }, [location]);

  const openGlobalPoliceSearch = () => {
    if (!location) {
      alert("GPS Signal Weak. Please ensure location services are enabled.");
      return;
    }
    // Google Maps search query as requested in user snippet
    const googleMapsURL = `https://www.google.com/maps/search/police+station/@${location.lat},${location.lng},16z`;
    window.open(googleMapsURL, "_blank");
  };

  return (
    <div className="p-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white mb-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 bg-rose-600/20 w-40 h-40 rounded-full blur-3xl group-hover:bg-rose-600/30 transition-all duration-700" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
             <div className="bg-rose-600 p-2 rounded-xl animate-pulse">
                <Siren size={20} className="text-white" />
             </div>
             <h2 className="text-2xl font-black tracking-tight uppercase">Police Command</h2>
          </div>
          
          <div className="space-y-4">
            <a 
              href="tel:100"
              className="w-full bg-rose-600 text-white py-6 rounded-3xl font-black text-2xl flex items-center justify-center active:scale-95 transition-all shadow-lg border border-rose-500"
            >
              <Phone className="mr-3 fill-white" size={28} /> CALL 100
            </a>

            <button 
              onClick={openGlobalPoliceSearch}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all border border-white/10"
            >
              <Map size={18} />
              <span>SEARCH NEAREST ON GOOGLE MAPS</span>
            </button>
          </div>

          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center mt-6 opacity-60">
            Emergency Dispatch: National Helpline 100/112
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="font-black text-slate-900 text-[10px] tracking-[0.3em] uppercase flex items-center">
          <Shield size={16} className="mr-2 text-rose-600" /> AI Identified Precincts
        </h3>
        {loading && <Loader2 size={16} className="text-slate-400 animate-spin" />}
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2].map(i => (
            <div key={i} className="bg-white h-24 rounded-[2.5rem] animate-pulse border border-slate-100" />
          ))
        ) : (
          stations.map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[3rem] shadow-xl border border-slate-100 space-y-4 hover:border-rose-200 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 tracking-tight text-lg">{s.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">{s.address}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Shield size={20} className="text-slate-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-4">
                   <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Distance</span>
                     <div className="flex items-center text-xs font-black text-slate-600">
                       <Navigation size={12} className="mr-1 text-rose-500" /> {s.distance || 'Checking...'}
                     </div>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">ETA</span>
                     <div className="flex items-center text-xs font-black text-slate-600">
                       <Clock size={12} className="mr-1 text-rose-500" /> {s.duration || 'Checking...'}
                     </div>
                   </div>
                </div>
                
                <div className="flex space-x-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-slate-50 text-slate-900 rounded-2xl active:scale-90 transition-all border border-slate-100 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <ArrowUpRight size={22} />
                  </a>
                  <a 
                    href={`tel:${s.phone}`}
                    className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl active:scale-90 transition-all border border-emerald-100"
                  >
                    <Phone size={22} strokeWidth={2.5} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
        
        {!loading && stations.length === 0 && (
           <div className="p-12 text-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
              <Shield size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-black text-xs uppercase tracking-widest">Scanning Tactical Grid...</p>
              <button 
                onClick={openGlobalPoliceSearch}
                className="mt-4 text-[10px] font-black text-rose-600 uppercase tracking-widest underline underline-offset-4"
              >
                Force Open Maps Search
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default PoliceDashboard;
