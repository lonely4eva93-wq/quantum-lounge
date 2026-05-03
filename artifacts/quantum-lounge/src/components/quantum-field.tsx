import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  energy: number;
  hue: number;
  alias: string;
  pulse: number;
  pulseSpeed: number;
  connections: number[];
}

interface GuestNode {
  id: number;
  alias: string;
  energyLevel: number;
  vibeTag?: string | null;
}

interface Props {
  guests: GuestNode[];
  coherenceScore: number;
  className?: string;
}

const VIBE_HUES: Record<string, number> = {
  "Cosmic Drifter": 180,
  "Neon Prophet": 300,
  "Void Walker": 260,
  "Quantum Ghost": 200,
  "Electric Sage": 160,
  "Dark Matter": 280,
  "Singularity": 320,
  "Entropy Node": 240,
};

export function QuantumField({ guests, coherenceScore, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Spawn particles for guests + ambient background nodes
    const ambient = Math.max(0, 20 - guests.length);
    particlesRef.current = [
      ...guests.map((g, i) => ({
        x: (0.1 + Math.random() * 0.8) * W(),
        y: (0.1 + Math.random() * 0.8) * H(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 4 + Math.min(g.energyLevel / 80, 8),
        energy: g.energyLevel,
        hue: VIBE_HUES[g.vibeTag ?? ""] ?? 180 + i * 17,
        alias: g.alias,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        connections: [],
      })),
      ...Array.from({ length: ambient }, (_, i) => ({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: 1.5 + Math.random() * 2,
        energy: 0,
        hue: 180 + i * 20,
        alias: "",
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.015,
        connections: [],
      })),
    ];

    const MAX_DIST = 140;
    const coherenceFactor = coherenceScore / 100;

    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
      bg.addColorStop(0, `rgba(14,9,32,0.92)`);
      bg.addColorStop(1, `rgba(8,4,16,0.98)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Move particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        // Soft boundary bounce
        if (p.x < 20 || p.x > w - 20) p.vx *= -1;
        if (p.y < 20 || p.y > h - 20) p.vy *= -1;
        p.x = Math.max(10, Math.min(w - 10, p.x));
        p.y = Math.max(10, Math.min(h - 10, p.y));

        // Gentle center attraction scaled by coherence
        const dx = w / 2 - p.x;
        const dy = h / 2 - p.y;
        p.vx += dx * 0.00005 * coherenceFactor;
        p.vy += dy * 0.00005 * coherenceFactor;

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.8) { p.vx *= 0.98; p.vy *= 0.98; }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35 * (1 + coherenceFactor * 0.4);
            const midHue = (a.hue + b.hue) / 2;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(${midHue}, 100%, 60%, ${alpha})`;
            ctx.lineWidth = 0.5 + (1 - dist / MAX_DIST) * 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const glow = 1 + Math.sin(p.pulse) * 0.3;
        const r = p.radius * glow;

        // Outer glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, 0.5)`);
        grad.addColorStop(0.4, `hsla(${p.hue}, 100%, 60%, 0.15)`);
        grad.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 85%, 0.95)`;
        ctx.fill();

        // Label for real guests
        if (p.alias && r > 4) {
          ctx.font = `${Math.round(9 + r * 0.5)}px Inter, sans-serif`;
          ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, 0.85)`;
          ctx.textAlign = "center";
          ctx.fillText(p.alias.slice(0, 12), p.x, p.y - r - 5);
        }
      }

      // Coherence ring
      if (coherenceScore > 10) {
        const ringR = Math.min(w, h) * 0.38 * (coherenceFactor * 0.6 + 0.4);
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,243,255,${coherenceFactor * 0.12})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [guests, coherenceScore]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
