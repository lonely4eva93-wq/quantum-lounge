import { useListTips, getListTipsQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Home } from "lucide-react";

export default function OwnerTipsPage() {
  const { data: tips, isLoading } = useListTips({ query: { queryKey: getListTipsQueryKey() } });

  const totalHouseCut = (tips ?? []).reduce((s, t) => s + t.houseCut, 0);
  const houseDirectTips = (tips ?? []).filter(t => t.toHouse);
  const guestTips = (tips ?? []).filter(t => !t.toHouse);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-widest uppercase glow-text-primary mb-1">Tip Log</h1>
        <p className="text-muted-foreground">House cut earned: <span className="text-primary font-mono">${totalHouseCut.toFixed(2)}</span> · {(tips ?? []).length} tips total</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Tips", value: (tips ?? []).length, color: "text-foreground" },
          { label: "House Direct Tips", value: houseDirectTips.length, color: "text-primary" },
          { label: "House Cut Earned", value: `$${totalHouseCut.toFixed(2)}`, color: "text-green-400" },
        ].map((stat, i) => (
          <Card key={stat.label} className="p-5 bg-card/40 border-border/50">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{stat.label}</div>
            <div className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="font-bold uppercase tracking-wider text-sm text-muted-foreground">All Tips</h2>
        {isLoading
          ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)
          : (tips ?? []).length === 0
          ? <Card className="p-8 bg-card/20 border-border/30 text-center text-muted-foreground">No tips yet.</Card>
          : [...(tips ?? [])].reverse().map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 bg-card/40 border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {t.toHouse ? <Home className="w-4 h-4 text-primary" /> : <Heart className="w-4 h-4 text-pink-400" />}
                  <div>
                    <div className="text-sm font-medium">
                      {t.fromGuestName} → {t.toHouse ? "House" : t.toGuestName}
                    </div>
                    {t.message && <div className="text-xs text-muted-foreground">"{t.message}"</div>}
                    <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold">${t.amount.toFixed(2)}</div>
                  <div className="text-xs text-green-400">+${t.houseCut.toFixed(2)} house</div>
                </div>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
