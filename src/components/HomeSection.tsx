'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  wanderAngle: number;
  wanderSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
};

export default function HomeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth ?? window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight ?? window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const density = window.innerWidth < 768 ? 14000 : 9000;
      const count = Math.floor((canvas.width * canvas.height) / density);
      for (let i = 0; i < count; i++) {
        const baseOpacity = Math.random() * 0.22 + 0.07;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          size: Math.random() * 2 + 2,
          baseOpacity,
          opacity: baseOpacity,
          wanderAngle: Math.random() * Math.PI * 2,
          wanderSpeed: Math.random() * 0.004 + 0.001,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.007 + 0.003,
        });
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.wanderAngle += p.wanderSpeed;
        p.vx += Math.cos(p.wanderAngle) * 0.012;
        p.vy += Math.sin(p.wanderAngle) * 0.012;

        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distSq = dx * dx + dy * dy;
          const radius = 200;
          if (distSq < radius * radius) {
            const dist = Math.sqrt(distSq);
            const strength = (1 - dist / radius);
            const force = strength * strength * 0.14;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        const damping = mouseActive ? 0.86 : 0.95;
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        p.pulsePhase += p.pulseSpeed;
        p.opacity = p.baseOpacity + Math.sin(p.pulsePhase) * 0.05;

        ctx.fillStyle = `rgba(110,110,115,${Math.max(0, p.opacity)})`;
        ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
      }

      animId = requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    };
    const onMouseLeave = () => { mouseActive = false; };
    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.touches[0].clientX - rect.left;
      mouseY = e.touches[0].clientY - rect.top;
      mouseActive = true;
    };
    const onTouchEnd = () => { mouseActive = false; };
    const onResize = () => { resize(); createParticles(); };

    resize();
    createParticles();
    tick();

    window.addEventListener('resize', onResize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-88px)] md:h-[calc(100vh-64px)] select-none overflow-hidden">
      {/* Soft field-blur ambient orbs */}
      <div className="field-blur w-[55vw] h-[55vw] left-[-10vw] top-[10vh]" style={{ background: 'radial-gradient(circle, rgba(195,205,215,0.55), transparent 70%)' }} />
      <div className="field-blur w-[45vw] h-[45vw] right-[-8vw] bottom-[5vh]" style={{ background: 'radial-gradient(circle, rgba(200,210,215,0.5), transparent 70%)' }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/home-hero.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" />
    </div>
  );
}
