import React from 'react';
import { EffectComposer, Bloom, SMAA, ChromaticAberration } from '@react-three/postprocessing';
import { useControls } from 'leva';
import * as THREE from 'three';

export function PostFX() {
  const { bloomIntensity, bloomThreshold, chromaticAberration } = useControls('PostFX', {
    bloomIntensity: { value: 0.8, min: 0, max: 3, step: 0.1 },
    bloomThreshold: { value: 0.5, min: 0, max: 1, step: 0.05 },
    chromaticAberration: { value: 0.003, min: 0, max: 0.02, step: 0.001 },
  });
  
  return (
    <EffectComposer>
      <Bloom 
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <SMAA />
      <ChromaticAberration 
        offset={new THREE.Vector2(chromaticAberration, chromaticAberration)} 
      />
    </EffectComposer>
  );
}