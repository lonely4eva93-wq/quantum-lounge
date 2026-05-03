import { useEffect, useState } from "react";

interface GlitchTextProps {
  children: string;
  className?: string;
  interval?: number;
}

export function GlitchText({ children, className = "", interval = 4000 }: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    };

    const id = setInterval(trigger, interval + Math.random() * 2000);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <span
      className={`relative inline-block ${className}`}
      style={
        glitching
          ? {
              textShadow:
                "2px 0 #ff00ff, -2px 0 #00ffff, 0 0 20px rgba(0,243,255,0.8)",
              transform: `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 2}px)`,
              filter: "brightness(1.3)",
              transition: "none",
            }
          : {
              textShadow: "inherit",
              transform: "translate(0,0)",
              transition: "all 0.1s ease",
            }
      }
    >
      {children}
    </span>
  );
}
