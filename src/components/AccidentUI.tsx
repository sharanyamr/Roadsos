import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Clock, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ImpactMeterProps {
  score: number;
  severity: string;
}

export function ImpactMeter({ score, severity }: ImpactMeterProps) {
  const getColor = () => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    if (score < 85) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray="364.4"
            animate={{ strokeDashoffset: 364.4 - (364.4 * score) / 100 }}
            className={cn("transition-colors duration-500", getColor())}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-black font-display", getColor())}>{Math.round(score)}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Impact Score</span>
        </div>
      </div>
      <div className={cn(
        "px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest",
        severity === 'None' ? "bg-slate-800 text-slate-500" :
        severity === 'Minor' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
        severity === 'Moderate' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
        severity === 'Severe' ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
        "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
      )}>
        {severity}
      </div>
    </div>
  );
}

export function EmergencyTimeline() {
  const steps = [
    { title: "Impact Detected", time: "0s", status: "complete", icon: ShieldAlert },
    { title: "SOS Triggered", time: "18s", status: "complete", icon: Clock },
    { title: "Dispatch Notified", time: "24s", status: "active", icon: Info },
    { title: "Responder On-route", time: "est. 2m", status: "pending", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4 group">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2",
              step.status === 'complete' ? "bg-green-500 border-green-500 text-white" :
              step.status === 'active' ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse" :
              "border-slate-800 text-slate-800"
            )}>
              <step.icon className="w-4 h-4" />
            </div>
            {i !== steps.length - 1 && (
              <div className={cn(
                "w-0.5 h-10 my-1",
                step.status === 'complete' ? "bg-green-500" : "bg-slate-800"
              )} />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex justify-between items-center">
              <h4 className={cn(
                "font-bold text-sm",
                step.status === 'pending' ? "text-slate-600" : "text-slate-200"
              )}>{step.title}</h4>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{step.time}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {step.status === 'complete' ? 'System successfully verified ' + step.title.toLowerCase() : 
               step.status === 'active' ? 'Units are currently being deployed...' : 'Awaiting confirmation'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
