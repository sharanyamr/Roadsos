import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { MapIcon, Layers, ShieldAlert } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import 'leaflet/dist/leaflet.css';

// Bengaluru hotspot data
const hotspots = [
  { lat: 12.9716, lng: 77.5946, intensity: 0.8, label: 'MG Road Junction' },
  { lat: 12.9352, lng: 77.6245, intensity: 0.6, label: 'Koramangala Signal' },
  { lat: 12.9279, lng: 77.6271, intensity: 0.9, label: 'Silk Board Junction' },
  { lat: 12.9763, lng: 77.6033, intensity: 0.4, label: 'Majestic Circle' },
  { lat: 12.9698, lng: 77.7500, intensity: 0.7, label: 'Whitefield Main Road' },
];

export default function HeatmapView() {
  const [activeFilter, setActiveFilter] = useState<'density' | 'severity'>('density');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[32px] border border-white/5">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-3">
            <MapIcon className="text-red-500" />
            Accident Hotspot Heatmap
          </h3>

          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Real-time incident density visualization
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('density')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              activeFilter === 'density'
                ? "bg-red-600 text-white"
                : "glass text-slate-400 hover:text-white"
            )}
          >
            DENSITY MAP
          </button>

          <button
            onClick={() => setActiveFilter('severity')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all",
              activeFilter === 'severity'
                ? "bg-red-600 text-white"
                : "glass text-slate-400 hover:text-white"
            )}
          >
            SEVERITY OVERLAY
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">

        {/* Map */}
        <div className="lg:col-span-8 glass rounded-[40px] overflow-hidden border border-white/10 relative">

          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            style={{
              width: '100%',
              height: '100%',
              filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)'
            }}
            zoomControl={false}
          >

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {hotspots.map((spot, i) => (
              <React.Fragment key={i}>

                {/* Outer heat circle */}
                <Circle
                  center={[spot.lat, spot.lng]}
                  radius={500 * spot.intensity}
                  pathOptions={{
                    fillColor:
                      activeFilter === 'density'
                        ? '#ef4444'
                        : '#f97316',
                    color: 'transparent',
                    fillOpacity: 0.3 * spot.intensity,
                  }}
                />

                {/* Inner heat circle */}
                <Circle
                  center={[spot.lat, spot.lng]}
                  radius={200 * spot.intensity}
                  pathOptions={{
                    fillColor:
                      activeFilter === 'density'
                        ? '#ef4444'
                        : '#f97316',
                    color: 'transparent',
                    fillOpacity: 0.6 * spot.intensity,
                  }}
                />

              </React.Fragment>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 z-[1000] glass p-4 rounded-2xl border border-white/10 backdrop-blur-xl">

            <div className="flex items-center gap-3 mb-2">
              <Layers className="text-red-500" size={14} />

              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Map Legend
              </span>
            </div>

            <div className="space-y-2">

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600/60" />

                <span className="text-[10px] font-bold text-slate-300">
                  High Risk Zone
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600/20" />

                <span className="text-[10px] font-bold text-slate-300">
                  Moderate Warning
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">

          {/* Hazard Zones */}
          <div className="glass p-8 rounded-[32px] border border-white/5">

            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-1">
              Top Hazard Zones
            </h4>

            <div className="space-y-6">

              {hotspots
                .sort((a, b) => b.intensity - a.intensity)
                .map((spot, i) => (

                  <div key={i} className="flex flex-col gap-2">

                    <div className="flex justify-between items-center">

                      <span className="text-sm font-bold text-slate-200">
                        {spot.label}
                      </span>

                      <span className="text-[10px] font-black text-red-500">
                        {(spot.intensity * 100).toFixed(0)}% RISK
                      </span>

                    </div>

                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">

                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${spot.intensity * 100}%` }}
                        className="h-full bg-red-600"
                      />

                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recommendation Panel */}
          <div className="glass p-8 rounded-[32px] border border-white/5 bg-red-600/5">

            <div className="flex items-center gap-3 mb-4">

              <ShieldAlert className="text-red-500" size={20} />

              <h4 className="text-sm font-black uppercase tracking-tight">
                System Recommendation
              </h4>

            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              High frequency of accidents detected at
              <span className="text-white font-bold">
                {' '}Silk Board Junction
              </span>
              {' '}during peak hours (08:00 - 10:00). Deployment of additional responders recommended for the next 4 hours.
            </p>

            <button className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
              DISPATCH PREVENTIVE UNIT
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
