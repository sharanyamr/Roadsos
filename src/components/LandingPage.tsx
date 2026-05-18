import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Zap, 
  Map as MapIcon, 
  HeartPulse, 
  Smartphone, 
  Globe,
  ChevronRight,
  ArrowRight,
  Stethoscope,
  Truck
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/src/lib/utils';

export default function LandingPage() {
  const { loginWithGoogle } = useAuth();

  const features = [
    {
      title: "AI Crash Detection",
      desc: "Advanced G-force and rotation analytics identify precise accident coordinates instantly.",
      icon: Activity,
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      title: "Satellite SOS",
      desc: "No internet? No problem. Automated SMS protocols activate via satellite fallbacks.",
      icon: Globe,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Guidance",
      desc: "Multilingual AI voice assistant guides victims through critical first-aid procedures.",
      icon: Smartphone,
      color: "text-green-500",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-red-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                <Shield className="text-white" size={24} />
             </div>
             <span className="text-2xl font-black font-display tracking-tighter">RoadSoS</span>
          </motion.div>
          <div className="hidden md:flex items-center gap-10">
             {['Platform', 'Technology', 'Network', 'Security'].map((item, i) => (
                <motion.a 
                  key={item} 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href="#" 
                  className="text-sm font-bold text-slate-500 hover:text-white transition-colors"
                >
                  {item}
                </motion.a>
             ))}
          </div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => loginWithGoogle()}
            className="px-6 py-2.5 glass border-white/10 rounded-xl text-sm font-black hover:bg-white/5 transition-all"
          >
            SIGN IN
          </motion.button>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-600/10 border border-red-500/20 rounded-full mb-8">
               <Zap size={14} className="text-red-500" />
               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Next-Gen Emergency Response</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight leading-[0.9] mb-8">
              SECONDS <span className="text-red-600 italic">SAVE</span> <br />
              <span className="relative">
                LIVES.
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 h-2 bg-red-600/20 rounded-full"
                />
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed mb-12">
              Artificial Intelligence meets emergency response. RoadSoS detects accidents in real-time, alerts responders, and guides victims when every heartbeat counts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
               <button 
                onClick={() => loginWithGoogle()}
                className="px-10 py-5 bg-red-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-red-700 active:scale-95 transition-all shadow-2xl shadow-red-600/30 group"
               >
                  ACTIVATE SYSTEM <ArrowRight className="group-hover:translate-x-1 transition-transform" />
               </button>
               <button className="px-10 py-5 glass border-white/10 text-white rounded-[24px] font-black text-lg hover:bg-white/5 transition-all">
                  VIEW NETWORK
               </button>
            </div>

            <div className="mt-16 flex items-center gap-8 grayscale opacity-40">
               <div className="flex items-center gap-2">
                  <Globe size={20} /> <span className="text-xs font-black uppercase tracking-widest">Satellite V.2</span>
               </div>
               <div className="flex items-center gap-2">
                  <Zap size={20} /> <span className="text-xs font-black uppercase tracking-widest">5G Ready</span>
               </div>
               <div className="flex items-center gap-2">
                  <Shield size={20} /> <span className="text-xs font-black uppercase tracking-widest">AES-256</span>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="glass p-4 rounded-[48px] border border-white/10 shadow-2xl relative z-10 overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=1000" 
                 className="w-full h-full rounded-[40px] grayscale brightness-75 hover:grayscale-0 transition-all duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
               
               {/* UI Overlays */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute top-10 right-10 glass p-6 rounded-3xl border-red-500/30 backdrop-blur-2xl shadow-2xl z-20"
               >
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <Activity className="text-white" size={16} />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest">Impact Detected</span>
                  </div>
                  <div className="space-y-2">
                     <div className="h-1 w-32 bg-red-600/20 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-red-600" />
                     </div>
                     <p className="text-[10px] font-black text-red-500 uppercase">Severity: Critical</p>
                  </div>
               </motion.div>

               <motion.div 
                 animate={{ y: [0, 10, 0] }}
                 transition={{ duration: 5, repeat: Infinity }}
                 className="absolute bottom-10 left-10 glass p-6 rounded-3xl border-blue-500/30 backdrop-blur-2xl shadow-2xl z-20"
               >
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Truck className="text-white" size={16} />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest">Rescue Unit</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-300">Unit #84-S Dispatcher Identified</p>
                  <p className="text-xs font-bold mt-1">ETA: 4 MINUTES</p>
               </motion.div>
            </div>
            
            {/* Decors around image */}
            <div className="absolute -top-10 -left-10 w-40 h-40 border-t-2 border-l-2 border-red-500/20 rounded-tl-[60px]" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border-b-2 border-r-2 border-blue-500/20 rounded-br-[60px]" />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-8 py-32 bg-slate-900/10 rounded-[60px] border border-white/5 mx-6">
           <div className="text-center mb-20">
              <motion.h2 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-xs font-black text-red-500 uppercase tracking-[0.4em] mb-4"
              >
                Core Technology
              </motion.h2>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black font-display tracking-tight"
              >
                PROTECTION WITHOUT BORDERS
              </motion.h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="glass p-10 rounded-[40px] border border-white/5 hover:border-red-500/20 transition-all group overflow-hidden relative"
                >
                   <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all transform group-hover:scale-125">
                      <f.icon size={160} />
                   </div>
                   <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-lg transition-transform group-hover:scale-110 relative z-10", f.bg)}>
                      <f.icon className={f.color} size={32} />
                   </div>
                   <h4 className="text-xl font-black mb-4 relative z-10">{f.title}</h4>
                   <p className="text-slate-500 font-medium leading-relaxed relative z-10">{f.desc}</p>
                   <button className="mt-8 flex items-center gap-2 text-xs font-black text-white hover:text-red-500 transition-colors uppercase tracking-widest relative z-10">
                      Explore AI <ChevronRight size={14} />
                   </button>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Mission Stats */}
        <section className="max-w-7xl mx-auto px-8 py-32 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
               <p className="text-5xl font-black font-display text-white">12MS</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Sensor Latency</p>
            </div>
            <div>
               <p className="text-5xl font-black font-display text-red-600">99.8%</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Detection Accuracy</p>
            </div>
            <div>
               <p className="text-5xl font-black font-display text-white">2.4M+</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Miles Monitored</p>
            </div>
            <div>
               <p className="text-5xl font-black font-display text-blue-600">4SEC</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Avg. Response Start</p>
            </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-8">
           <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
              <div className="flex items-center gap-3 grayscale opacity-30">
                 <Shield size={20} />
                 <span className="text-xl font-black font-display tracking-tighter">RoadSoS</span>
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                 © 2024 ROAD-SOS EMERGENCY SYSTEMS. ALL RIGHTS RESERVED. SATELLITE LINK ACTIVE.
              </p>
              <div className="flex gap-6">
                 {['Privacy', 'Legal', 'Infrastructure'].map(item => (
                    <a key={item} href="#" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-tighter">{item}</a>
                 ))}
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
