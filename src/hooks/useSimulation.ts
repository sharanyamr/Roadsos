import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export type SimulationStage = 
  | 'idle' 
  | 'driving' 
  | 'impact_detected' 
  | 'analyzing' 
  | 'sos_triggered' 
  | 'notifying_contacts' 
  | 'hospital_assigned' 
  | 'ambulance_dispatched' 
  | 'en_route' 
  | 'resolved';

export interface SimulationState {
  stage: SimulationStage;
  progress: number;
  message: string;
  eta: number | null;
  drivingData: {
    acc: number;
    rot: number;
  };
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>({
    stage: 'idle',
    progress: 0,
    message: 'System Standby',
    eta: null,
    drivingData: { acc: 0.1, rot: 0.5 }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
  };

  const updateState = (newState: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const runScenario = useCallback(async (onImpact: () => void) => {
    clearTimer();
    
    // Stage 1: Driving
    updateState({ stage: 'driving', message: 'Vehicle in motion. Monitoring sensors...', progress: 10 });
    
    dataIntervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        drivingData: {
          acc: 0.2 + Math.random() * 0.8,
          rot: 1 + Math.random() * 5
        }
      }));
    }, 500);

    timerRef.current = setTimeout(() => {
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
      // Stage 2: Impact
      updateState({ stage: 'impact_detected', message: 'CRITICAL IMPACT DETECTED!', progress: 30 });
      onImpact();
      toast.error("SIMULATION: High G-Force event detected!");

      timerRef.current = setTimeout(() => {
        // Stage 3: SOS Triggered
        updateState({ stage: 'sos_triggered', message: 'SOS protocol initialized.', progress: 45 });

        timerRef.current = setTimeout(() => {
          // Stage 4: Notifying
          updateState({ stage: 'notifying_contacts', message: 'Alerting emergency contacts...', progress: 60 });

          timerRef.current = setTimeout(() => {
            // Stage 5: Hospital
            updateState({ stage: 'hospital_assigned', message: 'Trauma center identified. Coordinating...', progress: 75, eta: 8 });

            timerRef.current = setTimeout(() => {
              // Stage 6: Dispatched
              updateState({ stage: 'ambulance_dispatched', message: 'Ambulance en-route. ETA 5m', progress: 85, eta: 5 });

              timerRef.current = setTimeout(() => {
                // Stage 7: Resolved
                updateState({ stage: 'resolved', message: 'Rescue successful. Incident closed.', progress: 100, eta: 0 });
                toast.success("SIMULATION COMPLETE: Victim rescued.");
              }, 10000);
            }, 5000);
          }, 4000);
        }, 5000);
      }, 3000);
    }, 4000);
  }, []);

  const resetSimulation = () => {
    clearTimer();
    setState({
      stage: 'idle',
      progress: 0,
      message: 'System Standby',
      eta: null,
      drivingData: { acc: 0.1, rot: 0.5 }
    });
  };

  return {
    state,
    runScenario,
    resetSimulation
  };
}
