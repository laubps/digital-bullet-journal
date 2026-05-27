'use client';

import { useEffect, useRef } from 'react';

type Drop = {
  x: number;
  y: number;
  len: number;
  speed: number;
  drift: number;
  opacity: number;
};

export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const FADE_MS = 10000;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drops: Drop[] = Array.from({ length: 500 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: 14 + Math.random() * 22,
      speed: 4 + Math.random() * 8,
      drift: -1 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.2,
    }));

    const render = (now: number) => {
      const elapsed = now - start;
      const alpha = Math.max(0, 1 - elapsed / FADE_MS);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (alpha <= 0) return;

      ctx.lineWidth = 1;
      for (const d of drops) {
        const a = d.opacity * alpha;
        ctx.strokeStyle = `rgba(200,210,230,${a})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.drift * (d.len * alpha) * 0.2, d.y + d.len * alpha);
        ctx.stroke();
        d.x += d.drift;
        d.y += d.speed;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
