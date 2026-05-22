import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useMascotStore } from './MascotBrain';

const PETTING_VELOCITY_MIN = 0.3;   // px/ms
const PETTING_VELOCITY_MAX = 3.0;   // px/ms
const PETTING_DURATION = 1500;        // ms
const REVERSAL_THRESHOLD = 2;       // min direction changes

export function useSensoryController(robotRef: React.RefObject<THREE.Group>) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const store = useMascotStore();
  
  // DOM Scanning
  useEffect(() => {
    const scanDOM = () => {
      const selectors = [
        { sel: 'nav, [data-mascot="navbar"]', type: 'navbar' as const },
        { sel: 'footer, [data-mascot="footer"]', type: 'footer' as const },
        { sel: 'button, [data-mascot="cta"], a[href]', type: 'cta' as const },
        { sel: 'article, [data-mascot="text"]', type: 'text' as const },
      ];
      
      selectors.forEach(({ sel, type }) => {
        document.querySelectorAll(sel).forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          const id = `${type}-${i}`;
          useMascotStore.getState().registerDOMElement({ id, rect, type });
        });
      });
    };
    
    scanDOM();
    const obs = new MutationObserver(scanDOM);
    obs.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', scanDOM);
    return () => {
      obs.disconnect();
      window.removeEventListener('resize', scanDOM);
    };
  }, []);
  
  // CTA Hover Detection
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, [data-mascot="cta"], a')) {
        const id = target.getAttribute('data-mascot-id') || target.tagName;
        useMascotStore.getState().setHoveredCTA(id);
        if (useMascotStore.getState().emotion === 'idle') {
          useMascotStore.getState().setEmotion('curious');
        }
      }
    };
    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, [data-mascot="cta"], a')) {
        useMascotStore.getState().setHoveredCTA(null);
        if (useMascotStore.getState().emotion === 'curious') {
          useMascotStore.getState().setEmotion('idle');
        }
      }
    };
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);
  
  // Text Selection / Reading Mode Detection
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = window.scrollY;
    let scrollAccumulator = 0;
    
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
      scrollAccumulator += delta;
      
      // Slow scroll = reading mode
      if (delta > 0 && delta < 50 && useMascotStore.getState().emotion === 'idle') {
        useMascotStore.getState().setEmotion('reading');
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollAccumulator = 0;
        if (useMascotStore.getState().emotion === 'reading') {
          useMascotStore.getState().setEmotion('idle');
        }
      }, 2000);
    };
    
    const handleSelection = () => {
      const sel = window.getSelection()?.toString();
      if (sel && sel.length > 10) {
        useMascotStore.getState().setEmotion('reading');
        useMascotStore.getState().recordInteraction();
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('selectionchange', handleSelection);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, []);
  
  // Petting Detection Core Algorithm
  useEffect(() => {
    const history: Array<{x:number; y:number; t:number; over:boolean}> = [];
    let pettingStart = 0;
    let isPetting = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const state = useMascotStore.getState();
      
      // Raycast to check if over robot head
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.current.setFromCamera(mouse, camera);
      
      let overHead = false;
      if (robotRef.current) {
        const headMesh = robotRef.current.getObjectByName('robot_head');
        if (headMesh) {
          const hits = raycaster.current.intersectObject(headMesh, true);
          overHead = hits.length > 0;
        }
      }
      
      // Push to history
      history.push({ x: e.clientX, y: e.clientY, t: now, over: overHead });
      if (history.length > 60) history.shift();
      
      // Calculate velocity
      if (history.length > 1) {
        const last = history[history.length - 1];
        const prev = history[history.length - 2];
        const dt = Math.max(1, last.t - prev.t);
        const dist = Math.hypot(last.x - prev.x, last.y - prev.y);
        const vel = dist / dt;
        useMascotStore.getState().setCursorVelocity(vel);
      }
      
      // Petting Detection
      if (overHead && !state.isDragging && state.patience > 0) {
        const recent = history.filter(h => now - h.t < PETTING_DURATION);
        
        // Condition 1: Temporal continuity
        const continuousOver = recent.every(h => h.over);
        if (!continuousOver) {
          if (isPetting) {
            isPetting = false;
            useMascotStore.getState().setIsPetting(false);
            useMascotStore.getState().setEmotion('idle');
          }
          return;
        }
        
        // Condition 2: Kinematic range
        const totalDist = recent.reduce((sum, h, i) => {
          if (i === 0) return 0;
          return sum + Math.hypot(h.x - recent[i-1].x, h.y - recent[i-1].y);
        }, 0);
        const duration = recent[recent.length - 1].t - recent[0].t;
        const avgVel = duration > 0 ? totalDist / duration : 0;
        const inVelocityRange = avgVel >= PETTING_VELOCITY_MIN && avgVel <= PETTING_VELOCITY_MAX;
        
        // Condition 3: Geometric reversals
        let reversals = 0;
        for (let i = 2; i < recent.length; i++) {
          const d1 = { x: recent[i-1].x - recent[i-2].x, y: recent[i-1].y - recent[i-2].y };
          const d2 = { x: recent[i].x - recent[i-1].x, y: recent[i].y - recent[i-1].y };
          const dot = d1.x * d2.x + d1.y * d2.y;
          const mag1 = Math.hypot(d1.x, d1.y);
          const mag2 = Math.hypot(d2.x, d2.y);
          if (mag1 > 5 && mag2 > 5) { // Ignore micro-movements
            const cosAngle = dot / (mag1 * mag2);
            if (cosAngle < 0) reversals++; // Angle > 90° = direction change
          }
        }
        
        if (inVelocityRange && reversals >= REVERSAL_THRESHOLD && duration >= PETTING_DURATION * 0.8) {
          if (!isPetting) {
            isPetting = true;
            pettingStart = now;
            useMascotStore.getState().setIsPetting(true);
            useMascotStore.getState().setEmotion('petting');
            useMascotStore.getState().updateAffection(5);
            useMascotStore.getState().recordInteraction();
          }
        }
      } else {
        if (isPetting) {
          isPetting = false;
          useMascotStore.getState().setIsPetting(false);
          useMascotStore.getState().setEmotion('idle');
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, robotRef]);
  
  // Poking System
  useEffect(() => {
    let clickCount = 0;
    let lastClickTime = 0;
    let pokeTimeout: NodeJS.Timeout;
    
    const handleClick = (e: MouseEvent) => {
      const state = useMascotStore.getState();
      if (state.isSleeping) {
        // Wake up
        useMascotStore.getState().setEmotion('surprised');
        useMascotStore.getState().updateEnergy(30);
        setTimeout(() => useMascotStore.getState().setEmotion('idle'), 1000);
        return;
      }
      
      const now = Date.now();
      if (now - lastClickTime < 600) {
        clickCount++;
      } else {
        clickCount = 1;
      }
      lastClickTime = now;
      
      clearTimeout(pokeTimeout);
      pokeTimeout = setTimeout(() => { clickCount = 0; }, 1000);
      
      if (clickCount === 1) {
        useMascotStore.getState().setEmotion('curious');
        setTimeout(() => useMascotStore.getState().setEmotion('idle'), 800);
      } else if (clickCount === 3) {
        useMascotStore.getState().updatePatience(-1);
        useMascotStore.getState().setEmotion('annoyed');
        // Rub head animation trigger
        setTimeout(() => {
          if (useMascotStore.getState().patience > 0) {
            useMascotStore.getState().setEmotion('idle');
          }
        }, 1500);
      } else if (clickCount >= 5) {
        useMascotStore.getState().updatePatience(-2);
        useMascotStore.getState().setEmotion('dizzy');
        // Step back logic handled in locomotion
        setTimeout(() => {
          useMascotStore.getState().setEmotion('idle');
        }, 2500);
      }
      
      useMascotStore.getState().recordInteraction();
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);
  
  // Sleep Timer
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const reset = () => {
      clearTimeout(timeout);
      const state = useMascotStore.getState();
      if (state.isSleeping && !state.isDragging) {
        useMascotStore.getState().setEmotion('surprised');
        useMascotStore.getState().updateEnergy(20);
        setTimeout(() => useMascotStore.getState().setEmotion('idle'), 800);
      }
      timeout = setTimeout(() => {
        const current = useMascotStore.getState();
        if (!current.isDragging && current.emotion !== 'sleep') {
          useMascotStore.getState().setEmotion('sleep');
          useMascotStore.getState().setLocomotion('sleep');
        }
      }, 60000);
    };
    
    ['mousemove', 'click', 'scroll', 'keypress'].forEach(evt => {
      window.addEventListener(evt, reset);
    });
    reset();
    
    return () => {
      clearTimeout(timeout);
      ['mousemove', 'click', 'scroll', 'keypress'].forEach(evt => {
        window.removeEventListener(evt, reset);
      });
    };
  }, []);
}