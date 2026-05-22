import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMascotStore } from './MascotBrain';

// Komponen mata yang bergerak mengikuti kursor
const Eye = ({ position, size }: { position: [number, number, number]; size: number }) => {
  const eyeRef = useRef<THREE.Mesh>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const { camera, pointer } = useThree();

  useFrame(() => {
    if (!eyeRef.current || !pupilRef.current) return;
    // Proyeksi mouse ke dunia 3D pada bidang Z yang sama dengan mata
    const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = (eyeRef.current.position.z - camera.position.z) / dir.z;
    const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));
    // Batasi pergerakan pupil
    const maxMove = 0.1;
    const dx = Math.min(Math.max(targetPos.x - eyeRef.current.position.x, -maxMove), maxMove);
    const dy = Math.min(Math.max(targetPos.y - eyeRef.current.position.y, -maxMove), maxMove);
    pupilRef.current.position.set(dx, dy, 0.05);
  });

  return (
    <group position={position}>
      {/* Bola mata putih */}
      <mesh ref={eyeRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.3} />
      </mesh>
      {/* Pupil hitam */}
      <mesh ref={pupilRef} position={[0, 0, 0.05]}>
        <sphereGeometry args={[size * 0.6, 32, 32]} />
        <meshStandardMaterial color="#000000" metalness={0.1} roughness={0.1} />
      </mesh>
      {/* Highlight */}
      <mesh position={[size * 0.3, size * 0.3, 0.1]}>
        <sphereGeometry args={[size * 0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

export const RobotMesh = React.forwardRef<THREE.Group>((props, ref) => {
  const { emotion, isPetting, battery, isSleeping, setEmotion, setIsPetting, recordInteraction } = useMascotStore();
  const [showMessage, setShowMessage] = useState(false);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const antennaRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const noiseOffset = useRef(Math.random() * 100);

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.9, roughness: 0.25 }), []);
  const headMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d0d0d0', metalness: 0.85, roughness: 0.2 }), []);

  // Handle klik robot
  const handleClick = useCallback(() => {
    setEmotion('happy');
    setIsPetting(true);
    recordInteraction();
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setEmotion('idle');
      setIsPetting(false);
    }, 3000);
  }, [setEmotion, setIsPetting, recordInteraction]);

  // Animasi
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Body breathing & sway
    if (bodyRef.current && emotion === 'idle') {
      const breath = Math.sin(time * 2 + noiseOffset.current) * 0.015 + Math.sin(time * 3.7 + noiseOffset.current) * 0.008;
      const sway = Math.sin(time * 0.8 + noiseOffset.current) * 0.03;
      bodyRef.current.scale.set(1 + sway * 0.1, 1 + breath, 1 + sway * 0.1);
      bodyRef.current.position.x = Math.cos(time * 0.5) * 0.02;
      bodyRef.current.rotation.z = sway * 0.5;
    }

    // Petting: lengan bergerak
    if (isPetting && leftArmRef.current && rightArmRef.current) {
      const angle = Math.sin(time * 15) * 0.5;
      leftArmRef.current.rotation.z = angle;
      rightArmRef.current.rotation.z = -angle;
    } else if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.z = 0;
      rightArmRef.current.rotation.z = 0;
    }

    // Antena wiggle
    if (antennaRef.current) {
      const wiggle = emotion === 'happy' ? Math.sin(time * 12) * 0.2 : Math.sin(time * 3) * 0.05;
      antennaRef.current.rotation.z = wiggle;
    }

    // Mulut berubah warna sesuai emosi
    if (mouthRef.current) {
      const material = mouthRef.current.material as THREE.MeshStandardMaterial;
      if (emotion === 'happy') {
        material.color.setHex(0x00ff66);
        material.emissive.setHex(0x00ff66);
        material.emissiveIntensity = 0.5;
      } else {
        material.color.setHex(0xff3333);
        material.emissive.setHex(0xff3333);
        material.emissiveIntensity = 0.3;
      }
    }
  });

  return (
    <group ref={ref} onClick={handleClick}>
      {/* Badan */}
      <group ref={bodyRef}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.5, 1.1, 32]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.1, 0.5]}>
          <boxGeometry args={[0.3, 0.2, 0.05]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* Kepala */}
      <group ref={headRef} position={[0, 0.85, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <primitive object={headMaterial} attach="material" />
        </mesh>

        {/* Dua mata */}
        <Eye position={[-0.18, 0.15, 0.45]} size={0.12} />
        <Eye position={[0.18, 0.15, 0.45]} size={0.12} />

        {/* Mulut (LED) */}
        <mesh ref={mouthRef} position={[0, -0.05, 0.45]}>
          <boxGeometry args={[0.25, 0.05, 0.05]} />
          <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={0.3} />
        </mesh>

        {/* Antena */}
        <group position={[0, 0.5, 0.2]}>
          <mesh ref={antennaRef} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={battery < 20 ? '#ff0000' : '#00ff00'} emissive={battery < 20 ? '#ff0000' : '#00ff00'} emissiveIntensity={0.8} />
          </mesh>
        </group>
      </group>

      {/* Lengan kiri */}
      <group ref={leftArmRef} position={[-0.65, 0.1, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Lengan kanan */}
      <group ref={rightArmRef} position={[0.65, 0.1, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
          <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Kaki (statis) */}
      <group position={[-0.25, -0.7, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
          <meshStandardMaterial color="#999" metalness={0.85} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.3, 0.1]}>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
      <group position={[0.25, -0.7, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
          <meshStandardMaterial color="#999" metalness={0.85} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.3, 0.1]}>
          <boxGeometry args={[0.2, 0.1, 0.3]} />
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Bubble teks */}
      {showMessage && (
        <group position={[0, 1.5, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.5, 0.6]} />
            <meshStandardMaterial color="white" side={THREE.DoubleSide} transparent opacity={0.95} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <coneGeometry args={[0.2, 0.4, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <Html position={[0, 0, 0.05]} center>
            <div style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', padding: '8px 12px', background: 'white', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              Halo, saya adalah maskot dari GoodCharacter.ai
            </div>
          </Html>
        </group>
      )}
    </group>
  );
});

RobotMesh.displayName = 'RobotMesh';