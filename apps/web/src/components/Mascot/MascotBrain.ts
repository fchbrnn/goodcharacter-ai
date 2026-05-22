import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type Emotion = 
  | 'idle' | 'happy' | 'annoyed' | 'sleep' | 'surprised' 
  | 'petting' | 'curious' | 'dizzy' | 'reading' | 'patrol';

export type LocomotionMode = 'idle' | 'patrol' | 'chase' | 'sleep';

interface DOMElement {
  id: string;
  rect: DOMRect;
  type: 'navbar' | 'footer' | 'cta' | 'text';
}

interface MascotState {
  // Core FSM
  emotion: Emotion;
  locomotionMode: LocomotionMode;
  
  // Vitals
  battery: number;
  patience: number;      // 0-5, 0 = angry
  affection: number;     // 0-100
  energy: number;        // 0-100
  
  // Interaction
  isDragging: boolean;
  isPetting: boolean;
  isSleeping: boolean;
  lastInteractionTime: number;
  
  // Spatial
  targetPosition: [number, number, number] | null;
  currentAnchor: string | null; // DOM element ID robot is standing on
  
  // DOM Awareness
  domElements: DOMElement[];
  hoveredCTA: string | null;
  
  // Sensory
  cursorVelocity: number;
  cursorHistory: Array<{x:number,y:number,t:number}>;
  
  // Actions
  setEmotion: (e: Emotion) => void;
  setLocomotion: (m: LocomotionMode) => void;
  setIsDragging: (v: boolean) => void;
  setIsPetting: (v: boolean) => void;
  updatePatience: (delta: number) => void;
  updateAffection: (delta: number) => void;
  updateBattery: (delta: number) => void;
  updateEnergy: (delta: number) => void;
  registerDOMElement: (el: DOMElement) => void;
  setHoveredCTA: (id: string | null) => void;
  setTargetPosition: (pos: [number, number, number] | null) => void;
  recordInteraction: () => void;
  setCursorVelocity: (v: number) => void;
  pushCursorHistory: (sample: {x:number,y:number,t:number}) => void;
}

const MAX_HISTORY = 60;

export const useMascotStore = create<MascotState>()(
  subscribeWithSelector((set, get) => ({
    emotion: 'idle',
    locomotionMode: 'idle',
    battery: 100,
    patience: 3,
    affection: 50,
    energy: 100,
    isDragging: false,
    isPetting: false,
    isSleeping: false,
    lastInteractionTime: Date.now(),
    targetPosition: null,
    currentAnchor: null,
    domElements: [],
    hoveredCTA: null,
    cursorVelocity: 0,
    cursorHistory: [],
    
    setEmotion: (emotion) => set({ emotion }),
    setLocomotion: (locomotionMode) => set({ locomotionMode }),
    setIsDragging: (isDragging) => set({ isDragging }),
    setIsPetting: (isPetting) => set({ isDragging: false, isPetting }),
    
    updatePatience: (delta) => set((s) => {
      const next = Math.min(5, Math.max(0, s.patience + delta));
      let emotion = s.emotion;
      if (next <= 1 && s.emotion !== 'annoyed') emotion = 'annoyed';
      else if (next >= 4 && s.emotion === 'annoyed') emotion = 'idle';
      return { patience: next, emotion };
    }),
    
    updateAffection: (delta) => set((s) => ({ 
      affection: Math.min(100, Math.max(0, s.affection + delta)) 
    })),
    
    updateBattery: (delta) => set((s) => ({ 
      battery: Math.min(100, Math.max(0, s.battery + delta)) 
    })),
    
    updateEnergy: (delta) => set((s) => {
      const next = Math.min(100, Math.max(0, s.energy + delta));
      return { 
        energy: next, 
        isSleeping: next < 10,
        emotion: next < 10 ? 'sleep' : s.emotion 
      };
    }),
    
    registerDOMElement: (el) => set((s) => ({
      domElements: [...s.domElements.filter(d => d.id !== el.id), el]
    })),
    
    setHoveredCTA: (hoveredCTA) => set({ hoveredCTA }),
    setTargetPosition: (targetPosition) => set({ targetPosition }),
    
    recordInteraction: () => set({ 
      lastInteractionTime: Date.now(),
      isSleeping: false,
      energy: Math.min(100, get().energy + 5)
    }),
    
    setCursorVelocity: (cursorVelocity) => set({ cursorVelocity }),
    
    pushCursorHistory: (sample) => set((s) => {
      const next = [...s.cursorHistory, sample];
      if (next.length > MAX_HISTORY) next.shift();
      return { cursorHistory: next };
    }),
  }))
);

// Selectors
export const selectIsTired = (s: MascotState) => s.energy < 20;
export const selectCanPet = (s: MascotState) => s.patience > 0 && !s.isSleeping;