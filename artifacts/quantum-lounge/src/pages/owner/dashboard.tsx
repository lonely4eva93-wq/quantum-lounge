import { useGetStats, useRequestCashout, useGetIncomeSummary, getGetStatsQueryKey, getListTransactionsQueryKey, getGetIncomeSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRightLeft, Users, Grid, Zap, Banknote, Crown, Calendar, Heart, Eye, Megaphone, Lock, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CountUp } from "@/components/count-up";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const INCOME_STREAMS = [
  { key: "vipRevenue" as const, label: "VIP", icon: Crown, color: "text-yellow-400" },
  { key: "rentalRevenue" as const, label: "Rentals", icon: Calendar, color: "text-blue-400" },
  { key: "tipRevenue" as const, label: "Tips", icon: Heart, color: "text-pink-400" },
  { key: "oracleRevenue" as const, label: "Oracle", icon: Eye, color: "text-purple-400" },
  { key: "sponsorRevenue" as const, label: "Sponsors", icon: Megaphone, color: "text-orange-400" },
  { key: "premiumMessageRevenue" as const, label: "DM", icon: Lock, color: "text-cyan-400" },
  { key: "boostRevenue" as const, label: "Boosts", icon: Rocket, color: "text-primary" },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats();
  const { data: income } = useGetIncomeSummary({ query: { queryKey: getGetIncomeSummaryQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [cashoutAmount, setCashoutAmount] = useState("");

  const cashout = useRequestCashout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        toast({
          title: "Funds Transferred",
          description: "Cashout request processed successfully.",
        });
        setCashoutAmount("");
      },
      onError: (err: any) => {
        toast({
          title: "Transfer Failed",
          description: err.message || "Insufficient funds or system error.",
          variant: "destructive",
        });
      }
    }
  });

  const handleCashout = () => {
    const amount = Number(cashoutAmount);
    if (!amount || amount <= 0) return;
    cashout.mutate({ data: { amount } });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 bg-card/40 border-border/50">
              <Skeleton className="h-4 w-32 mb-3 bg-white/5 rounded" />
              <Skeleton className="h-10 w-40 bg-white/5 rounded" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-6 bg-card/40 border-border/50 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg bg-white/5" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-12 bg-white/5 rounded" />
                <Skeleton className="h-3 w-24 bg-white/5 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Active Entities", value: stats?.activeGuests || 0, icon: Users, color: "text-primary" },
    { label: "Open Vectors", value: stats?.openRooms || 0, icon: Grid, color: "text-secondary" },
    { label: "Total Jumps", value: stats?.totalTeleports || 0, icon: ArrowRightLeft, color: "text-accent" },
    { label: "Transmissions", value: stats?.totalMessages || 0, icon: Zap, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2">
            Central Node
          </h1>
          <p className="text-muted-foreground font-mono">System overview and revenue control.</p>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-primary/5 border-primary/20 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <h3 className="text-sm font-mono text-primary/70 uppercase tracking-widest mb-2">Available Balance</h3>
            <div className="text-4xl font-display font-bold text-white tracking-widest">
              ¤<CountUp value={stats?.availableBalance || 0} decimals={2} duration={1000} />
            </div>
            
            <div className="mt-6 flex gap-2">
              <Input
                type="number"
                placeholder="Amount..."
                value={cashoutAmount}
                onChange={(e) => setCashoutAmount(e.target.value)}
                className="bg-black/50 border-primary/30 text-white font-mono"
              />
              <Button
                onClick={handleCashout}
                disabled={cashout.isPending || !cashoutAmount || Number(cashoutAmount) <= 0 || Number(cashoutAmount) > (stats?.availableBalance || 0)}
                className="bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black uppercase font-display tracking-widest"
              >
                Withdraw
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/40 border-border/50 backdrop-blur-md">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">Total Revenue</h3>
          <div className="text-3xl font-display font-bold text-white/90 tracking-widest">
            ¤<CountUp value={stats?.totalRevenue || 0} decimals={2} duration={1000} />
          </div>
        </Card>

        <Card className="p-6 bg-card/40 border-border/50 backdrop-blur-md">
          <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-2">Total Extracted</h3>
          <div className="text-3xl font-display font-bold text-white/90 tracking-widest">
            ¤<CountUp value={stats?.totalCashedOut || 0} decimals={2} duration={1000} />
          </div>
        </Card>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 bg-card/40 border-border/50 backdrop-blur-md flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-black/50 border border-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-display">
                  <CountUp value={stat.value} duration={900} />
                </div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Streams Mini-Grid */}
      {income && (
        <Card className="p-6 bg-card/40 border-border/50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Revenue Streams
            </h2>
            <Link href="/owner/revenue">
              <span className="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer uppercase tracking-wider">Full Breakdown →</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {INCOME_STREAMS.map((s) => (
              <div key={s.key} className="bg-black/30 rounded-lg p-3 text-center border border-white/5">
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <div className={`font-mono font-bold text-sm ${s.color}`}>${(income[s.key] ?? 0).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="p-6 bg-card/40 border-border/50 backdrop-blur-md">
        <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
          <Banknote className="w-5 h-5 text-primary" /> Recent Ledger Activity
        </h2>

        <div className="space-y-2">
          {stats?.recentTransactions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-mono text-sm">
              No recent activity recorded.
            </div>
          ) : (
            stats?.recentTransactions?.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/5">
                <div>
                  <div className="font-bold text-white mb-1">
                    {tx.type === "house_fee" ? "House Fee Entry" :
                     tx.type === "cashout" ? "Fund Extraction" :
                     "Energy Modification"}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {tx.description} {tx.guestName ? `(${tx.guestName})` : ''}
                  </div>
                </div>
                <div className={`text-lg font-mono font-bold ${tx.type === 'cashout' ? 'text-destructive' : 'text-primary'}`}>
                  {tx.type === 'cashout' ? '-' : '+'}¤{tx.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
