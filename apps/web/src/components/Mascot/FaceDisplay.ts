import * as THREE from 'three';

export class FaceDisplay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  private blinkTimer: number = 0;
  private nextBlink: number = 2000;
  private isBlinking: boolean = false;
  private zzzOffset: number = 0;
  
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }
  
  update(
    emotion: string, 
    isPetting: boolean, 
    battery: number, 
    isSleeping: boolean,
    delta: number,
    time: number
  ) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);
    
    // Scanline effect
    ctx.fillStyle = 'rgba(0, 255, 0, 0.03)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }
    
    // Battery indicator (top right)
    ctx.fillStyle = battery < 20 ? '#ff3333' : '#00ff66';
    ctx.fillRect(w - 80, 20, 60 * (battery / 100), 8);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(w - 80, 20, 60, 8);
    
    // Emotion rendering
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 120px "Courier New", monospace';
    
    if (isSleeping) {
      // Animated Zzz
      this.zzzOffset += delta * 30;
      ctx.fillStyle = '#8888ff';
      const zzzY = (h / 2) - 50 - Math.sin(time * 2) * 20;
      ctx.font = 'bold 60px monospace';
      ctx.fillText('Z', w/2 - 30, zzzY);
      ctx.fillText('z', w/2, zzzY - 30);
      ctx.fillText('z', w/2 + 25, zzzY - 60);
      
      // Sleep icon
      ctx.font = 'bold 100px monospace';
      ctx.fillStyle = '#555';
      ctx.fillText('◉_◉', w/2, h/2 + 40);
    } else if (isPetting) {
      // Blush background
      const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, 200);
      gradient.addColorStop(0, 'rgba(255, 100, 150, 0.3)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      
      ctx.fillStyle = '#ff66cc';
      ctx.fillText('^w^', w/2, h/2);
    } else if (emotion === 'happy') {
      ctx.fillStyle = '#00ff66';
      ctx.fillText('◉‿◉', w/2, h/2);
    } else if (emotion === 'annoyed') {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('◉︵◉', w/2, h/2);
      // Anger vein
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w/2 - 80, h/2 - 80);
      ctx.lineTo(w/2 - 60, h/2 - 100);
      ctx.lineTo(w/2 - 40, h/2 - 80);
      ctx.stroke();
    } else if (emotion === 'surprised') {
      ctx.fillStyle = '#33ccff';
      ctx.fillText('⊙△⊙', w/2, h/2);
    } else if (emotion === 'dizzy') {
      ctx.fillStyle = '#ff66ff';
      const swirl = Math.sin(time * 10) * 5;
      ctx.save();
      ctx.translate(w/2, h/2);
      ctx.rotate(swirl * Math.PI / 180);
      ctx.fillText('@_@', 0, 0);
      ctx.restore();
    } else if (emotion === 'curious') {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('◉_◉?', w/2, h/2);
    } else if (emotion === 'reading') {
      ctx.fillStyle = '#00ccff';
      ctx.fillText('◉_◉', w/2, h/2);
      // Reading glasses effect
      ctx.strokeStyle = '#00ccff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w/2 - 40, h/2, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w/2 + 40, h/2, 45, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Idle with blink
      this.blinkTimer += delta * 1000;
      if (this.blinkTimer > this.nextBlink) {
        this.isBlinking = true;
        if (this.blinkTimer > this.nextBlink + 150) {
          this.isBlinking = false;
          this.blinkTimer = 0;
          this.nextBlink = 2000 + Math.random() * 4000;
        }
      }
      
      if (this.isBlinking) {
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(w/2 - 60, h/2 - 10, 50, 6);
        ctx.fillRect(w/2 + 10, h/2 - 10, 50, 6);
      } else {
        ctx.fillStyle = '#00ff66';
        ctx.fillText('◉‿◉', w/2, h/2);
      }
    }
    
    this.texture.needsUpdate = true;
  }
  
  dispose() {
    this.texture.dispose();
  }
}