'use client';

import { useEffect, useRef, useCallback } from 'react';

type Particle = {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  baseAlpha: number;
  alpha: number;
};

export default function HomeSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  const init = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: 420 }, () => {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const baseAlpha = 0.05 + Math.random() * 0.1;
      return { x, y, ox: x, oy: y, vx: 0, vy: 0, baseAlpha, alpha: baseAlpha };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init(canvas.width, canvas.height);
    };
    setSize();

    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', () => {
      mouseRef.current = { x: -9999, y: -9999 };
    });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;
      const R = 88;

      for (const p of particlesRef.current) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < R && dist > 0) {
          const f = ((R - dist) / R) ** 2 * 1.4;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
          p.alpha += (p.baseAlpha + 0.3 - p.alpha) * 0.1;
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.035;
        }

        p.vx += (p.ox - p.x) * 0.04;
        p.vy += (p.oy - p.y) * 0.04;
        p.vx *= 0.8;
        p.vy *= 0.8;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = `rgba(26,26,26,${Math.min(Math.max(p.alpha, 0), 0.48)})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [init]);

  return (
    <div className="w-full" style={{ height: 'calc(100vh - 64px)' }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
