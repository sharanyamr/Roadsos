import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  Navigation, 
  Activity, 
  Map as MapIcon, 
  Phone,
  Clock,
  HeartPulse,
  ChevronRight,
  ShieldAlert,
  Zap,
  X,
  UserPlus,
  Truck,
  Hospital,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/src/lib/utils';
import MapComponent from './Map';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useImpactDetection, ImpactSeverity } from './hooks/useImpactDetection';
import { ImpactMeter, EmergencyTimeline } from './components/AccidentUI';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';
import { useContacts } from './contexts/ContactsContext';
import RescueTimeline from './components/RescueTimeline';
import ActivityFeed from './components/ActivityFeed';
import { useSimulation } from './hooks/useSimulation';
import { toast } from 'sonner';

export default function Dashboard({ emergencyActive, setEmergencyActive }: { emergencyActive: boolean, setEmergencyActive: (v: boolean) => void }) {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const { contacts } = useContacts();
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [offlineRequests, setOfflineRequests] = useState<any[]>([]);
  const [rescueStage, setRescueStage] = useState(0);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const { state: simState, runScenario, resetSimulation } = useSimulation();

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        toast.success("Location updated successfully.");
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        setLocationError("Failed to get location. Please check your GPS settings.");
        toast.error("Location detection failed.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  useEffect(() => {
    if (simState.stage === 'impact_detected') {
      simulateImpact('Severe');
    } else if (simState.stage === 'sos_triggered') {
      triggerSOS();
    } else if (simState.stage === 'notifying_contacts') {
      setRescueStage(3);
    } else if (simState.stage === 'hospital_assigned') {
      setRescueStage(4);
    } else if (simState.stage === 'ambulance_dispatched') {
      setRescueStage(5);
    } else if (simState.stage === 'en_route') {
      setRescueStage(6);
    } else if (simState.stage === 'resolved') {
      setRescueStage(7);
    }
  }, [simState.stage]);

  const startDemo = () => {
    setIsDemoMode(true);
    toast.info("Demo Mode Initialized. Starting scenario...");
    runScenario(() => {
      // Impact callback
    });
  };

  const stopDemo = () => {
    setIsDemoMode(false);
    resetSimulation();
    setEmergencyActive(false);
    setRescueStage(0);
    stopMonitoring();
    resetData();
    toast.success("Simulation Interrupted.");
  };

  const { isListening, isSupported, startListening, speak } = useVoiceAssistant({
    lang: voiceLang,
    onCommand: (cmd) => {
      if (cmd.includes('help') || cmd.includes('sos') || cmd.includes('emergency')) {
        triggerSOS();
        toast.success("Voice SOS Triggered!");
      } else if (cmd.includes('ambulance')) {
        triggerSOS();
        toast.success("Trauma unit requested via voice.");
      }
    }
  });

  useEffect(() => {
    // Load offline pending requests
    const saved = localStorage.getItem('pending_emergencies');
    if (saved) setOfflineRequests(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isOnline && offlineRequests.length > 0) {
      // Sync logic
      syncOfflineRequests();
    }
  }, [isOnline]);

  const syncOfflineRequests = async () => {
    console.log("Syncing offline requests...");
    for (const req of offlineRequests) {
      try {
        await addDoc(collection(db, 'emergencies'), {
          ...req,
          syncedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Sync failed for request", e);
      }
    }
    setOfflineRequests([]);
    localStorage.removeItem('pending_emergencies');
  };
  
  const { isMonitoring, data, lastImpact, startMonitoring, stopMonitoring, simulateImpact, setLastImpact, resetData } = useImpactDetection();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err)
      );
    }
  }, []);

  // Handle detection trigger
  useEffect(() => {
    if (data.severity === 'Severe' || data.severity === 'Critical') {
      if (!emergencyActive && countdown === null) {
        setCountdown(10);
      }
    }
  }, [data.severity, emergencyActive, countdown]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
    } else if (countdown === 0) {
      triggerSOS();
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    if (emergencyActive) return;
    const startTime = Date.now();
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 2000) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        triggerSOS();
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      }
    }, 50);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setHoldProgress(0);
  };

  const triggerSOS = async () => {
    if (!user || !location) return;
    
    setEmergencyActive(true);
    setHoldProgress(0);
    setCountdown(null);
    setRescueStage(2); // Broadcast stage

    const primaryContact = contacts.find(c => c.priority === 'primary');
    const alertMsg = `EMERGENCY ALERT: ${user.displayName} is in distress. Location: https://maps.google.com/?q=${location.lat},${location.lng}. RoadSoS is monitoring the situation.`;
    
    if (primaryContact) {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 2000)),
        {
          loading: `Alerting ${primaryContact.name}...`,
          success: `Emergency alert sent to ${primaryContact.name}.`,
          error: 'Failed to notify primary contact.',
        }
      );
    }

    speak("Emergency alert activated. Notifying emergency contacts and responders. Stay calm, help is on the way.");

    // Simulate rescue progression for real SOS too
    if (!isDemoMode) {
      setTimeout(() => {
        setRescueStage(3);
        speak("Contacts notified successfully. Rescue operation in progress.");
      }, 5000);
      
      setTimeout(() => {
        setRescueStage(4);
        speak("Trauma center identified. Ambulance dispatched.");
      }, 12000);
    }
    
    const emergencyData = {
      userId: user.uid,
      userName: user.displayName,
      location,
      status: 'active',
      severity: data.severity,
      timestamp: Date.now(), // Real timestamp for local storage
    };

    if (isOnline) {
      try {
        await addDoc(collection(db, 'emergencies'), {
          ...emergencyData,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("SOS Trigger failed:", error);
      }
    } else {
      // Offline mode
      const updatedRequests = [...offlineRequests, emergencyData];
      setOfflineRequests(updatedRequests);
      localStorage.setItem('pending_emergencies', JSON.stringify(updatedRequests));
      
      // Generate SMS Link
      const message = `EMERGENCY RoadSoS: ${user.displayName} needs help! Location: https://www.google.com/maps?q=${location.lat},${location.lng}. Severity: ${data.severity}.`;
      const smsLink = `sms:?body=${encodeURIComponent(message)}`;
      window.location.href = smsLink;
    }
  };

  const cancelAlert = () => {
    setCountdown(null);
    setEmergencyActive(false);
    setRescueStage(0);
    stopMonitoring();
    resetData();
  };

  return (
    <div className="relative max-w-[1600px] mx-auto">
      {/* Demo Mode Overlay Indicator */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[45] bg-red-600/90 backdrop-blur-md px-6 py-2 rounded-full border border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center gap-3"
          >
             <div className="w-2 h-2 bg-white rounded-full animate-ping" />
             <span className="text-xs font-black text-white uppercase tracking-[0.2em]">DEMO MODE ACTIVE</span>
             <button 
               onClick={stopDemo}
               className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-all"
             >
               <X size={14} className="text-white" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Overlay Countdown */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-600/20 backdrop-blur-3xl"
          >
            <div className="glass-dark p-12 rounded-[40px] text-center max-w-lg w-full border-red-500/50 shadow-[0_0_100px_rgba(239,68,68,0.3)]">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-600/50"
              >
                <ShieldAlert className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-4xl font-black font-display tracking-tight mb-4">CRITICAL IMPACT DETECTED</h2>
              <p className="text-slate-400 mb-12 text-lg">
                {isOnline ? "Alerting EMS" : "Internet unavailable. Pre-generating emergency SMS"} in <span className="text-red-500 font-bold">{countdown}s</span>. Are you safe?
              </p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={triggerSOS}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all text-xl shadow-lg shadow-red-600/20"
                >
                  {isOnline ? "SEND SOS NOW" : "SEND SMS SOS"}
                </button>
                <button 
                  onClick={cancelAlert}
                  className="w-full py-4 glass text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  CANCEL (I AM SAFE)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Map & Detection Status */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Hero Emergency Banner */}
          {emergencyActive && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className={cn(
                "p-6 rounded-3xl flex items-center justify-between shadow-lg overflow-hidden",
                isOnline ? "bg-red-600 shadow-red-600/30" : "bg-orange-600 shadow-orange-600/30"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">RESCUE OPERATION ACTIVE</h2>
                  <p className="text-red-100 text-sm">
                    {isOnline ? "Dispatched to your co-ordinates. Stay where you are." : "Offline Alert Sent via SMS. Local救援 active."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!isOnline && (
                   <button 
                    onClick={() => {
                      const message = `EMERGENCY RoadSoS: ${user?.displayName} needs help! Location: https://www.google.com/maps?q=${location?.lat},${location?.lng}. Status: CRITICAL.`;
                      navigator.clipboard.writeText(message);
                      alert("Emergency details copied to clipboard!");
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all"
                  >
                    COPY SOS MSG
                  </button>
                )}
                <button 
                  onClick={() => {
                    setEmergencyActive(false);
                    setRescueStage(0);
                    resetData();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          )}

          {offlineRequests.length > 0 && !emergencyActive && (
             <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border-orange-500/20 p-5 rounded-3xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                 <div className="bg-orange-500/20 p-2 rounded-xl">
                    <Clock className="text-orange-500" size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold">Pending Sync: {offlineRequests.length} Requests</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Will automatically send when online</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => syncOfflineRequests()}
                   disabled={!isOnline}
                   className="text-[10px] font-black px-4 py-2 bg-white/5 rounded-lg border border-white/10 disabled:opacity-30"
                 >
                    MANUAL SYNC
                 </button>
              </div>
            </motion.div>
          )}

          <section className="glass rounded-[40px] overflow-hidden h-[400px] md:h-[600px] relative">
            <MapComponent 
              emergencyActive={emergencyActive} 
              userLocation={location ? [location.lat, location.lng] : null} 
            />
            
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-3 pointer-events-none">
              <div className="glass px-5 py-2.5 rounded-full flex items-center gap-3 text-sm font-black tracking-tight backdrop-blur-xl border-white/20 pointer-events-auto">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full animate-pulse",
                  location ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                )} />
                {isLocating ? 'CALIBRATING GPS...' : location ? 'LIVE TRACKING ACTIVE' : 'LOCATING...'}
              </div>
              
              {location && (
                <div className="glass px-4 py-2 rounded-xl text-[10px] font-bold text-slate-300 border border-white/10 backdrop-blur-xl pointer-events-auto">
                   GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
              
              {locationError && (
                <div className="glass px-4 py-2 rounded-xl text-[10px] font-bold text-red-500 border border-red-500/20 bg-red-500/5 backdrop-blur-xl pointer-events-auto">
                  {locationError}
                </div>
              )}
            </div>

            <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
               <button 
                onClick={refreshLocation}
                disabled={isLocating}
                className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all group backdrop-blur-xl border-white/20"
                title="Refresh GPS"
               >
                 <Navigation className={cn("w-5 h-5", isLocating ? "animate-spin text-blue-500" : "text-white group-hover:scale-110")} />
               </button>
            </div>

            <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
              <div className="glass p-4 rounded-3xl min-w-[200px] backdrop-blur-xl">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Smart Detection</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">G-Force Monitor</span>
                  <span className="text-green-500 text-xs font-bold">{data.acceleration.toFixed(2)}G</span>
                </div>
                {!isMonitoring && (
                  <button 
                    onClick={startMonitoring}
                    className="w-full mt-3 py-2 bg-red-600 rounded-xl text-xs font-bold hover:bg-red-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" /> START MONITORING
                  </button>
                )}
              </div>
            </div>
          </section>

          {emergencyActive && (
            <RescueTimeline 
              steps={[
                { id: 'impact', label: 'Impact Detected', status: 'completed', icon: Activity },
                { id: 'sos', label: 'SOS Broadcast', status: rescueStage >= 2 ? 'completed' : 'current', icon: ShieldAlert },
                { id: 'notify', label: 'Contacts Notified', status: rescueStage >= 3 ? 'completed' : rescueStage === 2 ? 'current' : 'pending', icon: UserPlus },
                { id: 'hospital', label: 'Hospital Assigned', status: rescueStage >= 4 ? 'completed' : rescueStage === 3 ? 'current' : 'pending', icon: Hospital },
                { id: 'dispatch', label: 'Dispatch Approved', status: rescueStage >= 5 ? 'completed' : rescueStage === 4 ? 'current' : 'pending', icon: Truck },
                { id: 'rescue', label: 'Rescue En Route', status: rescueStage >= 6 ? 'completed' : rescueStage === 5 ? 'current' : 'pending', icon: Activity },
                { id: 'resolved', label: 'Rescue Completed', status: rescueStage >= 7 ? 'completed' : rescueStage === 6 ? 'current' : 'pending', icon: CheckCircle2 },
              ]} 
            />
          )}

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ActivityFeed />
            
            <div className="space-y-8">
               <div className="glass p-10 rounded-[40px] border border-white/10 bg-gradient-to-br from-blue-600/5 to-transparent">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-bold flex items-center gap-3">
                        <Zap className="text-blue-500" /> Mission Analytics
                     </h3>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Monitoring</span>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-3xl font-black font-display tracking-tight text-white">
                          {isDemoMode ? (0.01 + Math.random() * 0.1).toFixed(2) : "1.02"}s
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Latency</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-black font-display tracking-tight text-green-500">
                          {isDemoMode ? (99.1 + Math.random() * 0.8).toFixed(1) : "99.8"}%
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detection Confidence</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-black font-display tracking-tight text-white">
                          {isDemoMode ? simState.stage.toUpperCase().replace('_', ' ') : "Sector 4"}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isDemoMode ? "Current Stage" : "Active Grid"}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-black font-display tracking-tight text-blue-500">
                          {isDemoMode ? simState.eta ?? "--" : "22 Unit"}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isDemoMode ? "ETA (MINS)" : "Nearby Responders"}</p>
                     </div>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-white/5 flex gap-4">
                     {isDemoMode ? (
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">{simState.message}</span>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{simState.progress}%</span>
                           </div>
                           <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${simState.progress}%` }}
                                className="h-full bg-red-600"
                              />
                           </div>
                           <button 
                             onClick={stopDemo}
                             className="w-full py-4 glass border-red-500/30 text-red-500 rounded-[24px] font-black text-xs hover:bg-red-500/10 transition-all"
                           >
                              EXIT SIMULATION
                           </button>
                        </div>
                     ) : (
                        <button 
                          onClick={startDemo}
                          className="flex-1 py-4 bg-white text-black rounded-[24px] font-black text-xs hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                        >
                           START HACKATHON DEMO
                        </button>
                     )}
                     <button className="w-14 h-14 glass rounded-[24px] flex items-center justify-center text-slate-400 hover:text-white transition-all">
                        <Navigation size={20} />
                     </button>
                  </div>
               </div>

               <div className="glass p-8 rounded-[40px] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                     <ShieldAlert size={120} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300 mb-4">Strategic Protocol Update</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                     RoadSoS V.2 has been deployed to your device. New satellite-link fallback systems are active for all critical sectors.
                  </p>
                  <button className="mt-6 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:gap-3 transition-all">
                     View Security Audit <ChevronRight size={14} />
                  </button>
               </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-8 rounded-[32px] flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Sensor Analytics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-500">ACCELERATION</span>
                      <span>{(isDemoMode && simState.stage === 'driving' ? simState.drivingData.acc : data.acceleration).toFixed(2)} G</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${Math.min((isDemoMode && simState.stage === 'driving' ? simState.drivingData.acc : data.acceleration) * 10, 100)}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-500">ROTATIONAL FORCE</span>
                      <span>{(isDemoMode && simState.stage === 'driving' ? simState.drivingData.rot : data.rotation).toFixed(0)}°/s</span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${Math.min((isDemoMode && simState.stage === 'driving' ? simState.drivingData.rot : data.rotation) / 5, 100)}%` }}
                        className="h-full bg-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3">
                <button 
                  onClick={() => simulateImpact('Severe')}
                  className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20 transition-all"
                >
                  SIMULATE SEVERE CRASH
                </button>
              </div>
            </div>

            <div className="glass p-8 rounded-[32px]">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-500" /> Trauma Support
              </h3>
              <div className="space-y-4">
                {[
                  { text: 'Check Pulse & Airways', icon: Activity },
                  { text: 'Apply Direct Pressure', icon: ShieldAlert },
                  { text: 'Immobilise the Spine', icon: Navigation }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-2xl border border-white/5 group hover:border-red-500/30 transition-all">
                    <div className="w-10 h-10 bg-slate-800 group-hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-all">
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - SOS & Timeline */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <section className="glass p-10 rounded-[40px] text-center space-y-8 flex flex-col items-center border border-white/10 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight font-display">EMERGENCY SOS</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed px-4">Instant alert system to emergency personnel</p>
            </div>
            
            <div className="relative">
              {holdProgress > 0 && (
                <svg className="absolute -inset-6 w-44 h-44 -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="80"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.1)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="88"
                    cy="88"
                    r="80"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray="502.65"
                    animate={{ strokeDashoffset: 502.65 - (502.65 * holdProgress) / 100 }}
                    transition={{ type: "tween", ease: "linear" }}
                  />
                </svg>
              )}
              <motion.button 
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                className={cn(
                  "emergency-btn w-32 h-32 text-3xl z-10 relative",
                  emergencyActive && "bg-red-900 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                )}
              >
                {emergencyActive ? <Activity className="w-14 h-14" /> : "SOS"}
              </motion.button>
            </div>

            <div className="w-full pt-4 space-y-3">
              {isSupported && (
                 <button 
                  onClick={startListening}
                  className={cn(
                    "flex items-center justify-between w-full p-5 rounded-[24px] transition-all border",
                    isListening ? "bg-red-600 border-red-500 shadow-lg animate-pulse" : "glass border-white/5 hover:bg-white/10"
                  )}
                 >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isListening ? "bg-white/20" : "bg-red-600/10"
                      )}>
                        <Volume2 className={cn("w-5 h-5", isListening ? "text-white" : "text-red-500")} />
                      </div>
                      <span className="font-bold text-sm">{isListening ? 'Listening...' : 'Voice SOS Activation'}</span>
                    </div>
                    <Activity size={14} className={isListening ? 'text-white' : 'text-slate-600'} />
                 </button>
              )}

              {isSupported && (
                 <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    {[
                      { code: 'en-US', label: 'English' },
                      { code: 'hi-IN', label: 'Hindi' },
                      { code: 'kn-IN', label: 'Kannada' }
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setVoiceLang(l.code);
                          toast.info(`Voice recognition set to ${l.label}`);
                        }}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                          voiceLang === l.code ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                 </div>
              )}

              <button className="flex items-center justify-between w-full p-5 glass rounded-[24px] hover:bg-white/10 group transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="font-bold text-sm">Call Trauma Service</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="flex items-center justify-between w-full p-5 glass rounded-[24px] hover:bg-white/10 group transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-bold text-sm">Share My Status</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </section>

          <section className="glass p-10 rounded-[40px] space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500">Live Rescue Dashboard</h3>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            
            <div className="flex justify-center py-4">
              <ImpactMeter 
                score={isDemoMode && simState.stage !== 'idle' && simState.stage !== 'driving' ? 88 + Math.random() * 8 : data.score} 
                severity={isDemoMode && simState.stage !== 'idle' && simState.stage !== 'driving' ? 'CRITICAL' : data.severity} 
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Rescue Progress</h4>
              <EmergencyTimeline />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
