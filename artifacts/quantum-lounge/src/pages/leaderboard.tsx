import { useGetLeaderboard } from "@workspace/api-client-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, ArrowRightLeft, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/count-up";
import { GlitchText } from "@/components/glitch-text";
import { Skeleton } from "@/components/ui/skeleton";
import { GuestProfile } from "@/components/guest-profile";

const energyColors: Record<string, string> = {
  basic: "text-muted-foreground border-white/10",
  charged: "text-accent border-accent/30",
  quantum: "text-primary border-primary/30",
  transcended: "text-secondary border-secondary/30",
};

const rankIcons: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  const [profileGuestId, setProfileGuestId] = useState<number | null>(null);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <section className="text-center py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-t-2 border-primary border-r-2 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)] bg-primary/10">
              <Trophy className="w-8 h-8 text-primary glow-text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-4 glow-text-primary">
            <GlitchText>Quantum Hierarchy</GlitchText>
          </h1>
          <p className="text-primary/80 font-mono max-w-xl mx-auto">
            Top entities ranked by energy tier, upgrade acquisition, and teleport activity.
          </p>
        </motion.div>
      </section>

      <Card className="bg-card/40 backdrop-blur-md border-primary/20 overflow-hidden">
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-black/20">
                  <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 bg-white/5 rounded" />
                    <Skeleton className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                  <Skeleton className="h-6 w-16 bg-white/5 rounded" />
                  <Skeleton className="h-6 w-10 bg-white/5 rounded" />
                  <Skeleton className="h-6 w-10 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : leaderboard?.length === 0 ? (
            <div className="text-center py-20 text-primary/50 font-mono">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              No entities in the hierarchy yet.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                <span>#</span>
                <span>Entity</span>
                <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /></span>
                <span className="flex items-center gap-1"><ArrowRightLeft className="w-3 h-3" /></span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Score</span>
              </div>

              <div className="space-y-2">
                {leaderboard?.map((entry, idx) => (
                  <motion.div
                    key={entry.guestId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center p-4 rounded-xl border transition-all ${
                      entry.rank <= 3
                        ? "bg-primary/5 border-primary/20 hover:border-primary/40"
                        : "bg-black/20 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold font-display">
                      {rankIcons[entry.rank] ?? (
                        <span className="text-muted-foreground text-sm">#{entry.rank}</span>
                      )}
                    </div>

                    <div>
                      <button
                        onClick={() => setProfileGuestId(entry.guestId)}
                        className="font-bold text-white tracking-wide hover:text-primary transition-colors cursor-pointer"
                      >
                        {entry.guestName}
                      </button>
                      <div className={`text-xs font-mono uppercase tracking-widest px-2 py-0.5 rounded border inline-block mt-1 ${energyColors[entry.energyLevel] ?? energyColors.basic}`}>
                        {entry.energyLevel}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-mono text-accent font-bold">{entry.upgradeCount}</div>
                      <div className="text-xs text-muted-foreground font-mono">upgr</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-mono text-primary font-bold">{entry.teleportCount}</div>
                      <div className="text-xs text-muted-foreground font-mono">tele</div>
                    </div>

                    <div className="text-right min-w-[64px]">
                      <div className="text-lg font-bold font-display text-white">
                        <CountUp value={entry.score} />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">pts</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="text-center text-xs font-mono text-muted-foreground">
        Score = Energy Tier × 100 + Upgrades × 10 + Teleports
      </div>

      <GuestProfile guestId={profileGuestId} onClose={() => setProfileGuestId(null)} />
    </div>
  );
}
