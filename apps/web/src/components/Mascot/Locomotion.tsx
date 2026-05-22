import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useMascotStore } from './MascotBrain';

interface LocomotionProps {
  children: React.ReactNode;
  robotRef: React.RefObject<THREE.Group>;
}

export function Locomotion({ children, robotRef }: LocomotionProps) {
  const rbRef = useRef<any>(null);
  const { isDragging, emotion, setIsDragging, targetPosition, domElements } = useMascotStore();
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const dragOffset = useRef(new THREE.Vector3());
  const dragPoint = useRef(new THREE.Vector3());
  const limbRefs = useRef<{leftArm: THREE.Group|null, rightArm: THREE.Group|null, leftLeg: THREE.Group|null, rightLeg: THREE.Group|null}>({
    leftArm: null, rightArm: null, leftLeg: null, rightLeg: null
  });
  
  // Register limbs from RobotMesh
  useEffect(() => {
    if (robotRef.current) {
      limbRefs.current.leftArm = robotRef.current.getObjectByName('arm_left');
      limbRefs.current.rightArm = robotRef.current.getObjectByName('arm_right');
      limbRefs.current.leftLeg = robotRef.current.getObjectByName('leg_left');
      limbRefs.current.rightLeg = robotRef.current.getObjectByName('leg_right');
    }
  }, [robotRef]);
  
  // Patrol System
  useEffect(() => {
    if (emotion !== 'idle' && emotion !== 'patrol') return;
    
    const interval = setInterval(() => {
      const state = useMascotStore.getState();
      if (state.isDragging || state.isSleeping || state.isPetting) return;
      
      // 20% chance to start patrol if idle
      if (state.emotion === 'idle' && Math.random() < 0.2) {
        useMascotStore.getState().setLocomotion('patrol');
        useMascotStore.getState().setEmotion('patrol');
        
        // Pick random point within viewport bounds
        const margin = 2;
        const x = (Math.random() - 0.5) * (window.innerWidth / 100 - margin * 2);
        const y = Math.random() * 2 + 0.5;
        useMascotStore.getState().setTargetPosition([x, y, 0]);
        
        setTimeout(() => {
          useMascotStore.getState().setLocomotion('idle');
          useMascotStore.getState().setEmotion('idle');
          useMascotStore.getState().setTargetPosition(null);
        }, 3000 + Math.random() * 2000);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [emotion]);
  
  // DOM Anchor Awareness (stand on navbar/footer)
  useFrame(() => {
    if (!rbRef.current || isDragging) return;
    
    const state = useMascotStore.getState();
    const pos = rbRef.current.translation();
    
    // Check if near any DOM element top edge
    state.domElements.forEach(el => {
      if (el.type === 'navbar' || el.type === 'footer') {
        const worldY = (window.innerHeight - el.rect.top) / 100; // Approximate conversion
        if (Math.abs(pos.y - worldY) < 0.5 && Math.abs(pos.x) < el.rect.width / 200) {
          // Snap to stand on it
          rbRef.current.setTranslation({ x: pos.x, y: worldY + 1.2, z: 0 }, true);
          useMascotStore.getState().currentAnchor = el.id;
        }
      }
    });
  });
  
  // Physics & Animation Frame
  useFrame((state, delta) => {
    if (!rbRef.current || !robotRef.current) return;
    
    const rb = rbRef.current;
    const robot = robotRef.current;
    
    // Sleep slump physics
    if (emotion === 'sleep') {
      rb.setGravityScale(2.0); // Heavier when sleeping
      // Apply tiny random torque to make it slump naturally
      rb.applyTorqueImpulse({ x: Math.sin(state.clock.elapsedTime) * 0.001, y: 0, z: 0 }, true);
    } else {
      rb.setGravityScale(1.0);
    }
    
    // Patrol movement using Bezier-like smoothing
    if (targetPosition && emotion === 'patrol') {
      const current = rb.translation();
      const target = new THREE.Vector3(...targetPosition);
      const dir = target.clone().sub(current);
      const dist = dir.length();
      
      if (dist > 0.1) {
        dir.normalize();
        // Smooth acceleration curve (ease-out)
        const speed = Math.min(2.0, dist * 2);
        rb.setLinvel({ x: dir.x * speed, y: dir.y * speed, z: 0 }, true);
      } else {
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      }
    }
    
    // Dizzy step back
    if (emotion === 'dizzy') {
      const backForce = -1.5;
      rb.applyImpulse({ x: backForce, y: 0.5, z: 0 }, true);
    }
    
    // Ragdoll effect when dragged
    if (isDragging && limbRefs.current) {
      const time = state.clock.elapsedTime;
      const { leftArm, rightArm, leftLeg, rightLeg } = limbRefs.current;
      
      // Dangling limbs using sine waves with phase offset
      if (leftArm) leftArm.rotation.z = Math.sin(time * 8) * 0.4 + 0.5;
      if (rightArm) rightArm.rotation.z = Math.sin(time * 8 + Math.PI) * 0.4 - 0.5;
      if (leftLeg) leftLeg.rotation.x = Math.sin(time * 6) * 0.3;
      if (rightLeg) rightLeg.rotation.x = Math.sin(time * 6 + Math.PI) * 0.3;
    }
  });
  
  // Drag & Drop Handlers
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    useMascotStore.getState().setIsDragging(true);
    useMascotStore.getState().recordInteraction();
    
    if (rbRef.current) {
      rbRef.current.setBodyType(2, true); // Kinematic while dragging
      const pos = rbRef.current.translation();
      dragOffset.current.set(pos.x, pos.y, pos.z);
    }
  };
  
  const handlePointerMove = (e: any) => {
    if (!isDragging || !rbRef.current) return;
    
    // Project mouse to world plane at robot's Z
    const mouse = e.point;
    if (mouse) {
      rbRef.current.setTranslation({ 
        x: mouse.x, 
        y: mouse.y + 0.5, 
        z: 0 
      }, true);
    }
  };
  
  const handlePointerUp = () => {
    useMascotStore.getState().setIsDragging(false);
    if (rbRef.current) {
      rbRef.current.setBodyType(0, true); // Back to dynamic
      rbRef.current.setGravityScale(1);
      // Add slight random spin on drop for realism
      rbRef.current.applyTorqueImpulse({ 
        x: (Math.random() - 0.5) * 0.1, 
        y: (Math.random() - 0.5) * 0.1, 
        z: 0 
      }, true);
    }
  };
  
  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <RigidBody
        ref={rbRef}
        colliders="cuboid"
        restitution={0.5}
        friction={0.7}
        linearDamping={0.5}
        angularDamping={0.5}
        gravityScale={1}
        canSleep={false}
      >
        {children}
      </RigidBody>
    </group>
  );
}