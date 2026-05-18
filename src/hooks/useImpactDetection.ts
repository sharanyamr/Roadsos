import { useState, useEffect, useRef } from 'react';

export type ImpactSeverity = 'None' | 'Minor' | 'Moderate' | 'Severe' | 'Critical';

interface SensorData {
  acceleration: number;
  rotation: number;
  score: number;
  severity: ImpactSeverity;
}

export function useImpactDetection() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [data, setData] = useState<SensorData>({
    acceleration: 0,
    rotation: 0,
    score: 0,
    severity: 'None'
  });
  const [lastImpact, setLastImpact] = useState<SensorData | null>(null);
  
  const monitorRef = useRef<NodeJS.Timeout | null>(null);

  const startMonitoring = () => setIsMonitoring(true);
  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitorRef.current) clearInterval(monitorRef.current);
  };

  const simulateImpact = (forcedSeverity?: ImpactSeverity) => {
    let acc = 0;
    let rot = 0;
    let score = 0;
    let sev: ImpactSeverity = 'None';

    const s = forcedSeverity || (Math.random() > 0.7 ? 'Severe' : 'Minor');

    switch (s) {
      case 'Minor':
        acc = 5 + Math.random() * 5;
        rot = 10 + Math.random() * 20;
        score = 20 + Math.random() * 15;
        sev = 'Minor';
        break;
      case 'Moderate':
        acc = 15 + Math.random() * 10;
        rot = 40 + Math.random() * 40;
        score = 45 + Math.random() * 20;
        sev = 'Moderate';
        break;
      case 'Severe':
        acc = 35 + Math.random() * 20;
        rot = 100 + Math.random() * 100;
        score = 75 + Math.random() * 15;
        sev = 'Severe';
        break;
      case 'Critical':
        acc = 60 + Math.random() * 40;
        rot = 250 + Math.random() * 200;
        score = 92 + Math.random() * 8;
        sev = 'Critical';
        break;
    }

    const impactData = { acceleration: acc, rotation: rot, score, severity: sev };
    setData(impactData);
    setLastImpact(impactData);
  };

  useEffect(() => {
    if (isMonitoring) {
      monitorRef.current = setInterval(() => {
        // Normal vibrations
        setData(prev => ({
          acceleration: 0.1 + Math.random() * 0.5,
          rotation: 0.5 + Math.random() * 2,
          score: Math.random() * 5,
          severity: 'None'
        }));
      }, 500);
    } else {
      if (monitorRef.current) clearInterval(monitorRef.current);
    }
    return () => {
      if (monitorRef.current) clearInterval(monitorRef.current);
    };
  }, [isMonitoring]);

  const resetData = () => {
    setData({
      acceleration: 0,
      rotation: 0,
      score: 0,
      severity: 'None'
    });
    setLastImpact(null);
  };

  return {
    isMonitoring,
    data,
    lastImpact,
    startMonitoring,
    stopMonitoring,
    simulateImpact,
    setLastImpact,
    resetData
  };
}
