'use client';

import React, { useRef, useEffect, useState } from 'react';

const NotFoundPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configuration
    const CONFIG = {
      particleCount: 800, // Dense fog
      text: '404',
      baseSize: 2,
      glowStrength: 20, // Blur amount
      orbitSpeed: 0.001,
      swirlStrength: 0.1,
      mouseRepulsion: 150,
      // TED Red is roughly #eb0028, which is around HSL(350, 100%, 46%)
      colorBase: 'hsl(350, 100%, 46%)',
    };

    class Particle {
      isTextParticle: boolean;
      targetX: number;
      targetY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      decay: number;
      hue: number;
      lightness: number;

      constructor(isTextParticle = false, targetX = 0, targetY = 0) {
        this.isTextParticle = isTextParticle;
        this.targetX = targetX;
        this.targetY = targetY;

        // Random starting position (explosion)
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (width / 2);
        this.x = width / 2 + Math.cos(angle) * radius;
        this.y = height / 2 + Math.sin(angle) * radius;

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        this.size = Math.random() * CONFIG.baseSize + 1;
        this.life = Math.random(); // Phase for pulsing
        this.decay = Math.random() * 0.01 + 0.005;

        // Colors: TED Red variations (Red with slight pink/deep red drift)
        this.hue = 345 + Math.random() * 15; // 345-360 range
        this.lightness = Math.random() * 30 + 40; // 40-70% lightness
      }

      update(mouse: { x: number, y: number }, isClicking: boolean) {
        // 1. Target Attraction (The "Genesis" of the 404 form)
        let dx, dy;

        // Text particles try to form the number
        dx = this.targetX - this.x;
        dy = this.targetY - this.y;
        this.vx += dx * 0.03; // Snap to shape
        this.vy += dy * 0.03;

        // 2. Mouse Interaction (The "Hand of God")
        const mouseDx = mouse.x - this.x;
        const mouseDy = mouse.y - this.y;
        const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

        if (mouseDist < CONFIG.mouseRepulsion) {
          const force = (CONFIG.mouseRepulsion - mouseDist) / CONFIG.mouseRepulsion;
          const repulsionX = (mouseDx / mouseDist) * force * 15;
          const repulsionY = (mouseDy / mouseDist) * force * 15;

          this.vx -= repulsionX;
          this.vy -= repulsionY;
        }

        // 3. Click Interaction (Injection of Energy)
        if (isClicking) {
          const blowForce = 1000 / (mouseDist + 10);
          const blowX = (mouseDx / mouseDist) * blowForce;
          const blowY = (mouseDy / mouseDist) * blowForce;
          this.vx -= blowX;
          this.vy -= blowY;
        }

        // Friction
        this.vx *= 0.92;
        this.vy *= 0.92;

        this.x += this.vx;
        this.y += this.vy;

        // Pulse Life
        this.life += this.decay;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Intensity based on speed (hotter when moving fast)
        const speed = Math.abs(this.vx) + Math.abs(this.vy);
        const alpha = Math.min(0.8, 0.2 + speed * 0.1);
        // Ensure hue wraps correctly if needed, but 345-360 is fine for HSLA

        ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.lightness}%, ${alpha})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];

      // 1. Text Parsing
      const virtCanvas = document.createElement('canvas');
      virtCanvas.width = width;
      virtCanvas.height = height;
      const virtCtx = virtCanvas.getContext('2d');
      if (!virtCtx) return;

      const fontSize = Math.min(width * 0.3, 400);
      virtCtx.font = `900 ${fontSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;
      virtCtx.textAlign = 'center';
      virtCtx.textBaseline = 'middle';
      virtCtx.fillText(CONFIG.text, width / 2, height / 2);

      // Get pixel data
      const data = virtCtx.getImageData(0, 0, width, height).data;
      const step = 6; // Optimization skip

      // 2. Create Text Structure Particles
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4 + 3] > 128) {
            // Only add some pixels to keep it ethereal
            if (Math.random() > 0.6) {
              particles.push(new Particle(true, x, y));
            }
          }
        }
      }
    };

    const animate = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Additive Blending
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach(p => {
        p.update(mouseRef.current, clickRef.current);
        p.draw(ctx);
      });

      // Reset composite
      ctx.globalCompositeOperation = 'source-over';
      animationFrameId = requestAnimationFrame(animate);
    };

    const mouseRef = { current: { x: 0, y: 0 } };
    const clickRef = { current: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseDown = () => { clickRef.current = true; setIsClicking(true); };
    const handleMouseUp = () => { clickRef.current = false; setIsClicking(false); };
    const handleResize = () => init();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);

    init();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-[#eb0028] selection:text-white">

      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 block" />

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#eb0028]/10 via-transparent to-transparent mix-blend-overlay" />

      {/* UI Content */}
      <div className="relative z-20 h-full w-full flex flex-col justify-end p-8 md:p-12 pointer-events-none">

        {/* Center Interaction Hint (Removed) */}

        {/* Bottom Content */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 pointer-events-auto">
          <div className="max-w-lg">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-4 leading-none">
              <span className="text-white bg-[#eb0028] border-[#eb0028] border-r-[6px] border-l-[4px]">Idea</span> <span className="text-[#eb0028]">not found</span><span>.</span>
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6 max-w-xs">
              The page you are looking for has been moved, removed, or perhaps it's an idea that hasn't been discovered yet.
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="group px-6 py-3 bg-[#eb0028] text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#eb0028] transition-all duration-300 cursor-pointer"
              >
                Back to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="group px-6 py-3 border border-[#eb0028] text-[#eb0028] text-xs font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all duration-300 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;