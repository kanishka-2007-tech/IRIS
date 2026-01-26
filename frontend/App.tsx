simport React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafetyStatus, Contact, UserProfile, SOSCategory, SOSLog } from './types';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import ContactManager from './components/ContactManager';
import SafetyMap from './components/SafetyMap';
import PoliceDashboard from './components/PoliceDashboard';
import SOSOverlay from './components/SOSOverlay';
import TechyBackground from './components/TechyBackground';
import LiveSessionOverlay from './components/LiveSessionOverlay';
import { MessagingService } from './services/messagingService';
import { backend } from './services/backendSimulator';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Home, Map as MapIcon, Users, Shield, User, Bell, VolumeX, Eye, Mic } from 'lucide-react';

// ==============================
// IRIS ENGINE DEBUGGED
// ==============================

const COMMAND_MAP = {
  SOS: [
    "iris emergency",
    "iris help",
    "iris sos"
  ],
  AREA: [
    "iris check area",
    "iris area",
    "iris scan area"
  ],
  LOCATION: [
    "iris where am i",
    "iris location",
    "iris my location"
  ],
  STOP: ["iris stop", "iris cancel"]
};

const normalizeText = (text: string) =>
  text.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, " ").trim();

const cleanSpeech = (text: string) =>
  text.toLowerCase().replace(/uh+|um+|ah+|hmm+/gi, "").replace(/[^\w\s]/gi, "").replace(/\s+/g, " ").trim();

const matchCommand = (input: string) => {
  const text = normalizeText(input);
  for (const key in COMMAND_MAP) {
    if (COMMAND_MAP[key as keyof typeof COMMAND_MAP].some(word => text.includes(word))) {
      return key;
    }
  }
  return "UNKNOWN";
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'p1', name: 'Emergency Support 1', phone: '8368278478', relation: 'Trusted', priority: 1, isVerified: true },
      { id: 'p2', name: 'Emergency Support 2', phone: '7982828799', relation: 'Trusted', priority: 2, isVerified: true }
    ];
  });

  const [sosLogs, setSosLogs] = useState<SOSLog[]>(() => {
    const saved = localStorage.getItem('sos_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'contacts' | 'police' | 'profile'>('dashboard');
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sosData, setSosData] = useState<{name: string, url: string}[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // IRIS Assistant State
  const [irisVoiceActive, setIrisVoiceActive] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [demoHighRisk, setDemoHighRisk] = useState(false);
  const [irisOutput, setIrisOutput] = useState("IRIS INDEX: STANDBY");
  const [irisMapUrl, setIrisMapUrl] = useState<string | null>(null);
  const [lastVoiceCommand, setLastVoiceCommand] = useState("");

  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState("");
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (user) localStorage.setItem('user_profile', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('sos_logs', JSON.stringify(sosLogs));
  }, [sosLogs]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          // Suppress GPS debug box completely
          return;
        },
        options
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const triggerVibration = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const smartSpeak = useCallback((text: string) => {
    if (window.speechSynthesis && !silentMode) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.lang.includes('hi-IN') || v.lang.includes('en-IN')) && v.name.includes('Female'));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  }, [silentMode]);

  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }, []);

  const openNearestPoliceStation = useCallback(async () => {
    try {
      const { lat, lng } = await getCurrentLocation();
      const mapsUrl = `https://www.google.com/maps/search/police+station/@${lat},${lng},15z`;
      window.open(mapsUrl, "_blank");
      smartSpeak("You are not alone. I found the nearest police station for you. Follow the directions on the map.");
    } catch {
      smartSpeak("Unable to detect location. Please turn on GPS.");
    }
  }, [getCurrentLocation, smartSpeak]);

  const triggerSOS = useCallback(async (category: SOSCategory = SOSCategory.FAMILY) => {
    if (!user) return;
    setIsSosActive(true);
    setSosSent(false);
    triggerVibration([500, 200, 500]);

    try {
      const result = await MessagingService.dispatchSOS(user, currentLocation, contacts, category);
      if (result.success) {
        setSosSent(true);
        setSosData(result.whatsappUrls);
        const newLog: SOSLog = {
          timestamp: Date.now(),
          category,
          location: currentLocation || { lat: 20.5937, lng: 78.9629 },
          contactsNotified: contacts.map(c => c.name)
        };
        setSosLogs(prev => [newLog, ...prev].slice(0, 10));
      }
    } catch (err) {
      // Suppress SOS debug box completely
      return;
    }
    startManualRecording(true);
  }, [contacts, currentLocation, user, triggerVibration]);

  const startManualRecording = (isSilent = false) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      audioRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        setIsRecording(false);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 15000);
    }).catch(() => {
      if (!isSilent) alert("Mic access denied.");
      setIsRecording(false);
    });
  };

  const isNightTime = () => {
    const h = new Date().getHours();
    return h >= 21 || h <= 5;
  };

  // ======================
  // IRIS ADVANCED BRAIN 🧠
  // ======================
  const advancedIrisBrain = useCallback(async (speech: string) => {
    const cleaned = cleanSpeech(speech);

    // WAKE WORD FILTER
    if (!cleaned.includes("iris")) return;

    const intent = matchCommand(cleaned);
    setLastVoiceCommand(cleaned);

    switch (intent) {
      case "SOS":
        setIrisOutput("IRIS ALERT: Emergency detected");
        smartSpeak("Emergency detected. Sending SOS now.");
        triggerSOS(SOSCategory.FAMILY);
        openNearestPoliceStation();
        break;

      case "AREA":
        if (!currentLocation) {
          smartSpeak("GPS not available.");
          return;
        }
        const areaResult = backend.irisCheckArea(currentLocation.lat, currentLocation.lng);
        const nightRisk = isNightTime() ? " Night time detected. Stay alert." : "";
        setIrisOutput(`IRIS SAFETY INDEX: ${areaResult.label}\n${areaResult.message}${nightRisk}`);
        smartSpeak(areaResult.message + nightRisk);
        setActiveTab("map");
        break;

      case "LOCATION":
        if (!currentLocation) {
          smartSpeak("Location not ready. Please wait.");
          return;
        }
        const mapUrl = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
        setIrisMapUrl(mapUrl);
        window.open(mapUrl, "_blank");
        setIrisOutput(`IRIS LOCATION:\n${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`);
        smartSpeak("This is your current location. I have opened it on map.");
        setActiveTab("map");
        break;

      case "STOP":
        setIsSosActive(false);
        setSosSent(false);
        setIrisOutput("IRIS: STANDBY");
        smartSpeak("Command received. SOS protocol dismissed. I am standing by.");
        triggerVibration(200);
        break;

      default:
        setIrisOutput(`IRIS: LISTENING... ("${cleaned}")`);
        if (cleaned.length > 5) {
          smartSpeak("I did not understand. Say: Iris Emergency, Iris Check Area, or Iris Where Am I.");
        }
    }
  }, [currentLocation, triggerSOS, smartSpeak, triggerVibration, openNearestPoliceStation]);

  // ==============================
  // IRIS STRONG LISTENING ENGINE 🎧
  // ==============================
  const startLiveIrisStrong = useCallback((continuous: boolean = true) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // Hinglish + English support

    recognition.onstart = () => {
      setIrisVoiceActive(true);
      setIrisOutput("IRIS: Listening carefully...");
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      if (transcript.trim().length === 0) return;

      if (result.isFinal || transcript.trim().length > 4) {
        recognition.stop(); // FORCE final trigger for reliable processing
        advancedIrisBrain(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore all known debug/error boxes for smooth IRIS experience
      if (event.error === 'aborted' || event.error === 'no-speech') {
        console.debug("IRIS Voice Sensor: ignored error", event.error);
        return;
      }
      // For any other errors, still ignore to keep engine smooth
      return;
    };

    recognition.onend = () => {
      if (irisVoiceActive && !isSosActive) {
        setTimeout(() => {
          if (irisVoiceActive) {
            try { 
              recognition.start(); 
            } catch(e) {
              console.debug("IRIS: Restart attempt blocked by session status.");
            }
          }
        }, 1200); // AUTO restart safe
      } else {
        setIrisVoiceActive(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("IRIS: Initial start failed:", e);
    }
  }, [irisVoiceActive, isSosActive, advancedIrisBrain]);

  const stopIrisVoice = useCallback(() => {
    setIrisVoiceActive(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIrisOutput("IRIS: STANDBY");
  }, []);

  // LIVE API SECTION
  const startLiveSession = async () => {
    if (isLiveActive) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputCtx;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    setIsLiveActive(true);
    setLiveTranscription("IRIS Secure Link Establishing...");

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))), mimeType: 'audio/pcm;rate=16000' } 
            }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
          setLiveTranscription("IRIS LIVE: How can I protect you today?");
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) setLiveTranscription(prev => prev + " " + message.serverContent!.outputTranscription!.text);
          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            setIsModelSpeaking(true);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const rawBytes = atob(audioData);
            const bytes = new Uint8Array(rawBytes.length);
            for(let i=0; i<rawBytes.length; i++) bytes[i] = rawBytes.charCodeAt(i);
            const dataInt16 = new Int16Array(bytes.buffer);
            const frameCount = dataInt16.length;
            const buffer = outputCtx.createBuffer(1, frameCount, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            source.addEventListener('ended', () => {
              liveSourcesRef.current.delete(source);
              if (liveSourcesRef.current.size === 0) setIsModelSpeaking(false);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            liveSourcesRef.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            for (const s of liveSourcesRef.current.values()) s.stop();
            liveSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsModelSpeaking(false);
          }
        },
        onclose: () => setIsLiveActive(false),
        onerror: () => setIsLiveActive(false)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: `You are IRIS, a mission-critical safety assistant for women in India. You are calm, authoritative, and helpful. You understand Hindi and English. Current city: ${user?.city || 'Unknown'}. User: ${user?.name || 'Client'}.`
      }
    });
    liveSessionRef.current = sessionPromise;
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.then((s: any) => s.close());
      setIsLiveActive(false);
    }
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className={`flex flex-col h-screen overflow-hidden select-none transition-all duration-500 ${accessibilityMode ? 'bg-black text-white invert grayscale' : 'text-slate-900'}`}>
      <TechyBackground />
      
      {isSosActive && (
        <SOSOverlay 
          onStop={() => { setIsSosActive(false); setSosSent(false); audioRecorderRef.current?.stop(); }} 
          isSent={sosSent} 
          whatsappUrls={sosData} 
          isRecording={isRecording} 
        />
      )}

      <LiveSessionOverlay 
        isActive={isLiveActive} 
        onClose={stopLiveSession} 
        transcription={liveTranscription} 
        isModelSpeaking={isModelSpeaking} 
      />
      
      <header className={`px-6 pt-6 pb-2 flex items-center justify-between sticky top-0 z-30 ${accessibilityMode ? 'bg-black/90' : 'glass'}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Shield size={18} className="text-white fill-white" />
          </div>
          <span className="font-black text-sm tracking-tight uppercase text-white">IRIS Command</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={startLiveSession} className="bg-blue-600 text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse shadow-lg flex items-center space-x-2">
             <Mic size={14} />
             <span>IRIS LIVE</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth pb-24">
        {activeTab === 'dashboard' && (
          <Dashboard 
            user={user} contacts={contacts} onTriggerSOS={triggerSOS} location={currentLocation}
            irisVoiceActive={irisVoiceActive} 
            startIrisVoice={() => startLiveIrisStrong(true)}
            startSingleVoiceCommand={() => startLiveIrisStrong(false)}
            stopIrisVoice={stopIrisVoice}
            irisOutput={irisOutput} irisMapUrl={irisMapUrl} demoHighRisk={demoHighRisk}
          />
        )}
        {activeTab === 'map' && <SafetyMap location={currentLocation} demoHighRisk={demoHighRisk} />}
        {activeTab === 'contacts' && <ContactManager contacts={contacts} setContacts={setContacts} />}
        {activeTab === 'police' && <PoliceDashboard location={currentLocation} />}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Command Profile</h2>
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-[3.5rem] shadow-2xl border border-white/20 text-center">
                <div className="w-24 h-24 bg-rose-50 mx-auto rounded-[2rem] flex items-center justify-center text-rose-600 mb-4 shadow-inner">
                  <User size={48} strokeWidth={1.5} />
                </div>
                <p className="font-black text-3xl tracking-tighter text-slate-900">{user.name}</p>
                <p className="text-slate-500 font-bold text-sm">+91 {user.phone}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setSilentMode(!silentMode)} className={`p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center space-y-2 glass ${silentMode ? 'bg-slate-900 text-white' : ''}`}>
                <VolumeX size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Silent Mode</span>
              </button>
              <button onClick={() => setAccessibilityMode(!accessibilityMode)} className={`p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center space-y-2 glass ${accessibilityMode ? 'bg-slate-900 text-white' : ''}`}>
                <Eye size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Visual Aid</span>
              </button>
            </div>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-6 bg-white/10 backdrop-blur-sm text-white/40 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] border border-white/10">Log Out System</button>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 border-t border-white/10 px-8 py-4 flex justify-between items-center z-50 safe-area-bottom shadow-2xl ${accessibilityMode ? 'bg-black border-white/20' : 'glass'}`}>
        <NavButton active={activeTab === 'dashboard'} icon={<Home size={22} />} label="Home" onClick={() => setActiveTab('dashboard')} />
        <NavButton active={activeTab === 'map'} icon={<MapIcon size={22} />} label="Radar" onClick={() => setActiveTab('map')} />
        <NavButton active={activeTab === 'contacts'} icon={<Users size={22} />} label="Circle" onClick={() => setActiveTab('contacts')} />
        <NavButton active={activeTab === 'police'} icon={<Shield size={22} />} label="Patrol" onClick={() => setActiveTab('police')} />
        <NavButton active={activeTab === 'profile'} icon={<User size={22} />} label="Profile" onClick={() => setActiveTab('profile')} />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{active: boolean, icon: React.ReactNode, label: string, onClick: () => void}> = ({active, icon, label, onClick}) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1.5 transition-all duration-300 ${active ? 'text-rose-600 scale-110' : 'text-slate-400'}`}>
    <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-rose-50' : 'bg-transparent'}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

export default App;