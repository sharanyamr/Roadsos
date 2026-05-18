import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Activity, 
  Navigation,
  Phone,
  X,
  HeartPulse
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import MapComponent from '../Map';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface Incident {
  id: string;
  user: string;
  severity: string;
  status: string;
  time: string;
  location: [number, number];
  age: number;
  userId: string;
}

export default function LiveIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'emergencies'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Incident[] = snapshot.docs.map(document => {
        const data = document.data();
        return {
          id: document.id,
          user: data.userName || 'Anonymous Operator',
          severity: data.severity || 'Unknown',
          status: data.status || 'Pending',
          time: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown',
          location: [data.location?.lat || 37.7749, data.location?.lng || -122.4194],
          age: data.userAge || 0,
          userId: data.userId
        };
      });
      setIncidents(items);
      if (items.length > 0 && !selectedIncident) {
        setSelectedIncident(items[0]);
      }
    });

    return () => unsubscribe();
  }, [selectedIncident]);

  const resolveIncident = async (id: string) => {
    try {
      await updateDoc(doc(db, 'emergencies', id), {
        status: 'Resolved'
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
      {/* Incidents List */}
      <div className="xl:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 mb-2 flex items-center justify-between">
          Active Alerts
          <span className="bg-red-600 text-white px-2 py-0.5 rounded-full">{incidents.length}</span>
        </h3>
        {incidents.map((incident) => (
          <motion.button
            key={incident.id}
            onClick={() => setSelectedIncident(incident)}
            whileHover={{ x: 4 }}
            className={cn(
              "glass p-5 rounded-[28px] border text-left transition-all group relative overflow-hidden",
              selectedIncident?.id === incident.id 
                ? "border-red-500/50 bg-red-600/5 ring-1 ring-red-500/20" 
                : "border-white/5 hover:border-white/20"
            )}
          >
            {incident.severity === 'Critical' && (
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
            )}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  incident.severity === 'Critical' ? "bg-red-600/10 text-red-500" :
                  incident.severity === 'Severe' ? "bg-orange-600/10 text-orange-500" : "bg-yellow-600/10 text-yellow-500"
                )}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{incident.user}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none mt-1">{incident.id.substring(0, 8)} • {incident.time}</p>
                </div>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                incident.status === 'Pending' ? "bg-slate-800 text-slate-400" :
                incident.status === 'Resolved' ? "bg-green-600 text-white" : "bg-blue-600 text-white"
              )}>
                {incident.status}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  incident.severity === 'Critical' ? "bg-red-500 animate-pulse" : "bg-orange-500"
                )} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{incident.severity}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Incident Control Center */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {selectedIncident ? (
            <motion.div 
              key={selectedIncident.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="glass rounded-[40px] overflow-hidden flex-1 relative min-h-[400px]">
                <MapComponent 
                  emergencyActive={true} 
                  userLocation={[selectedIncident.location[0], selectedIncident.location[1]]} 
                />
                
                {/* Floating Info Over Map */}
                <div className="absolute top-6 left-6 z-[1000] space-y-3 pointer-events-none">
                  <div className="glass-dark p-6 rounded-[32px] border border-white/10 backdrop-blur-2xl shadow-2xl min-w-[280px]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                        <Activity className="w-8 h-8 text-red-500 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black font-display uppercase leading-tight">{selectedIncident.user}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Incident #SOS-{selectedIncident.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Co-ordinates</p>
                        <p className="text-[11px] font-mono font-bold tracking-tight">{selectedIncident.location[0].toFixed(4)}° N, {selectedIncident.location[1].toFixed(4)}° W</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activation Time</p>
                        <p className="text-[11px] font-mono font-bold tracking-tight">{selectedIncident.time}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         <span>Rescue Progress</span>
                         <span className={cn("transition-colors", selectedIncident.status === 'Resolved' ? "text-green-500" : "text-blue-500")}>
                           {selectedIncident.status === 'Resolved' ? '100%' : '65%'}
                         </span>
                       </div>
                       <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                         <div className={cn("h-full transition-all duration-1000", selectedIncident.status === 'Resolved' ? "bg-green-500 w-full" : "bg-blue-500 w-2/3")} />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
                  <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 font-bold group pointer-events-auto">
                    <Navigation className="w-5 h-5 group-hover:translate-x-1 transition-all" />
                    DISPATCH AIR-MED
                  </button>
                  <button className="glass hover:bg-white/10 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 font-bold group pointer-events-auto">
                    <Phone className="w-5 h-5" />
                    CALL INCIDENT SITE
                  </button>
                </div>
              </div>

              {/* Status Tracker */}
              <div className="glass p-8 rounded-[40px] flex items-center justify-between border border-white/5">
                <div className="flex gap-12">
                   {[
                     { label: 'RESPONDER', value: 'Unit R-402', icon: Activity },
                     { label: 'TARGET HOSPITAL', value: 'City Memorial', icon: HeartPulse },
                     { label: 'STATUS', value: selectedIncident.status, icon: Clock }
                   ].map((item, i) => (
                     <div key={i} className="space-y-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <item.icon className="w-3 h-3" /> {item.label}
                        </p>
                        <p className="text-sm font-bold">{item.value}</p>
                     </div>
                   ))}
                </div>
                <div className="flex gap-3">
                  <button className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                  {selectedIncident.status !== 'Resolved' && (
                    <button 
                      onClick={() => resolveIncident(selectedIncident.id)}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-600/30 hover:bg-green-700"
                    >
                      RESOLVE INCIDENT
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 glass rounded-[40px] border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12">
               <Activity className="w-16 h-16 text-slate-800 mb-6" />
               <h3 className="text-2xl font-bold text-slate-500 mb-2">Select an incident to monitor</h3>
               <p className="text-slate-600 max-w-sm">Detailed monitoring and rescue coordination will appear here once an alert is selected.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
