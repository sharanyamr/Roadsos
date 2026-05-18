import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/src/lib/utils';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: "Hello! I'm your RoadSoS Emergency AI. I can guide you through first-aid, vehicle safety, or emergency procedures. How can I help you right now?" }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI' | 'KN'>('EN');
  const scrollRef = useRef<HTMLDivElement>(null);

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
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I'm sorry, I'm having trouble connecting right now. Please seek professional medical help immediately if this is an emergency." }] }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'First Aid Basic', prompt: 'Give me basic first aid steps for an accident.' },
    { label: 'Bleeding Control', prompt: 'How to stop severe bleeding after an accident?' },
    { label: 'Fracture Support', prompt: 'What to do if someone has a broken bone?' },
    { label: 'Unconscious Victim', prompt: 'What to do if a victim is unconscious but breathing?' },
    { label: 'Call 112/911 Tips', prompt: 'What information should I give when calling emergency services?' },
  ];

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-180px)] flex flex-col lg:flex-row gap-6 mt-4">
      {/* Sidebar Quick Actions */}
      <div className="lg:w-72 flex flex-col gap-3 overflow-y-auto lg:overflow-visible pr-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Quick Protocol</h3>
          <span className="lg:hidden text-[10px] font-black text-slate-600 uppercase tracking-tighter">Scroll for more →</span>
        </div>
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              onClick={() => sendMessage(action.prompt)}
              className="whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink text-left p-4 glass rounded-2xl text-[11px] font-black uppercase tracking-wide hover:bg-red-600 hover:text-white transition-all border border-white/5 active:scale-95 shadow-lg shadow-black/20"
            >
              {action.label}
            </button>
          ))}
        </div>
        
        <div className="mt-auto glass p-6 rounded-[28px] border border-red-500/10 hidden lg:block">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Transmission Language</p>
           <div className="grid grid-cols-1 gap-2.5">
              {[
                { code: 'EN', name: 'English (US)' },
                { code: 'HI', name: 'Hindi (IN)' },
                { code: 'KN', name: 'Kannada (IN)' }
              ].map((l) => (
                <button 
                  key={l.code}
                  onClick={() => setLanguage(l.code as any)}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border",
                    language === l.code ? "bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-white/5 border-transparent text-slate-500 hover:text-white"
                  )}
                >
                  {l.name}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass rounded-[40px] flex flex-col overflow-hidden border border-white/10 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 animate-gradient-x" />
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display tracking-tight leading-tight">Emergency Command AI</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{language} INTERFACE ACTIVE</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 lg:hidden">
             {['EN', 'HI', 'KN'].map(l => (
               <button 
                 key={l}
                 onClick={() => setLanguage(l as any)}
                 className={cn(
                   "w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all",
                   language === l ? "bg-red-600 text-white" : "glass text-slate-500"
                 )}
               >
                 {l}
               </button>
             ))}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-opacity-20">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[92%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg",
                msg.role === 'user' ? "bg-white text-black" : "bg-red-600 text-white shadow-red-600/20"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-6 rounded-[28px] text-sm font-medium leading-relaxed shadow-xl",
                msg.role === 'user' ? "bg-red-600 text-white rounded-tr-none" : "bg-white/5 text-slate-200 border border-white/10 backdrop-blur-2xl rounded-tl-none"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>
                    {msg.parts[0].text}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4 mr-auto">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="p-6 rounded-[28px] bg-white/5 border border-white/10 rounded-tl-none">
                <div className="flex gap-1.5 items-center py-2 px-1">
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-100" />
                   <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-black/20 border-t border-white/10">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={language === 'EN' ? "Type your emergency query..." : language === 'HI' ? "अपनी आपातकालीन पूछताछ टाइप करें..." : "ನಿಮ್ಮ ತುರ್ತು ವಿಚಾರಣೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ..."}
              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all font-medium"
            />
            <button 
              onClick={() => sendMessage()}
              disabled={loading}
              className="w-16 h-16 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-xl shadow-red-600/30 flex-shrink-0"
            >
              <Send className="w-7 h-7" />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-[0.2em] font-black">
            Disclaimer: AI intelligence is providing guidance. Always coordinate with emergency services (112 / 911).
          </p>
        </div>
      </div>
    </div>
  );
}
