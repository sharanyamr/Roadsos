import React from 'react';
import { motion } from 'motion/react';
import { HeartPulse, CheckCircle2, AlertCircle, Clock, MapPin, Activity, ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const hospitals = [
  { 
    name: "Central Trauma Institute", 
    status: "Active", 
    icu: 12, 
    capacity: "82%", 
    readiness: "High",
    type: "Level 1 Trauma Center",
    staff: 142,
    rating: 4.9
  },
  { 
    name: "City Memorial Hospital", 
    status: "Busy", 
    icu: 4, 
    capacity: "94%", 
    readiness: "Medium",
    type: "General Emergency",
    staff: 86,
    rating: 4.7
  },
  { 
    name: "St. Jude Rescue Center", 
    status: "Active", 
    icu: 8, 
    capacity: "45%", 
    readiness: "Elite",
    type: "Critical Care Unit",
    staff: 54,
    rating: 5.0
  },
  { 
    name: "Westside General", 
    status: "Critical", 
    icu: 0, 
    capacity: "100%", 
    readiness: "Limited",
    type: "Community Health",
    staff: 32,
    rating: 4.2
  },
];

export default function HospitalManagement() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total ER Beds', value: '428', icon: Activity, color: 'text-blue-500' },
          { label: 'Available ICU', value: '24', icon: HeartPulse, color: 'text-red-500' },
          { label: 'On-duty Medics', value: '314', icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Avg Triage Time', value: '14m', icon: Clock, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[32px] border border-white/5">
             <stat.icon className={cn("w-6 h-6 mb-4", stat.color)} />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
             <p className="text-2xl font-black font-display">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hospitals.map((hospital, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-[40px] border border-white/5 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{hospital.name}</h3>
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg">
                    <Star className="text-yellow-500 fill-yellow-500" size={10} />
                    <span className="text-[10px] font-black">{hospital.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{hospital.type}</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg",
                hospital.status === 'Active' ? "bg-green-600 text-white shadow-green-600/20" :
                hospital.status === 'Busy' ? "bg-yellow-600 text-white shadow-yellow-600/20" :
                "bg-red-600 text-white shadow-red-600/20 animate-pulse"
              )}>
                {hospital.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacity</p>
                    <p className="text-sm font-black">{hospital.capacity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600/10 rounded-2xl flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ICU Beds</p>
                    <p className="text-sm font-black">{hospital.icu} Available</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Readiness</p>
                    <p className="text-sm font-black">{hospital.readiness}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">On-Duty</p>
                    <p className="text-sm font-black">{hospital.staff} Staff</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all border border-transparent hover:border-white/10">
              OPEN HOSPITAL PROTOCOL
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
