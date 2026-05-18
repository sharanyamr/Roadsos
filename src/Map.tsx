import React, { useEffect, useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  Circle,
  Polyline,
  ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import { HeartPulse, MapPin, Navigation, Shield, Phone, Clock, Star, Info, Zap, WifiOff } from 'lucide-react';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { cn } from '@/src/lib/utils';

// Fix for default marker icons in Leaflet
import 'leaflet/dist/leaflet.css';

// Custom Icons
const createUserIcon = (isActive: boolean) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative">
    ${isActive ? '<div class="absolute -inset-4 bg-red-500/30 rounded-full animate-ping"></div>' : ''}
    <div class="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
      <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const createEmergencyIcon = (type: 'hospital' | 'police' | 'trauma', isBest: boolean) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative group">
    ${isBest ? '<div class="absolute -inset-2 bg-blue-500/20 rounded-full animate-pulse"></div>' : ''}
    <div class="w-8 h-8 ${type === 'hospital' ? 'bg-blue-600' : type === 'police' ? 'bg-purple-600' : 'bg-red-600'} rounded-xl border-2 border-white/20 shadow-xl flex items-center justify-center transition-transform hover:scale-110">
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        ${type === 'hospital' ? '<path d="M12 5v14M5 12h14" />' : type === 'police' ? '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />' : '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />'}
      </svg>
    </div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

interface Hospital {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: 'hospital' | 'police';
  distance: number;
  eta: number;
  score: number;
}

export default function MapComponent({ 
  emergencyActive = false, 
  userLocation 
}: { 
  emergencyActive?: boolean, 
  userLocation: [number, number] | null 
}) {
  const isOnline = useOnlineStatus();
  const [center, setCenter] = useState<[number, number]>(userLocation || [37.42, -122.08]);
  const [services, setServices] = useState<Hospital[]>([]);
  const [bestOption, setBestOption] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
      fetchEmergencyServices(userLocation[0], userLocation[1]);
      setLoading(false);
    }
  }, [userLocation]);

  const fetchEmergencyServices = async (lat: number, lon: number) => {
    try {
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:8000,${lat},${lon});
          node["amenity"="police"](around:8000,${lat},${lon});
        );
        out body;
      `;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const processed: Hospital[] = data.elements.map((el: any) => {
        const dist = Math.sqrt(Math.pow(el.lat - lat, 2) + Math.pow(el.lon - lon, 2)) * 111; // Approx km
        return {
          id: el.id,
          lat: el.lat,
          lon: el.lon,
          name: el.tags.name || (el.tags.amenity === 'hospital' ? 'Medical Center' : 'Police Station'),
          type: el.tags.amenity,
          distance: parseFloat(dist.toFixed(1)),
          eta: Math.round(dist * 2.5 + 2), // Rough simulation: 2.5 min/km + 2 min base
          score: el.tags.amenity === 'hospital' ? 100 - dist * 5 : 80 - dist * 5 // Prioritize hospitals
        };
      });

      const sorted = processed.sort((a, b) => b.score - a.score);
      setServices(sorted);
      setBestOption(sorted.find(s => s.type === 'hospital') || sorted[0] || null);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative group">
      {!isOnline && (
        <div className="absolute inset-0 z-[1001] bg-slate-950/40 backdrop-blur-[2px] pointer-events-none flex items-center justify-center">
           <div className="glass p-6 rounded-3xl border-orange-500/20 text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                 <WifiOff className="text-orange-500" size={24} />
              </div>
              <div>
                 <h4 className="font-bold text-sm">Offline Satellite Mode</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Showing cached map data</p>
              </div>
           </div>
        </div>
      )}
      <MapContainer 
        center={center} 
        zoom={14} 
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', filter: isOnline ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'invert(100%) hue-rotate(180deg) brightness(80%) grayscale(50%)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapRecenter center={center} />

        <Marker position={center} icon={createUserIcon(emergencyActive)}>
          <Popup>
            <div className="text-slate-900 font-bold p-1">Your Rescue Co-ordinates</div>
          </Popup>
        </Marker>

        {emergencyActive && (
          <Circle 
            center={center} 
            radius={100} 
            pathOptions={{ fillColor: 'red', color: 'red', opacity: 0.5, weight: 1, fillOpacity: 0.2 }} 
          />
        )}

        {bestOption && emergencyActive && (
          <Polyline 
            positions={[center, [bestOption.lat, bestOption.lon]]} 
            pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 15', opacity: 0.6 }} 
          />
        )}

        {services.map((svc) => (
          <Marker 
            key={svc.id} 
            position={[svc.lat, svc.lon]} 
            icon={createEmergencyIcon(svc.type as any, svc.id === bestOption?.id)}
          >
            <Popup className="emergency-popup">
              <div className="text-slate-900 min-w-[200px] p-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${svc.type === 'hospital' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                    {svc.type === 'hospital' ? <HeartPulse size={14} /> : <Shield size={14} />}
                  </div>
                  <span className="font-black text-sm uppercase tracking-tight">{svc.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <div>Distance: <span className="text-slate-900 block">{svc.distance} km</span></div>
                  <div>ETA: <span className="text-slate-900 block">{svc.eta} min</span></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Emergency Status Panel */}
      <div className="absolute top-6 right-6 z-[1000] space-y-3 w-72 pointer-events-none md:pointer-events-auto">
        <div className="glass p-5 rounded-[28px] border border-white/20 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-right-8 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rescue Status</h4>
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <MapPin className="text-red-500" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Co-ordinates</p>
                <p className="text-xs font-mono font-bold">{center[0].toFixed(4)}, {center[1].toFixed(4)}</p>
              </div>
            </div>

            {bestOption && (
              <div className="p-4 bg-blue-600/10 rounded-[20px] border border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="text-blue-500" size={14} fill="currentColor" />
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Recommended Responder</span>
                </div>
                <p className="text-sm font-bold truncate mb-1">{bestOption.name}</p>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs font-bold">{bestOption.eta}m ETA</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                    <Navigation size={12} className="text-slate-400" />
                    <span className="text-xs font-bold">{bestOption.distance}km</span>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass p-4 rounded-[24px] flex items-center gap-4 border border-white/5 animate-in slide-in-from-right-12 duration-700">
           <div className={cn(
             "w-10 h-10 rounded-xl flex items-center justify-center",
             isOnline ? "bg-green-500/10" : "bg-orange-500/10"
           )}>
             {isOnline ? <Zap className="text-green-500" size={18} /> : <WifiOff className="text-orange-500" size={18} />}
           </div>
           <div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Signal Status</p>
             <p className="text-xs font-black">{isOnline ? 'STABLE (LRT-V2)' : 'OFFLINE (SMS FALLBACK)'}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
