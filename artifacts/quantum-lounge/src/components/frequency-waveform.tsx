import { useEffect, useRef } from "react";

interface FrequencyWaveformProps {
  frequency: number;
  color?: string;
  barCount?: number;
  height?: number;
}

export function FrequencyWaveform({
  frequency,
  color = "rgb(255, 0, 255)",
  barCount = 12,
  height = 32,
}: FrequencyWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barWidth = 3;
    const gap = 2;
    const totalWidth = barCount * (barWidth + gap) - gap;
    canvas.width = totalWidth;
    canvas.height = height;

    const speeds = Array.from({ length: barCount }, (_, i) => {
      const base = (frequency / 440) * 2;
      return base + Math.sin(i * 0.8) * 0.5 + Math.random() * 0.3;
    });
    const offsets = Array.from({ length: barCount }, () => Math.random() * Math.PI * 2);

    const draw = (time: number) => {
      timeRef.current = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < barCount; i++) {
        const phase = offsets[i] + (time * speeds[i]) / 1000;
        const normalized = (Math.sin(phase) + 1) / 2;
        const minH = height * 0.15;
        const maxH = height * 0.9;
        const barH = minH + normalized * (maxH - minH);
        const x = i * (barWidth + gap);
        const y = (height - barH) / 2;

        const alpha = 0.5 + normalized * 0.5;
        ctx.fillStyle = color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 1.5);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animRef.current);
  }, [frequency, color, barCount, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ imageRendering: "pixelated" }}
      className="opacity-80"
    />
  );
}
