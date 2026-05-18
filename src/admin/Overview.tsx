import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  Clock, 
  TrendingUp,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

const data = [
  { name: '00:00', incidents: 4, response: 12 },
  { name: '04:00', incidents: 2, response: 9 },
  { name: '08:00', incidents: 10, response: 15 },
  { name: '12:00', incidents: 18, response: 8 },
  { name: '16:00', incidents: 25, response: 7 },
  { name: '20:00', incidents: 15, response: 11 },
  { name: '23:59', incidents: 8, response: 10 },
];

const severityData = [
  { name: 'Minor', value: 45, color: '#22c55e' },
  { name: 'Moderate', value: 25, color: '#eab308' },
  { name: 'Severe', value: 20, color: '#f97316' },
  { name: 'Critical', value: 10, color: '#ef4444' },
];

export default function AdminOverview() {
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [activeSOS, setActiveSOS] = useState(0);

  useEffect(() => {
    const qTotal = query(collection(db, 'emergencies'));
    const unsubTotal = onSnapshot(qTotal, (snapshot) => {
      setTotalIncidents(snapshot.size);
    });

    const qActive = query(collection(db, 'emergencies'), where('status', '!=', 'Resolved'));
    const unsubActive = onSnapshot(qActive, (snapshot) => {
      setActiveSOS(snapshot.size);
    });

    return () => {
      unsubTotal();
      unsubActive();
    };
  }, []);

  const stats = [
    { label: 'Total Alerts', value: totalIncidents.toLocaleString(), change: '+12%', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active SOS', value: activeSOS.toString(), change: 'Live', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-600/10' },
    { label: 'Nodes Status', value: '99.9%', change: 'SECURE', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Avg Triage', value: '4.2m', change: '-1.5m', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-[32px] border border-white/5 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className={cn(
                "text-[10px] font-black px-2 py-1 rounded-full",
                stat.change === 'Live' ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-slate-400"
              )}>
                {stat.change}
              </span>
            </div>
            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] mb-1">{stat.label}</h4>
            <p className="text-3xl font-black font-display tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Incident Trends */}
        <div className="lg:col-span-8 glass p-8 rounded-[40px] border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Incedent Volume</h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">24-Hour Real-time Trend Analysis</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black transition-all">WEEK</button>
              <button className="bg-red-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black">DAY</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#ef4444" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorInc)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="lg:col-span-4 glass p-8 rounded-[40px] border border-white/10">
          <h3 className="text-xl font-bold mb-8">Severity Scale</h3>
          <div className="h-[200px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {severityData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-400">{item.name}</span>
                </div>
                <span className="text-xs font-black">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
