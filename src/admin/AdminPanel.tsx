import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  Map as MapIcon, 
  HeartPulse, 
  Settings, 
  Users,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import AdminOverview from './Overview';
import LiveIncidents from './LiveIncidents';
import AdminAnalytics from './Analytics';
import HospitalManagement from './HospitalManagement';
import HeatmapView from './Heatmaps';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export type AdminTab = 'overview' | 'incidents' | 'analytics' | 'heatmaps' | 'hospitals' | 'settings';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [incidentCount, setIncidentCount] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'emergencies'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIncidentCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Live Incidents', icon: Activity, badge: incidentCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'heatmaps', label: 'Heatmaps', icon: MapIcon },
    { id: 'hospitals', label: 'Hospitals', icon: HeartPulse },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[80vh]">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as AdminTab)}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all group",
              activeTab === item.id 
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                : "glass border-transparent hover:bg-white/5 text-slate-400 hover:text-slate-100"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === item.id ? "bg-white text-red-600" : "bg-red-600 text-white"
              )}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black font-display tracking-tight uppercase">Emergency Command Center</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Global Response Level: <span className="text-green-500">Normal</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search incidents..." className="bg-transparent border-none outline-none text-sm w-48" />
            </div>
            <button className="glass p-2 relative rounded-xl hover:bg-white/5 transition-all text-slate-400 hover:text-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </button>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'incidents' && <LiveIncidents />}
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'heatmaps' && <HeatmapView />}
          {activeTab === 'hospitals' && <HospitalManagement />}
          {activeTab === 'settings' && (
            <div className="glass p-12 rounded-[40px] text-center border-dashed border-white/10">
              <Settings className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-500">Control Settings Coming Soon</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
