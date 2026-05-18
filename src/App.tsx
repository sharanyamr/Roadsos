import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  MapPin, 
  Shield, 
  MessageSquare, 
  Navigation, 
  PhoneCall,
  Menu,
  X,
  ChevronRight,
  Zap,
  LogOut,
  Settings,
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { cn } from '@/src/lib/utils';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { Toaster } from 'sonner';
import Dashboard from './Dashboard';
import AIChat from './AIChat';
import AdminPanel from './admin/AdminPanel';
import FloatingAIChat from './components/FloatingAIChat';
import ProfileSettings from './Settings';
import LandingPage from './components/LandingPage';

export default function App() {
  const { user, loginWithGoogle, logout, loading } = useAuth();
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'chat' | 'admin' | 'settings'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Simple admin check
  const isAdmin = user?.email === 'sharanyamr2004@gmail.com';

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/5 blur-[100px] animate-pulse" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/20">
             <Shield className="text-white w-10 h-10" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.4em] text-red-500">Initializing Protocol</span>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab('home');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
        {/* Modern Nav */}
        <nav className="fixed top-0 left-0 right-0 z-[60] glass px-8 py-4 flex justify-between items-center border-b border-white/5 backdrop-blur-2xl">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20 group-hover:bg-red-500 transition-colors">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-display tracking-tightest">RoadSoS</span>
            </motion.div>
            
            {!isOnline && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-500/20"
              >
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                Offline Sentinel
              </motion.div>
            )}
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {[
              { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard },
              { id: 'chat', label: 'AI Voice', icon: BrainCircuit },
              ...(isAdmin ? [{ id: 'admin', label: 'Nodes', icon: ShieldCheck }] : []),
              { id: 'settings', label: 'Config', icon: Settings },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:text-white",
                  (activeTab === item.id || (item.id === 'dashboard' && activeTab === 'home')) ? "text-red-500" : "text-slate-500"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4 pl-8 border-l border-white/5">
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} className="w-9 h-9 rounded-xl border border-white/10" alt={user.displayName || ''} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator</span>
                <span className="text-xs font-bold leading-tight">{user.displayName?.split(' ')[0]}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 glass rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all border-white/5"
              title="Logout System"
            >
              <LogOut size={16} />
            </button>
          </div>

          <button className="lg:hidden p-2 glass rounded-xl border-white/5" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Improved Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-slate-950 px-8 pt-32 lg:hidden flex flex-col"
            >
              <div className="flex flex-col gap-8">
                {[
                  { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard },
                  { id: 'chat', label: 'AI Voice Protocol', icon: BrainCircuit },
                  ...(isAdmin ? [{ id: 'admin', label: 'Network Nodes', icon: ShieldCheck }] : []),
                  { id: 'settings', label: 'System Config', icon: Settings },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setIsMenuOpen(false); }}
                    className={cn(
                      "flex items-center gap-4 text-2xl font-black font-display tracking-tight text-left",
                      (activeTab === item.id || (item.id === 'dashboard' && activeTab === 'home')) ? "text-red-500" : "text-white"
                    )}
                  >
                    <item.icon size={32} />
                    {item.label}
                  </button>
                ))}
                
                <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={user.photoURL || ''} className="w-14 h-14 rounded-2xl border border-red-500/20 shadow-xl shadow-red-500/10" alt={user.displayName || ''} />
                    <div>
                      <p className="font-black text-xl">{user.displayName}</p>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full py-5 bg-red-600/10 border border-red-500/20 text-red-500 font-black rounded-[24px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-4"
                >
                  <LogOut size={20} /> Terminate Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 pt-24 pb-12 px-4 md:px-8 container mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'admin' && isAdmin ? (
                <AdminPanel />
              ) : activeTab === 'dashboard' || activeTab === 'home' ? (
                <Dashboard emergencyActive={emergencyActive} setEmergencyActive={setEmergencyActive} />
              ) : activeTab === 'settings' ? (
                <ProfileSettings />
              ) : (
                <AIChat />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <FloatingAIChat emergencyActive={emergencyActive} />
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    );
}
