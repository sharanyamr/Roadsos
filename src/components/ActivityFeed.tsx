import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  Activity, 
  ShieldAlert,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

interface ActivityItem {
  id: string;
  type: 'sos' | 'rescue' | 'hospital' | 'resolved' | 'network';
  title: string;
  description: string;
  timestamp: string;
  status: 'critical' | 'info' | 'success' | 'warning';
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'emergencies'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ActivityItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'sos',
          title: `SOS: ${data.userName || 'Anonymous'}`,
          description: `Location: ${data.location?.lat.toFixed(4)}, ${data.location?.lng.toFixed(4)}. Severity: ${data.severity}`,
          timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString() : 'Just now',
          status: data.severity === 'Critical' ? 'critical' : 'warning'
        };
      });
      
      // Merge with some static "system" activities for polish
      setActivities([
        ...items,
        {
          id: 'sys-1',
          type: 'network',
          title: 'Satellite Guard Active',
          description: 'Global grid monitoring enabled. Latency: 42ms.',
          timestamp: 'Steady',
          status: 'success'
        }
      ]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="glass p-8 rounded-[40px] border border-white/10 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-3">
             <Activity className="text-red-500" /> Live Response Feed
          </h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Real-time incident stream</p>
        </div>
        <div className="flex gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "group glass p-5 rounded-[28px] border transition-all hover:bg-white/5",
                activity.status === 'critical' ? "border-red-500/20 bg-red-600/5 shadow-lg shadow-red-600/5" : "border-white/5"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  activity.status === 'critical' ? "bg-red-600 text-white" :
                  activity.status === 'success' ? "bg-green-500/10 text-green-500" :
                  activity.status === 'warning' ? "bg-orange-500/10 text-orange-500" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {activity.type === 'sos' && <ShieldAlert size={18} />}
                  {activity.type === 'rescue' && <Truck size={18} />}
                  {activity.type === 'hospital' && <MapPin size={18} />}
                  {activity.type === 'resolved' && <CheckCircle2 size={18} />}
                  {activity.type === 'network' && <Zap size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm truncate pr-2">{activity.title}</h4>
                    <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap">{activity.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed truncate group-hover:whitespace-normal transition-all">{activity.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button className="w-full mt-6 py-4 glass border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all">
        VIEW FULL INCIDENTS LOG
      </button>
    </div>
  );
}
