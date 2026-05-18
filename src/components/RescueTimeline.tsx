import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  MapPin, 
  UserPlus, 
  Hospital, 
  Truck, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  icon: React.ElementType;
}

export default function RescueTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="glass p-8 rounded-[40px] border border-white/10">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10 text-center">Live Rescue Operation Pipeline</h3>
      
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-6 left-8 right-8 h-0.5 bg-slate-900 z-0 hidden md:block" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0">
          {steps.map((step, i) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 w-full md:w-auto">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                  step.status === 'completed' ? "bg-green-500 text-white shadow-lg shadow-green-500/30" :
                  step.status === 'current' ? "bg-red-600 text-white shadow-xl shadow-red-600/40 animate-pulse ring-4 ring-red-600/20" :
                  "bg-slate-900 text-slate-600 border border-white/5"
                )}
              >
                {step.status === 'completed' ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
              </motion.div>
              
              <div className="mt-4 text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest mb-1",
                  step.status === 'current' ? "text-red-500" : 
                  step.status === 'completed' ? "text-green-500" : "text-slate-600"
                )}>
                  {step.status === 'current' ? 'IN PROGRESS' : step.status.toUpperCase()}
                </p>
                <p className={cn(
                  "text-[11px] font-bold md:max-w-[100px]",
                  step.status === 'pending' ? "text-slate-500" : "text-slate-200"
                )}>
                  {step.label}
                </p>
              </div>

              {/* Mobile connector line */}
              {i < steps.length - 1 && (
                 <div className="h-8 w-0.5 bg-slate-900 my-2 md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
