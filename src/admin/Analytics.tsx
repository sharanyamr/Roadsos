import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Download, Filter, Calendar, Activity, Zap, ShieldCheck, TrendingUp, Users, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const incidentsByDay = [
  { day: 'Mon', count: 42, air: 5 },
  { day: 'Tue', count: 38, air: 4 },
  { day: 'Wed', count: 52, air: 8 },
  { day: 'Thu', count: 61, air: 12 },
  { day: 'Fri', count: 84, air: 18 },
  { day: 'Sat', count: 96, air: 22 },
  { day: 'Sun', count: 72, air: 15 },
];

const dispatchStatus = [
  { name: 'On Time', value: 78, color: '#22c55e' },
  { name: 'Delayed', value: 15, color: '#f59e0b' },
  { name: 'Critical Delay', value: 7, color: '#ef4444' },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div className="flex gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-bold text-slate-400">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </div>
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-bold text-slate-400">
            <Filter className="w-4 h-4" />
            All Regions
          </div>
        </div>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-600/30 transition-all">
          <Download className="w-4 h-4" /> EXPORT DATA
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-10 rounded-[40px] border border-white/10">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4">
               <Activity className="text-red-500" /> RESCUE CAPACITY
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-500 rounded-full" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ground</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Air-Med</span>
               </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsByDay} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#ffffff20" 
                  fontSize={11} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#ffffff20" 
                  fontSize={11} 
                  fontWeight="bold" 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} name="Ground Dispatch" />
                <Bar dataKey="air" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} name="Air-Med Dispatch" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-10 rounded-[40px] border border-white/10 flex flex-col justify-center">
          <h3 className="text-2xl font-black font-display tracking-tight mb-12 flex items-center gap-4">
            <Zap className="text-yellow-500" /> SLA ADHERENCE
          </h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dispatchStatus}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {dispatchStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black font-display">92%</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
             {dispatchStatus.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="text-xs font-bold text-slate-400">{item.name}</p>
                   </div>
                   <span className="text-sm font-black">{item.value}%</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <TrendingUp size={120} />
            </div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1 flex items-center justify-between">
               Survivor Recovery
               <ShieldCheck size={16} className="text-green-500" />
            </h4>
            <div className="h-[120px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={incidentsByDay}>
                   <defs>
                     <linearGradient id="colorRescue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Area type="monotone" dataKey="count" stroke="#22c55e" fillOpacity={1} fill="url(#colorRescue)" strokeWidth={3} />
                   <Tooltip />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-6">
               <p className="text-3xl font-black font-display tracking-tight text-white">99.2%</p>
               <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Rescue Success Rate</p>
            </div>
         </div>

         <div className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <Users size={120} />
            </div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1 flex items-center justify-between">
               Active Responders
               <Activity size={16} className="text-blue-500" />
            </h4>
            <div className="h-[120px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={incidentsByDay}>
                   <defs>
                     <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Area type="monotone" dataKey="air" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                   <Tooltip />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-6">
               <p className="text-3xl font-black font-display tracking-tight text-white">1,420</p>
               <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Total Active Fleet</p>
            </div>
         </div>

         <div className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
               <Zap size={120} />
            </div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1 flex items-center justify-between">
               Average Response
               <Clock size={16} className="text-yellow-500" />
            </h4>
            <div className="mt-8">
               <p className="text-5xl font-black font-display tracking-tight text-white italic">4.2<span className="text-xl not-italic text-slate-500 ml-2 uppercase">min</span></p>
               <div className="flex items-center gap-2 mt-4">
                  <TrendingUp size={14} className="text-green-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">12% Faster than last month</span>
               </div>
            </div>
            <div className="mt-12 pt-6 border-t border-white/5">
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Incident Peak</p>
                      <p className="text-sm font-bold">18:00 - 20:00</p>
                   </div>
                   <button className="text-[9px] font-black uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-all">VIEW TRENDS</button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
