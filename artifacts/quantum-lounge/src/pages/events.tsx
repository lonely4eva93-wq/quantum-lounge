import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Radio, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GlitchText } from "@/components/glitch-text";
import { useQuery } from "@tanstack/react-query";

interface RoomEvent {
  id: number;
  name: string;
  description: string;
  roomId: number | null;
  roomName: string | null;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
}

function useEvents() {
  return useQuery<RoomEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    refetchInterval: 30_000,
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function isUpcoming(event: RoomEvent) {
  return new Date(event.startTime) > new Date();
}

function isHappening(event: RoomEvent) {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;
  return start <= now && (!end || end > now);
}

export default function Events() {
  const { data: events, isLoading } = useEvents();

  const live = events?.filter(isHappening) ?? [];
  const upcoming = events?.filter((e) => isUpcoming(e)) ?? [];
  const past = events?.filter((e) => !isHappening(e) && !isUpcoming(e)) ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <section className="text-center py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-t-2 border-secondary border-r-2 flex items-center justify-center shadow-[0_0_20px_rgba(191,0,255,0.3)] bg-secondary/10">
              <Calendar className="w-8 h-8 text-secondary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-4" style={{ textShadow: "0 0 20px rgba(191,0,255,0.5)" }}>
            <GlitchText>Quantum Events</GlitchText>
          </h1>
          <p className="text-secondary/80 font-mono max-w-xl mx-auto">
            Scheduled transmissions, frequency ceremonies, and dimensional gatherings.
          </p>
        </motion.div>
      </section>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {live.length > 0 && (
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-green-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
                Happening Now
              </h2>
              <div className="space-y-3">
                {live.map((event, idx) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}>
                    <Card className="p-5 bg-green-400/5 border-green-400/30 hover:border-green-400/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-display font-bold text-white uppercase tracking-wider text-lg mb-1">{event.name}</div>
                          {event.description && <p className="text-sm text-muted-foreground font-mono mb-2">{event.description}</p>}
                          <div className="flex items-center gap-3 text-xs font-mono text-green-400">
                            {event.roomName && <span className="flex items-center gap-1"><Radio className="w-3 h-3" />{event.roomName}</span>}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(event.startTime)}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono uppercase tracking-widest px-2 py-1 rounded border border-green-400/40 text-green-400 bg-green-400/10 shrink-0">Live</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Upcoming
              </h2>
              <div className="space-y-3">
                {upcoming.map((event, idx) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}>
                    <Card className="p-5 bg-card/40 border-primary/20 hover:border-primary/40 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-display font-bold text-white uppercase tracking-wider text-lg mb-1">{event.name}</div>
                          {event.description && <p className="text-sm text-muted-foreground font-mono mb-2">{event.description}</p>}
                          <div className="flex items-center gap-3 text-xs font-mono text-primary/70">
                            {event.roomName && <span className="flex items-center gap-1"><Radio className="w-3 h-3" />{event.roomName}</span>}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(event.startTime)}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono uppercase tracking-widest px-2 py-1 rounded border border-primary/40 text-primary bg-primary/10 shrink-0">Soon</span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {live.length === 0 && upcoming.length === 0 && (
            <div className="text-center py-20 text-primary/40 font-mono">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No events scheduled yet.</p>
              <p className="text-xs mt-2 text-muted-foreground">Check back soon — the void has plans.</p>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Past Transmissions</h2>
              <div className="space-y-2 opacity-50">
                {past.slice(0, 5).map((event) => (
                  <Card key={event.id} className="p-4 bg-card/20 border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-muted-foreground">{event.name}</span>
                      <span className="text-xs font-mono text-muted-foreground/60">{formatTime(event.startTime)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
