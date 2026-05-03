import { useEffect, useRef, useState, useCallback } from "react";

export function useRoomAudio(frequency: number, enabled: boolean = false) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.08);
  const contextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stop = useCallback(() => {
    if (gainRef.current && contextRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, contextRef.current.currentTime + 1.5);
    }
    setTimeout(() => {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.disconnect();
      oscillatorRef.current = null;
      setIsPlaying(false);
    }, 1600);
  }, []);

  const play = useCallback(() => {
    if (!frequency) return;
    try {
      const ctx = new AudioContext();
      contextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();

      // Main tone - sine wave at the room frequency
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      // Sub harmonic - adds depth
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(frequency / 2, ctx.currentTime);
      subGain.gain.setValueAtTime(0, ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 2);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start();

      oscillatorRef.current = osc;
      gainRef.current = gain;
      setIsPlaying(true);
    } catch {
      // AudioContext not supported or blocked
    }
  }, [frequency, volume]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  // Update volume live
  useEffect(() => {
    if (gainRef.current && contextRef.current && isPlaying) {
      gainRef.current.gain.linearRampToValueAtTime(volume, contextRef.current.currentTime + 0.3);
    }
  }, [volume, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorRef.current?.stop();
      oscillatorRef.current?.disconnect();
      contextRef.current?.close();
    };
  }, []);

  return { isPlaying, toggle, volume, setVolume };
}
