
import React, { useRef, useEffect } from 'react';
import { SimulationObjectState } from '../types';
import { PHYSICS, COLORS, CHARACTERS } from '../constants';

interface SimulationCanvasProps {
  objects: SimulationObjectState[];
  maxDistance: number;
  globalFriction: number;
  globalDrag: number;
  onTap?: () => void;
}

interface ImpactPulse {
  x: number;
  y: number;
  age: number;
  color: string;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ 
  objects, 
  maxDistance, 
  globalFriction,
  globalDrag,
  onTap
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  
  const objectsRef = useRef(objects);
  const maxDistanceRef = useRef(maxDistance);

  // Pulse animation state
  const pulsedSetRef = useRef<Set<string>>(new Set());
  const pulsesRef = useRef<ImpactPulse[]>([]);

  useEffect(() => {
    objectsRef.current = objects;
    maxDistanceRef.current = maxDistance;
  }, [objects, maxDistance]);

  useEffect(() => {
    CHARACTERS.forEach(char => {
      const img = new Image();
      img.onload = () => {
        imagesRef.current[char.id] = img;
      };
      img.src = char.image;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;

      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      const width = Math.max(300, Math.floor(container.clientWidth));
      const height = Math.max(240, Math.floor(container.clientHeight));

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const render = () => {
      const container = containerRef.current;
      if (!container) return;

      resizeCanvas();

      // Background - Professional Lab Slate
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      const currentMaxDist = maxDistanceRef.current;
      const currentObjects = objectsRef.current;

      const cssWidth = canvas.width / (window.devicePixelRatio || 1);
      const cssHeight = canvas.height / (window.devicePixelRatio || 1);

      const trackMarginY = cssHeight < 450 ? Math.max(24, Math.round(cssHeight * 0.06)) : Math.round(cssHeight * 0.08);
      const trackMarginX = Math.max(32, Math.round(cssWidth * 0.05));
      const trackHeight = Math.max(48, (cssHeight - trackMarginY * 2) / 3);
      const trackWidth = Math.max(200, cssWidth - trackMarginX * 2);
      const pixelsPerMeter = trackWidth / Math.max(1, currentMaxDist);

      // Subtle Background Grid
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.05)';
      ctx.lineWidth = 1;
      const step = 40;
      for(let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for(let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Track Lanes
      for (let i = 0; i < 3; i++) {
        const yBase = trackMarginY + i * trackHeight;
        
        // Lane Surface
        const gradient = ctx.createLinearGradient(trackMarginX, 0, trackMarginX + trackWidth, 0);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(trackMarginX, yBase, trackWidth, trackHeight);

        // Lane Separators
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trackMarginX, yBase + trackHeight);
        ctx.lineTo(trackMarginX + trackWidth, yBase + trackHeight);
        ctx.stroke();

        // Finish Line "Laser" Effect
        const finishX = trackMarginX + trackWidth;
        const laserGlow = ctx.createLinearGradient(finishX - 10, 0, finishX + 10, 0);
        laserGlow.addColorStop(0, 'transparent');
        laserGlow.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        laserGlow.addColorStop(1, 'transparent');
        
        ctx.fillStyle = laserGlow;
        ctx.fillRect(finishX - 10, yBase, 20, trackHeight);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(finishX, yBase);
        ctx.lineTo(finishX, yBase + trackHeight);
        ctx.stroke();
      }

      // X-Axis Metrics (Bottom)
      const axisY = canvas.height - trackMarginY / 2;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trackMarginX, axisY);
      ctx.lineTo(trackMarginX + trackWidth, axisY);
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      
      const markerStep = currentMaxDist > 500 ? 200 : 100;
      for (let m = 0; m <= currentMaxDist; m += markerStep) {
        const xPos = trackMarginX + m * pixelsPerMeter;
        ctx.beginPath();
        ctx.moveTo(xPos, axisY - 5);
        ctx.lineTo(xPos, axisY + 5);
        ctx.stroke();
        ctx.fillText(`${m}m`, xPos, axisY + 20);
      }

      // Render Pulses (Sonic Booms)
      const PULSE_DURATION = 60;
      pulsesRef.current = pulsesRef.current.filter(p => p.age < PULSE_DURATION);
      pulsesRef.current.forEach(p => {
        p.age++;
        const progress = p.age / PULSE_DURATION;
        const alpha = 1 - progress;
        const radius = Math.max(40, (cssWidth + cssHeight) * 0.12 * Math.pow(progress, 0.5));
        
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        // ensure hex with alpha fallback
        const color = p.color || '#ffffff';
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.lineWidth = 6 * (1 - progress);
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      });

      // Character Objects
      currentObjects.forEach((obj, idx) => {
        // Distribute tracks evenly and support fewer or more objects gracefully
        const laneIndex = idx % 3;
        const yCenter = trackMarginY + laneIndex * trackHeight + trackHeight / 2;
        const xPos = trackMarginX + obj.position * pixelsPerMeter;
        const radius = cssHeight < 450 ? Math.max(18, Math.round(cssHeight * 0.05)) : Math.max(28, Math.round(cssHeight * 0.07));

        // Reset tracking for finished state pulses
        if (obj.position === 0) pulsedSetRef.current.delete(obj.id);
        
        if (obj.position >= currentMaxDist && !pulsedSetRef.current.has(obj.id)) {
          pulsedSetRef.current.add(obj.id);
          pulsesRef.current.push({ x: trackMarginX + trackWidth, y: yCenter, age: 0, color: obj.color });
        }

        // High Quality Trails
        if (obj.trail.length > 2) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (let pIdx = 0; pIdx < obj.trail.length - 1; pIdx++) {
            const p1 = obj.trail[pIdx];
            const p2 = obj.trail[pIdx+1];
            const opacity = Math.floor(p1.opacity * 100).toString(16).padStart(2, '0');
            ctx.strokeStyle = `${obj.color}${opacity}`;
            ctx.lineWidth = (radius * 1.8) * p1.opacity;
            ctx.beginPath();
            ctx.moveTo(trackMarginX + p1.x * pixelsPerMeter, yCenter);
            ctx.lineTo(trackMarginX + p2.x * pixelsPerMeter, yCenter);
            ctx.stroke();
          }
        }

        // Draw Object Shadow
        ctx.shadowBlur = 15;
        ctx.shadowColor = `${obj.color}88`;
        
        // Draw Core with subtle shadow
        ctx.save();
        ctx.shadowBlur = Math.max(6, Math.round(radius * 0.4));
        ctx.shadowColor = `${obj.color}88`;
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(xPos, yCenter, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Render Clipped Image (if available)
        const charImg = imagesRef.current[obj.id];
        if (charImg?.complete) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(xPos, yCenter, radius - 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(charImg, xPos - radius, yCenter - radius, radius * 2, radius * 2);
          ctx.restore();
        }

        // Object Outer Ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, Math.round(radius * 0.08));
        ctx.beginPath();
        ctx.arc(xPos, yCenter, radius + 1, 0, Math.PI * 2);
        ctx.stroke();

        // Simple Dashboard Overlay per character (Speed)
        if (!obj.isFinished && obj.position > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "JetBrains Mono"';
          ctx.textAlign = 'center';
          ctx.fillText(`${obj.velocity.toFixed(1)} m/s`, xPos, yCenter - radius - 8);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Resize observer and orientation change support
    const onResize = () => resizeCanvas();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // Touch/click to call onTap if provided
    const container = containerRef.current;
    const ptrHandler = (ev: PointerEvent) => {
      // Prevent interference with drags, only handle quick taps
      if (typeof onTap === 'function') {
        onTap();
      }
    };

    if (container) {
      container.addEventListener('pointerdown', ptrHandler, { passive: true });
    }

    // Resize observer for more reliable container size tracking
    let ro: ResizeObserver | null = null;
    if (container && (window as any).ResizeObserver) {
      ro = new ResizeObserver(() => resizeCanvas());
      ro.observe(container);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (container) container.removeEventListener('pointerdown', ptrHandler);
      if (ro && container) ro.unobserve(container);
    };

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (container) container.removeEventListener('pointerdown', ptrHandler);
    };
  }, [onTap]);

  return (
    <div ref={containerRef} className="flex-1 w-full bg-slate-950 overflow-hidden relative border-y border-slate-800 shadow-2xl">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default SimulationCanvas;
