import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const NUM_STARS = 180;
    const SPEED = 0.4;
    let animId: number;
    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const initStars = () => {
      stars = Array.from({ length: NUM_STARS }, () => ({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: Math.random() * canvas.width,
        px: 0,
        py: 0,
      }));
    };
    initStars();

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const star of stars) {
        star.px = star.x / (star.z / canvas.width) + cx;
        star.py = star.y / (star.z / canvas.width) + cy;

        star.z -= SPEED;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width;
          star.y = (Math.random() - 0.5) * canvas.height;
          star.z = canvas.width;
          star.px = star.x / (star.z / canvas.width) + cx;
          star.py = star.y / (star.z / canvas.width) + cy;
        }

        const nx = star.x / (star.z / canvas.width) + cx;
        const ny = star.y / (star.z / canvas.width) + cy;
        const size = Math.max(0.1, (1 - star.z / canvas.width) * 2.5);
        const opacity = (1 - star.z / canvas.width) * 0.7;

        ctx.beginPath();
        ctx.moveTo(star.px, star.py);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `rgba(150, 220, 255, ${opacity})`;
        ctx.lineWidth = size;
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.35 }}
    />
  );
}
