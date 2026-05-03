import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Zap, ArrowRightLeft, ShoppingBag, Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface GuestData {
  id: number;
  name: string;
  vibe: string;
  energyLevel: string;
  status: string;
  checkedInAt: string;
  roomName?: string | null;
}

interface Achievement {
  id: number;
  badgeId: string;
  awardedAt: string;
  badge?: { id: string; label: string; icon: string; description: string };
}

const energyColors: Record<string, string> = {
  basic: "text-muted-foreground border-white/10 bg-white/5",
  charged: "text-accent border-accent/30 bg-accent/10",
  quantum: "text-primary border-primary/30 bg-primary/10",
  transcended: "text-secondary border-secondary/30 bg-secondary/10",
};

const energyGlows: Record<string, string> = {
  basic: "",
  charged: "shadow-[0_0_30px_rgba(255,165,0,0.15)]",
  quantum: "shadow-[0_0_30px_rgba(0,243,255,0.15)]",
  transcended: "shadow-[0_0_30px_rgba(191,0,255,0.2)]",
};

export default function GuestProfilePage() {
  const params = useParams<{ id: string }>();
  const guestId = parseInt(params.id ?? "");
  const [copied, setCopied] = useState(false);

  const { data: guest, isLoading: loadingGuest } = useQuery<GuestData>({
    queryKey: ["guest", guestId],
    queryFn: async () => {
      const res = await fetch(`/api/guests/${guestId}`);
      if (!res.ok) throw new Error("Guest not found");
      return res.json();
    },
    enabled: !isNaN(guestId),
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["achievements", guestId],
    queryFn: async () => {
      const res = await fetch(`/api/achievements/guest/${guestId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !isNaN(guestId),
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${guest?.name} @ Quantum Lounge`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isNaN(guestId)) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Invalid guest ID.</div>;
  }

  if (loadingGuest) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-20">
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono mt-20">
        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
        Guest not found in the void.
      </div>
    );
  }

  const color = energyColors[guest.energyLevel] ?? energyColors.basic;
  const glow = energyGlows[guest.energyLevel] ?? "";

  return (
    <div className="p-8 max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Card */}
        <Card className={`p-8 bg-card/60 backdrop-blur-xl border-primary/20 ${glow} relative overflow-hidden`}>
          {/* Background glow orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-display border-2 ${color}`}>
                {guest.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold uppercase tracking-wider text-white">{guest.name}</h1>
                <p className="text-sm text-muted-foreground font-mono italic">"{guest.vibe}"</p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${color}`}>
                {guest.energyLevel}
              </span>
              <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${
                guest.status === "active" ? "text-green-400 border-green-400/30 bg-green-400/10" : "text-muted-foreground border-white/10 bg-white/5"
              }`}>
                {guest.status === "active" ? "⚡ Active" : "Departed"}
              </span>
              {guest.roomName && (
                <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border text-accent border-accent/30 bg-accent/10">
                  {guest.roomName}
                </span>
              )}
            </div>

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Badges
                </div>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((a) => (
                    <div
                      key={a.id}
                      title={a.badge?.description}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white hover:border-primary/30 transition-colors cursor-default"
                    >
                      <span>{a.badge?.icon ?? "🏅"}</span>
                      <span className="text-muted-foreground">{a.badge?.label ?? a.badgeId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member since */}
            <div className="text-xs font-mono text-muted-foreground border-t border-white/5 pt-4 flex items-center justify-between">
              <span>Materialized {new Date(guest.checkedInAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="text-primary/40 font-mono text-[10px]">QUANTUM LOUNGE</span>
            </div>
          </div>
        </Card>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary font-mono text-sm uppercase tracking-widest hover:bg-primary/20 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? "Link Copied" : "Share Profile"}
        </button>
      </motion.div>
    </div>
  );
}
