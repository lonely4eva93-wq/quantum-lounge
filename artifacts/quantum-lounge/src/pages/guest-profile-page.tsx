import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Share2, Check, Zap, Trophy, Star,
  DollarSign, ArrowRightLeft, MessageSquare,
  Eye, Crown, Rocket, Lock, Heart, Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

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

interface GuestStats {
  totalSpent: number;
  tipsGiven: number;
  oracleSpend: number;
  upgradeSpend: number;
  dmSpend: number;
  boostSpend: number;
  vipSpend: number;
  teleportCount: number;
  messageCount: number;
  achievementCount: number;
  transactionCount: number;
  recentTransactions: {
    id: number;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
  }[];
}

// ── Style maps ─────────────────────────────────────────────────────────────

const energyColors: Record<string, string> = {
  basic: "text-muted-foreground border-white/10 bg-white/5",
  charged: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  quantum: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  transcended: "text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10",
};

const energyGlows: Record<string, string> = {
  basic: "",
  charged: "shadow-[0_0_30px_rgba(255,165,0,0.12)]",
  quantum: "shadow-[0_0_30px_rgba(0,243,255,0.15)]",
  transcended: "shadow-[0_0_30px_rgba(191,0,255,0.2)]",
};

const energyOrb: Record<string, string> = {
  basic: "from-white/5 to-white/0",
  charged: "from-yellow-400/10 to-yellow-400/0",
  quantum: "from-cyan-400/10 to-cyan-400/0",
  transcended: "from-fuchsia-400/10 to-fuchsia-400/0",
};

function fmt$(n: number) {
  return `$${n.toFixed(2)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Component ──────────────────────────────────────────────────────────────

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

  const { data: stats, isLoading: loadingStats } = useQuery<GuestStats>({
    queryKey: ["guest-stats", guestId],
    queryFn: async () => {
      const res = await fetch(`/api/guests/${guestId}/stats`);
      if (!res.ok) throw new Error("Stats unavailable");
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
      <div className="p-8 max-w-lg mx-auto mt-20 space-y-4">
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
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
  const orb = energyOrb[guest.energyLevel] ?? energyOrb.basic;

  const spendStreams = [
    { label: "Energy Upgrades", icon: Zap, value: stats?.upgradeSpend ?? 0, color: "text-cyan-400" },
    { label: "VIP Membership", icon: Crown, value: stats?.vipSpend ?? 0, color: "text-yellow-400" },
    { label: "Oracle Readings", icon: Eye, value: stats?.oracleSpend ?? 0, color: "text-purple-400" },
    { label: "Tips Given", icon: Heart, value: stats?.tipsGiven ?? 0, color: "text-pink-400" },
    { label: "Leaderboard Boosts", icon: Rocket, value: stats?.boostSpend ?? 0, color: "text-primary" },
    { label: "Premium DMs", icon: Lock, value: stats?.dmSpend ?? 0, color: "text-emerald-400" },
  ].filter((s) => s.value > 0);

  return (
    <div className="p-6 max-w-lg mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Card */}
        <Card className={`p-8 bg-card/60 backdrop-blur-xl border-primary/20 ${glow} relative overflow-hidden`}>
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-radial ${orb} blur-3xl pointer-events-none`} />
          <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-radial ${orb} blur-3xl pointer-events-none`} />

          <div className="relative z-10">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-display border-2 ${color}`}>
                {guest.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold uppercase tracking-wider text-white">{guest.name}</h1>
                <p className="text-sm text-muted-foreground font-mono italic">"{guest.vibe}"</p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${color}`}>
                {guest.energyLevel}
              </span>
              <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${
                guest.status === "active"
                  ? "text-green-400 border-green-400/30 bg-green-400/10"
                  : "text-muted-foreground border-white/10 bg-white/5"
              }`}>
                {guest.status === "active" ? "⚡ Active" : "Departed"}
              </span>
              {guest.roomName && (
                <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full border text-yellow-400 border-yellow-400/30 bg-yellow-400/10">
                  {guest.roomName}
                </span>
              )}
            </div>

            {/* Quick stat row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Teleports", icon: ArrowRightLeft, value: stats?.teleportCount ?? 0, color: "text-cyan-400" },
                { label: "Messages", icon: MessageSquare, value: stats?.messageCount ?? 0, color: "text-fuchsia-400" },
                { label: "Badges", icon: Star, value: stats?.achievementCount ?? (achievements?.length ?? 0), color: "text-yellow-400" },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-white/5 border border-white/10">
                  <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                  <div className={`text-lg font-bold ${s.color}`}>
                    {loadingStats ? "–" : s.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
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

        {/* Spending stats */}
        <Card className="mt-4 p-5 border-border/50 bg-card/30">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Spending</span>
            {!loadingStats && (
              <span className="ml-auto text-sm font-bold text-green-400">{fmt$(stats?.totalSpent ?? 0)} total</span>
            )}
          </div>

          {loadingStats ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : spendStreams.length > 0 ? (
            <div className="space-y-2.5">
              {spendStreams.map((s) => {
                const pct = stats && stats.totalSpent > 0 ? (s.value / stats.totalSpent) * 100 : 0;
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <s.icon className={`w-3 h-3 ${s.color}`} />
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                      <span className={`text-xs font-bold ${s.color}`}>{fmt$(s.value)}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${s.color.replace("text-", "bg-")}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/50 text-center py-3">No spending recorded yet</p>
          )}
        </Card>

        {/* Recent transactions */}
        {stats?.recentTransactions && stats.recentTransactions.length > 0 && (
          <Card className="mt-4 border-border/50 bg-card/30">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Recent Transactions</span>
            </div>
            <div className="divide-y divide-border/30">
              {stats.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tx.amount > 0 ? "bg-green-400" : "bg-red-400"}`} />
                  <span className="flex-1 text-muted-foreground truncate">{tx.description}</span>
                  <span className={`font-bold flex-shrink-0 ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                    {tx.amount > 0 ? "+" : ""}{fmt$(tx.amount)}
                  </span>
                  <span className="text-muted-foreground/40 flex-shrink-0 w-14 text-right">{timeAgo(tx.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

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
