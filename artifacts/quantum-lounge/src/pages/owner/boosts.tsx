import { useListLeaderboardBoosts, useDeleteLeaderboardBoost, getListLeaderboardBoostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Rocket, X, Clock } from "lucide-react";

export default function OwnerBoostsPage() {
  const { data: boosts, isLoading } = useListLeaderboardBoosts({ query: { queryKey: getListLeaderboardBoostsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deactivateBoost = useDeleteLeaderboardBoost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeaderboardBoostsQueryKey() });
        toast({ title: "Boost Deactivated" });
      },
    },
  });

  const now = new Date();
  const activeBoosts = (boosts ?? []).filter(b => b.isActive && new Date(b.expiresAt) > now);
  const expiredBoosts = (boosts ?? []).filter(b => !b.isActive || new Date(b.expiresAt) <= now);
  const totalRevenue = (boosts ?? []).reduce((s, b) => s + b.price, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-widest uppercase glow-text-primary mb-1">Leaderboard Boosts</h1>
        <p className="text-muted-foreground">{activeBoosts.length} active · ${totalRevenue.toFixed(2)} total revenue</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Boosts", value: activeBoosts.length, color: "text-primary" },
          { label: "Total Boosts Sold", value: (boosts ?? []).length, color: "text-foreground" },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-green-400" },
        ].map(stat => (
          <Card key={stat.label} className="p-5 bg-card/40 border-border/50">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{stat.label}</div>
            <div className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" /> Active
        </h2>
        {isLoading
          ? [1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)
          : activeBoosts.length === 0
          ? <Card className="p-6 bg-card/20 border-border/30 text-center text-muted-foreground">No active boosts.</Card>
          : activeBoosts.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 bg-card/40 border-primary/30 flex items-center justify-between shadow-[0_0_15px_rgba(0,243,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-primary" />
                    <span className="font-bold">{b.guestName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> Expires {new Date(b.expiresAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary">${b.price.toFixed(2)}</span>
                  <Button variant="ghost" size="sm" onClick={() => deactivateBoost.mutate({ id: b.id })} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

        {expiredBoosts.length > 0 && (
          <>
            <h2 className="font-bold uppercase tracking-wider text-sm text-muted-foreground mt-4">Expired / Inactive</h2>
            {expiredBoosts.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-4 bg-card/20 border-border/30 flex items-center justify-between opacity-50">
                  <div>
                    <span className="font-medium">{b.guestName}</span>
                    <div className="text-xs text-muted-foreground">{new Date(b.expiresAt).toLocaleString()}</div>
                  </div>
                  <span className="font-mono text-muted-foreground">${b.price.toFixed(2)}</span>
                </Card>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
