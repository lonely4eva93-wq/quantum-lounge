import { useListLeaderboardBoosts, useCreateLeaderboardBoost, getListLeaderboardBoostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Rocket, Clock, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BOOST_OPTIONS = [
  { label: "1 Hour", hours: 1, price: 4.99 },
  { label: "6 Hours", hours: 6, price: 29.94 },
  { label: "24 Hours", hours: 24, price: 119.76 },
];

export default function BoostPage() {
  const { data: boosts, isLoading } = useListLeaderboardBoosts({ query: { queryKey: getListLeaderboardBoostsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [guestName, setGuestName] = useState("");
  const [selectedHours, setSelectedHours] = useState(1);

  const createBoost = useCreateLeaderboardBoost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeaderboardBoostsQueryKey() });
        toast({ title: "Boost Activated", description: "Your leaderboard position has been amplified." });
        setGuestName("");
      },
      onError: (err: any) => {
        toast({ title: "Boost Failed", description: err.message || "Could not activate boost.", variant: "destructive" });
      },
    },
  });

  const handleBoost = () => {
    if (!guestName.trim()) return;
    createBoost.mutate({ data: { guestName: guestName.trim(), durationHours: selectedHours } });
  };

  const activeBoosts = (boosts ?? []).filter((b) => b.isActive && new Date(b.expiresAt) > new Date());

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold tracking-widest uppercase glow-text-primary mb-2">Leaderboard Boost</h1>
        <p className="text-muted-foreground">Amplify your position on the quantum leaderboard for a limited time.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 bg-card/40 border-border/50 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Activate Boost</h2>
          </div>

          <Input
            placeholder="Your name in the lounge"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="bg-background/50 border-border/50"
          />

          <div className="grid grid-cols-3 gap-3">
            {BOOST_OPTIONS.map((opt) => (
              <button
                key={opt.hours}
                onClick={() => setSelectedHours(opt.hours)}
                className={`rounded-lg p-4 border text-center transition-all duration-300 ${
                  selectedHours === opt.hours
                    ? "border-primary bg-primary/15 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                    : "border-border/50 bg-card/30 hover:border-primary/40"
                }`}
              >
                <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
                <div className="font-bold text-sm">{opt.label}</div>
                <div className="text-primary font-mono text-lg">${opt.price.toFixed(2)}</div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleBoost}
            disabled={createBoost.isPending || !guestName.trim()}
            className="w-full bg-primary text-black font-bold uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-all"
          >
            {createBoost.isPending ? "Activating..." : "Activate Boost"}
          </Button>
        </Card>
      </motion.div>

      <div>
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> Active Boosts
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />)}
          </div>
        ) : activeBoosts.length === 0 ? (
          <Card className="p-6 bg-card/20 border-border/30 text-center text-muted-foreground">No active boosts</Card>
        ) : (
          <div className="space-y-3">
            {activeBoosts.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 bg-card/40 border-primary/30 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{b.guestName}</div>
                    <div className="text-xs text-muted-foreground">
                      Expires {new Date(b.expiresAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-primary font-mono font-bold">${b.price.toFixed(2)}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
