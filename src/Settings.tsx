import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Moon, 
  Languages, 
  Volume2, 
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import ContactsManager from './components/ContactsManager';
import { cn } from '@/src/lib/utils';

export default function ProfileSettings() {
  const { user, logout } = useAuth();

  const settingsOptions = [
    { label: 'Voice Assistant', icon: Volume2, status: 'Enabled' },
    { label: 'Auto SOS Detection', icon: Shield, status: 'Active' },
    { label: 'Notifications', icon: Bell, status: 'Emergency Only' },
    { label: 'Cloud Sync', icon: Database, status: 'Synced' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 mt-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[40px] border border-white/10 text-center">
             <div className="relative inline-block mb-6">
                <img 
                  src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                  className="w-32 h-32 rounded-[40px] border-4 border-white/10 shadow-2xl mx-auto object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-2xl p-2 shadow-lg ring-4 ring-slate-950">
                   <Shield className="text-white" size={20} />
                </div>
             </div>
             <h3 className="text-2xl font-bold tracking-tight">{user?.displayName}</h3>
             <p className="text-slate-500 font-medium text-sm mt-1">{user?.email}</p>
             
             <div className="mt-8 flex justify-center gap-4">
                <div className="text-center px-6">
                   <p className="text-xl font-bold">12</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Alerts</p>
                </div>
                <div className="w-px h-8 bg-white/10 mt-2" />
                <div className="text-center px-6">
                   <p className="text-xl font-bold">Safe</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Status</p>
                </div>
             </div>

             <button 
               onClick={() => logout()}
               className="w-full mt-10 py-4 glass text-red-500 hover:bg-red-500/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
             >
                <LogOut size={18} /> SIGN OUT
             </button>
          </div>

          <div className="glass p-8 rounded-[40px] border border-white/10">
             <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Preferences</h4>
             <div className="space-y-4">
                {settingsOptions.map((opt, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-red-600/20 transition-all">
                            <opt.icon size={18} />
                         </div>
                         <span className="text-sm font-bold text-slate-300">{opt.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{opt.status}</span>
                         <ChevronRight size={14} className="text-slate-700" />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Contacts & More */}
        <div className="lg:col-span-8">
           <ContactsManager />
           
           <div className="mt-8 glass p-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-red-600/5 to-transparent">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                    <Shield size={24} className="text-white" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold">Emergency Protocol V.2.1</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enhanced Satellite Guard Active</p>
                 </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                 Your security settings are configured for maximum protection. In the event of a critical impact, RoadSoS will automatically notify your primary contacts and dispatch nearby emergency responders using satellite triangulation.
              </p>
              <div className="mt-8 flex gap-4">
                 <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-hover transition-all text-sm shadow-lg shadow-red-600/20">
                    RUN SYSTEM TEST
                 </button>
                 <button className="px-8 py-4 glass text-slate-300 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm">
                    DOWNLOAD DATA
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
