'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { useMascotStore } from './MascotBrain';
import { RobotMesh } from './RobotMesh';
import { FaceDisplay } from './FaceDisplay';

function Scene() {
  const robotRef = useRef<THREE.Group>(null);
  const faceDisplay = useRef(new FaceDisplay());

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 4.5]} fov={45} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      <pointLight position={[-2, 2, 3]} intensity={0.4} color="#00ff66" />
      <pointLight position={[2, 1, 2]} intensity={0.3} color="#00b4ff" />
      <Environment preset="city" />

      <group ref={robotRef} position={[0, 0, 0]}>
        <RobotMesh ref={robotRef} faceDisplay={faceDisplay.current} />
      </group>
    </>
  );
}

export default function MascotRobot() {
  const { battery, emotion } = useMascotStore();

  React.useEffect(() => {
    const interval = setInterval(() => {
      useMascotStore.getState().updateBattery(-0.02);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '450px', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 4.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          color: '#00ff66',
          fontFamily: 'monospace',
          fontSize: 10,
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: 4,
          pointerEvents: 'none',
        }}
      >
        🔋 {Math.floor(battery)}% | {emotion}
      </div>
    </div>
  );
}