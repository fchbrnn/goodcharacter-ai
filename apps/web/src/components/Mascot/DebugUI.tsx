import React from 'react';
import { useControls, folder } from 'leva';
import { useMascotStore } from './MascotBrain';

export function DebugUI() {
  const { gravity, sensitivity, movementSpeed } = useControls({
    Physics: folder({
      gravity: { value: -9.81, min: -20, max: 0, step: 0.1 },
      restitution: { value: 0.5, min: 0, max: 1, step: 0.05 },
    }),
    Emotion: folder({
      sensitivity: { value: 1.0, min: 0.1, max: 3.0, step: 0.1, label: 'Petting Sensitivity' },
      forceEmotion: { 
        options: ['idle', 'happy', 'annoyed', 'sleep', 'surprised', 'petting', 'dizzy', 'curious', 'reading'],
        label: 'Force State'
      }
    }),
    Locomotion: folder({
      movementSpeed: { value: 2.0, min: 0.5, max: 5.0, step: 0.1 },
      patrolRadius: { value: 3.0, min: 1, max: 10, step: 0.5 },
    }),
  });
  
  // Apply forced emotion
  React.useEffect(() => {
    // This would be wired to a button or auto-apply
  }, []);
  
  return null; // Leva renders its own UI panel
}