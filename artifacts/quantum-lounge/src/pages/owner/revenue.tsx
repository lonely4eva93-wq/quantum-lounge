import { useGetIncomeSummary, getGetIncomeSummaryQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Crown, Calendar, Heart, Eye, Megaphone, Lock, Rocket, Zap, TrendingUp } from "lucide-react";
import { CountUp } from "@/components/count-up";

const STREAMS = [
  { key: "vipRevenue", label: "VIP Memberships", icon: Crown, color: "text-yellow-400" },
  { key: "rentalRevenue", label: "Room Rentals", icon: Calendar, color: "text-blue-400" },
  { key: "tipRevenue", label: "Tips (House Cut)", icon: Heart, color: "text-pink-400" },
  { key: "oracleRevenue", label: "Oracle Readings", icon: Eye, color: "text-purple-400" },
  { key: "sponsorRevenue", label: "Room Sponsorships", icon: Megaphone, color: "text-orange-400" },
  { key: "premiumMessageRevenue", label: "Premium Messages", icon: Lock, color: "text-cyan-400" },
  { key: "boostRevenue", label: "Leaderboard Boosts", icon: Rocket, color: "text-primary" },
  { key: "energyUpgradeRevenue", label: "Energy Upgrades", icon: Zap, color: "text-green-400" },
  { key: "houseFeeRevenue", label: "House Fees", icon: DollarSign, color: "text-emerald-400" },
] as const;

export default function RevenuePage() {
  const { data: income, isLoading } = useGetIncomeSummary({ query: { queryKey: getGetIncomeSummaryQueryKey() } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-widest uppercase glow-text-primary mb-1">Revenue Center</h1>
        <p className="text-muted-foreground">Full income breakdown across all 8 revenue streams.</p>
      </div>

      {/* Total + Active Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-primary/10 border-primary/30 shadow-[0_0_30px_rgba(0,243,255,0.1)] col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</span>
                </div>
                <div className="text-4xl font-mono font-bold text-primary">
                  $<CountUp value={income?.totalRevenue ?? 0} decimals={2} duration={1500} />
                </div>
              </Card>
            </motion.div>

            {[
              { label: "Active VIP Members", value: income?.activeVipMembers ?? 0, icon: Crown, color: "text-yellow-400" },
              { label: "Active Sponsors", value: income?.activeSponsors ?? 0, icon: Megaphone, color: "text-orange-400" },
              { label: "Active Boosts", value: income?.activeBoosts ?? 0, icon: Rocket, color: "text-primary" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.1 }}>
                <Card className="p-6 bg-card/40 border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                  </div>
                  <div className={`text-4xl font-mono font-bold ${stat.color}`}>
                    <CountUp value={stat.value} duration={1200} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Stream Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />)
          : STREAMS.map((stream, i) => {
              const value = income?.[stream.key] ?? 0;
              const total = income?.totalRevenue ?? 1;
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <motion.div key={stream.key} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
                  <Card className="p-5 bg-card/40 border-border/50 hover:border-border transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <stream.icon className={`w-4 h-4 ${stream.color}`} />
                        <span className="text-sm font-medium">{stream.label}</span>
                      </div>
                      <span className={`font-mono font-bold ${stream.color}`}>${value.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.06 + 0.3, duration: 0.8 }}
                        className={`h-full rounded-full bg-gradient-to-r from-current to-current ${stream.color}`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{pct}% of total</div>
                  </Card>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}
