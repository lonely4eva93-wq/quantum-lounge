import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, MessageSquare, ArrowRightLeft, Zap, DollarSign,
  Crown, Calendar, Heart, Eye, Megaphone, Lock, Rocket,
  TrendingUp, Activity, Trophy, BarChart2, Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/count-up";

// ── Types ──────────────────────────────────────────────────────────────────

interface OverviewStats {
  totalRevenue: number;
  availableBalance: number;
  totalCashedOut: number;
  activeGuests: number;
  totalGuests: number;
  openRooms: number;
  totalRooms: number;
  totalMessages: number;
  totalTeleports: number;
  recentTransactions: RecentTx[];
}

interface IncomeSummary {
  vipRevenue: number;
  rentalRevenue: number;
  tipRevenue: number;
  oracleRevenue: number;
  sponsorRevenue: number;
  premiumMessageRevenue: number;
  boostRevenue: number;
  energyUpgradeRevenue: number;
  houseFeeRevenue: number;
  totalRevenue: number;
  activeVipMembers: number;
  activeSponsors: number;
  activeBoosts: number;
}

interface LeaderEntry {
  rank: number;
  guestId: number;
  guestName: string;
  energyLevel: string;
  status: string;
  upgradeCount: number;
  teleportCount: number;
  score: number;
}

interface RecentTx {
  id: number;
  type: string;
  amount: number;
  description: string;
  guestName: string | null;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const ENERGY_COLORS: Record<string, string> = {
  basic: "text-muted-foreground",
  charged: "text-yellow-400",
  quantum: "text-cyan-400",
  transcended: "text-fuchsia-400",
};

const ENERGY_BG: Record<string, string> = {
  basic: "bg-white/5 border-white/10",
  charged: "bg-yellow-500/10 border-yellow-500/20",
  quantum: "bg-cyan-500/10 border-cyan-500/20",
  transcended: "bg-fuchsia-500/10 border-fuchsia-500/20",
};

const RANK_ICONS = ["🥇", "🥈", "🥉"];

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

// ── Income stream config ───────────────────────────────────────────────────

const STREAMS = [
  { key: "vipRevenue" as keyof IncomeSummary, label: "VIP Memberships", icon: Crown, color: "text-yellow-400", bar: "bg-yellow-400" },
  { key: "tipRevenue" as keyof IncomeSummary, label: "Tips", icon: Heart, color: "text-pink-400", bar: "bg-pink-400" },
  { key: "oracleRevenue" as keyof IncomeSummary, label: "Oracle Readings", icon: Eye, color: "text-purple-400", bar: "bg-purple-400" },
  { key: "rentalRevenue" as keyof IncomeSummary, label: "Room Rentals", icon: Calendar, color: "text-blue-400", bar: "bg-blue-400" },
  { key: "boostRevenue" as keyof IncomeSummary, label: "Leaderboard Boosts", icon: Rocket, color: "text-cyan-400", bar: "bg-cyan-400" },
  { key: "premiumMessageRevenue" as keyof IncomeSummary, label: "Premium DMs", icon: Lock, color: "text-emerald-400", bar: "bg-emerald-400" },
  { key: "sponsorRevenue" as keyof IncomeSummary, label: "Sponsorships", icon: Megaphone, color: "text-orange-400", bar: "bg-orange-400" },
  { key: "energyUpgradeRevenue" as keyof IncomeSummary, label: "Energy Upgrades", icon: Zap, color: "text-primary", bar: "bg-primary" },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function StatsPage() {
  const { data: overview, isLoading: loadingOverview } = useQuery<OverviewStats>({
    queryKey: ["stats-overview"],
    queryFn: () => fetch("/api/stats/overview").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const { data: income, isLoading: loadingIncome } = useQuery<IncomeSummary>({
    queryKey: ["income-summary"],
    queryFn: () => fetch("/api/income/summary").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const { data: leaderboard } = useQuery<LeaderEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: () => fetch("/api/stats/leaderboard?includeAll=true").then((r) => r.json()),
    refetchInterval: 30_000,
  });

  const maxStream = income
    ? Math.max(...STREAMS.map((s) => Number(income[s.key] ?? 0)), 1)
    : 1;

  const totalRevenue = income?.totalRevenue ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <BarChart2 className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-display tracking-widest text-foreground uppercase">Quantum Stats</h1>
        </div>
        <p className="text-muted-foreground text-sm">Live lounge activity · Revenue · Guest leaderboard</p>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Guests", value: overview?.activeGuests ?? 0, icon: Activity, color: "text-green-400", suffix: "" },
          { label: "Total Guests", value: overview?.totalGuests ?? 0, icon: Users, color: "text-cyan-400", suffix: "" },
          { label: "Messages Sent", value: overview?.totalMessages ?? 0, icon: MessageSquare, color: "text-fuchsia-400", suffix: "" },
          { label: "Teleports", value: overview?.totalTeleports ?? 0, icon: ArrowRightLeft, color: "text-yellow-400", suffix: "" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 bg-card/40 border-border/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
                style={{ background: s.color.replace("text-", "") }} />
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              {loadingOverview
                ? <div className="h-8 w-16 bg-white/10 rounded animate-pulse mb-1" />
                : <div className={`text-3xl font-bold ${s.color}`}>
                    <CountUp value={s.value} />
                  </div>}
              <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,243,255,0.06),transparent_60%)]" />
          <div className="relative grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Revenue Generated</div>
              {loadingIncome
                ? <div className="h-10 w-32 bg-white/10 rounded animate-pulse mx-auto" />
                : <div className="text-4xl font-display font-bold text-primary glow-text-primary">
                    {fmt$(totalRevenue)}
                  </div>}
            </div>
            <div className="text-center">
              <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Active VIP Members</div>
              <div className="text-4xl font-display font-bold text-yellow-400">
                {income?.activeVipMembers ?? 0}
              </div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Available Balance</div>
              {loadingOverview
                ? <div className="h-10 w-32 bg-white/10 rounded animate-pulse mx-auto" />
                : <div className="text-4xl font-display font-bold text-green-400">
                    {fmt$(overview?.availableBalance ?? 0)}
                  </div>}
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Income breakdown */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-sm font-display tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Income by Stream
          </h2>
          <Card className="p-5 border-border/50 bg-card/30 space-y-4">
            {STREAMS.map((s) => {
              const val = Number(income?.[s.key] ?? 0);
              const pct = totalRevenue > 0 ? (val / totalRevenue) * 100 : 0;
              const barPct = maxStream > 0 ? (val / maxStream) * 100 : 0;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/50">{pct.toFixed(1)}%</span>
                      <span className={`text-sm font-bold ${s.color}`}>{fmt$(val)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${s.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              );
            })}
            {loadingIncome && (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-7 bg-white/5 rounded animate-pulse" />
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Guest leaderboard */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-sm font-display tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Top Guests
          </h2>
          <Card className="border-border/50 bg-card/30 divide-y divide-border/30">
            {leaderboard?.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-sm">No guests yet</div>
            )}
            {leaderboard?.map((g, i) => (
              <div key={g.guestId} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 text-center flex-shrink-0">
                  {i < 3
                    ? <span className="text-lg">{RANK_ICONS[i]}</span>
                    : <span className="text-sm font-bold text-muted-foreground">#{g.rank}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">{g.guestName}</span>
                    {g.status === "active" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs font-mono ${ENERGY_COLORS[g.energyLevel] ?? "text-muted-foreground"}`}>
                      {g.energyLevel}
                    </span>
                    <span className="text-xs text-muted-foreground/50">
                      {g.upgradeCount} upgrades · {g.teleportCount} teleports
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-primary">{g.score}</div>
                  <div className="text-[10px] text-muted-foreground">pts</div>
                </div>
              </div>
            ))}
            {!leaderboard && (
              <div className="divide-y divide-border/30">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-5 bg-white/10 rounded animate-pulse" />
                    <div className="flex-1 h-8 bg-white/5 rounded animate-pulse" />
                    <div className="w-10 h-5 bg-white/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-sm font-display tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Recent Activity
        </h2>
        <Card className="border-border/50 bg-card/30 divide-y divide-border/30">
          {overview?.recentTransactions?.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.amount > 0 ? "bg-green-400" : "bg-red-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-foreground text-xs truncate">{tx.description}</div>
                {tx.guestName && (
                  <div className="text-muted-foreground/50 text-xs">{tx.guestName}</div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-sm font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                  {tx.amount > 0 ? "+" : ""}{fmt$(tx.amount)}
                </span>
                <span className="text-xs text-muted-foreground/40 w-16 text-right">{timeAgo(tx.createdAt)}</span>
              </div>
            </div>
          ))}
          {!overview?.recentTransactions?.length && !loadingOverview && (
            <div className="py-8 text-center text-muted-foreground text-sm">No transactions yet</div>
          )}
          {loadingOverview && (
            <div className="divide-y divide-border/30">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                  <div className="flex-1 h-5 bg-white/5 rounded animate-pulse" />
                  <div className="w-16 h-5 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Lounge health */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="text-sm font-display tracking-widest text-muted-foreground uppercase mb-4 flex items-center gap-2">
          <Star className="w-4 h-4" /> Lounge Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Open Rooms", value: overview?.openRooms ?? 0, total: overview?.totalRooms ?? 0, color: "bg-cyan-400" },
            { label: "Active Sponsors", value: income?.activeSponsors ?? 0, total: null, color: "bg-orange-400" },
            { label: "Active Boosts", value: income?.activeBoosts ?? 0, total: null, color: "bg-primary" },
            { label: "Total Cashed Out", value: null, raw: overview ? fmt$(overview.totalCashedOut) : "$0.00", color: "bg-green-400" },
          ].map((item) => (
            <Card key={item.label} className="p-4 border-border/50 bg-card/30">
              <div className={`w-8 h-1 rounded-full ${item.color} mb-3`} />
              <div className="text-xl font-bold text-foreground">
                {item.raw ?? (
                  <>
                    {item.value}
                    {item.total != null && (
                      <span className="text-sm text-muted-foreground font-normal"> / {item.total}</span>
                    )}
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{item.label}</div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
