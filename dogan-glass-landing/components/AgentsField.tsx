"use client";
import { useEffect, useRef } from "react";

type Agent = { x: number; y: number; vx: number; vy: number; size: number };

export default function AgentsField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const agents = useRef<Agent[]>([]);
  const mouse = useRef<{x:number;y:number}|null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
    };

    const initAgents = (count: number) => {
      agents.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6 * DPR,
        vy: (Math.random() - 0.5) * 0.6 * DPR,
        size: 2 + Math.random() * 3 * DPR,
      }));
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // subtle grid glow
      const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grd.addColorStop(0, "rgba(255,255,255,0.015)");
      grd.addColorStop(1, "rgba(0,0,0,0.02)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw agents
      const prim = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
      ctx.fillStyle = `rgba(${prim},0.9)`;
      agents.current.forEach((a) => {
        a.x += a.vx;
        a.y += a.vy;

        // bounce
        if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
        if (a.y < 0 || a.y > canvas.height) a.vy *= -1;

        // mouse gravity
        if (mouse.current) {
          const dx = mouse.current.x - a.x;
          const dy = mouse.current.y - a.y;
          const d = Math.hypot(dx, dy);
          if (d < 180 * DPR && d > 1) {
            a.vx += (dx / d) * 0.02 * DPR;
            a.vy += (dy / d) * 0.02 * DPR;
          }
        }

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // connective lines
      ctx.strokeStyle = `rgba(${prim},0.25)`;
      agents.current.forEach((a, i) => {
        for (let j = i + 1; j < agents.current.length; j++) {
          const b = agents.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 120 * DPR) {
            ctx.globalAlpha = 1 - d / (120 * DPR);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: (e.clientX - rect.left) * DPR, y: (e.clientY - rect.top) * DPR };
    };

    const onMouseLeave = () => { mouse.current = null; };

    const observer = new ResizeObserver(() => {
      resize();
      initAgents(Math.max(30, Math.floor((canvas.width * canvas.height) / (10000))));
    });
    observer.observe(canvas);

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    resize();
    initAgents(60);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <canvas ref={ref} className="w-full h-full" />
    </div>
  );
}
