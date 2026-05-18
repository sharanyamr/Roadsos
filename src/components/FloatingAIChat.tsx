import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  X, 
  Minus, 
  User, 
  Loader2, 
  ShieldAlert, 
  Zap, 
  PhoneCall, 
  HeartPulse, 
  Languages,
  ArrowRight,
  WifiOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface FloatingAIChatProps {
  emergencyActive?: boolean;
}

export default function FloatingAIChat({ emergencyActive = false }: FloatingAIChatProps) {
  const isOnline = useOnlineStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: "Hello! I'm your RoadSoS AI. How can I assist you with road safety or emergency guidance today?" }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI' | 'KN'>('EN');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (emergencyActive && !isOpen) {
      setIsOpen(true);
      setMessages(prev => [
        ...prev,
        { role: 'model', parts: [{ text: "⚠️ **EMERGENCY MODE ACTIVATED**\n\nStay calm. I am here to help. Emergency services have been notified of your location. Are you injured? Should I provide first-aid steps?" }] }
      ]);
    }
  }, [emergencyActive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', parts: [{ text }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (!isOnline) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: "📡 **Connection Lost.**\n\nI can't access Gemini AI right now, but here are some offline first-aid tips:\n1. Apply pressure to wounds.\n2. Keep victims warm.\n3. Do not move victims unless necessary." }] 
      }]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: language === 'EN' ? text : `${text} (Please respond in ${language === 'HI' ? 'Hindi' : 'Kannada'})`,
          history: messages 
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'First Aid Help', prompt: 'I need first aid instructions for a road accident victim.', icon: HeartPulse },
    { label: 'Nearby Hospitals', prompt: 'Where are the nearest hospitals?', icon: MapPin },
    { label: 'Accident Steps', prompt: 'What should I do immediately after an accident?', icon: ShieldAlert },
    { label: 'Call Ambulance', prompt: 'Please provide instructions to call and prepare for an ambulance.', icon: PhoneCall },
  ];

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'HI', name: 'Hindi' },
    { code: 'KN', name: 'Kannada' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[2000] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "glass w-[380px] md:w-[420px] h-[600px] rounded-[32px] overflow-hidden flex flex-col border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl",
              emergencyActive && "border-red-500/50 shadow-[0_0_80px_rgba(239,68,68,0.2)]"
            )}
          >
            {/* Header */}
            <div className={cn(
              "p-5 flex items-center justify-between border-b border-white/10",
              emergencyActive ? "bg-red-600/20" : "bg-white/5"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg relative",
                  emergencyActive ? "bg-red-600 shadow-red-600/40" : "bg-red-600 shadow-red-600/20"
                )}>
                  <Bot className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">RoadSoS AI {emergencyActive ? 'Rescue' : 'Assistant'}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active & Secure</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex bg-white/5 p-1 rounded-lg">
                    {languages.map((l) => (
                      <button 
                        key={l.code}
                        onClick={() => setLanguage(l.code as any)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black transition-all",
                          language === l.code ? "bg-red-600 text-white" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        {l.code}
                      </button>
                    ))}
                 </div>
                 <button onClick={() => setIsOpen(false)} className="p-2 glass-dark rounded-xl hover:bg-white/10 transition-all">
                    <Minus className="w-4 h-4 text-slate-400" />
                 </button>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                    msg.role === 'user' ? "bg-slate-800" : "bg-red-600/10 text-red-500"
                  )}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl text-xs font-medium leading-relaxed max-w-[80%]",
                    msg.role === 'user' ? "bg-red-600 text-white shadow-md" : "bg-white/5 border border-white/10 text-slate-200"
                  )}>
                    <div className="prose prose-invert prose-xs">
                      <ReactMarkdown>
                        {msg.parts[0].text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin text-red-500" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-24" />
                </div>
              )}
            </div>

            {/* Quick Actions Scroll */}
            <div className="px-5 py-2 overflow-x-auto flex gap-2 no-scrollbar bg-black/20">
               {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 glass rounded-full text-[10px] font-bold hover:bg-red-600 transition-all border border-white/5 hover:border-red-500/50"
                  >
                    <action.icon size={12} className="text-red-500" />
                    {action.label}
                  </button>
               ))}
            </div>

            {/* Input */}
            <div className={cn(
              "p-5 bg-white/5 border-t border-white/10",
              emergencyActive && "bg-red-600/5"
            )}>
              {!isOnline && (
                <div className="flex items-center gap-2 mb-3 bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                   <WifiOff size={12} className="text-orange-500" />
                   <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">AI Offline Mode Active</span>
                </div>
              )}
              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={!isOnline ? "Type for emergency info..." : emergencyActive ? "Ask anything for help..." : "Type a message..."}
                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                />
                <button 
                  onClick={() => sendMessage()}
                  disabled={loading}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-red-600/30"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl relative transition-all group",
          emergencyActive 
            ? "bg-red-600 shadow-red-600/50 animate-pulse border-4 border-red-400" 
            : "bg-red-600 shadow-red-600/30 border border-white/10"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <Minus className="w-8 h-8 text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && emergencyActive && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg ring-4 ring-slate-950">
            <ShieldAlert size={20} />
          </div>
        )}
      </motion.button>
    </div>
  );
}

function MapPin(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
