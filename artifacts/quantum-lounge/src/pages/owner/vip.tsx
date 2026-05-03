import { useListVipMemberships, useCreateVipMembership, useUpdateVipMembership, useCancelVipMembership, getListVipMembershipsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Plus, X } from "lucide-react";

const TIERS = ["silver", "gold", "cosmic"] as const;
const TIER_PRICES: Record<string, number> = { silver: 9.99, gold: 19.99, cosmic: 29.99 };
const TIER_COLORS: Record<string, string> = { silver: "text-slate-400", gold: "text-yellow-400", cosmic: "text-purple-400" };

export default function OwnerVipPage() {
  const { data: memberships, isLoading } = useListVipMemberships({ query: { queryKey: getListVipMembershipsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<"silver" | "gold" | "cosmic">("silver");

  const createMembership = useCreateVipMembership({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVipMembershipsQueryKey() });
        toast({ title: "Membership Created", description: `${name} enrolled as ${tier} VIP.` });
        setName(""); setEmail(""); setTier("silver"); setShowForm(false);
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    },
  });

  const cancelMembership = useCancelVipMembership({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVipMembershipsQueryKey() });
        toast({ title: "Membership Cancelled" });
      },
    },
  });

  const activeCount = (memberships ?? []).filter(m => m.status === "active").length;
  const monthlyRevenue = (memberships ?? [])
    .filter(m => m.status === "active")
    .reduce((s, m) => s + m.pricePerMonth, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-widest uppercase glow-text-primary mb-1">VIP Management</h1>
          <p className="text-muted-foreground">{activeCount} active · ${monthlyRevenue.toFixed(2)}/mo</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-black font-bold uppercase tracking-wider gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-card/40 border-primary/30 space-y-4">
            <h2 className="font-bold uppercase tracking-wider flex items-center gap-2"><Crown className="w-4 h-4 text-primary" /> New VIP Member</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Guest name" value={name} onChange={e => setName(e.target.value)} className="bg-background/50 border-border/50" />
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-background/50 border-border/50" />
            </div>
            <div className="flex gap-3">
              {TIERS.map(t => (
                <button key={t} onClick={() => setTier(t)}
                  className={`flex-1 rounded-lg p-3 border text-center transition-all capitalize font-bold ${tier === t ? "border-primary bg-primary/15" : "border-border/50 bg-card/30 hover:border-primary/40"}`}>
                  <div className={TIER_COLORS[t]}>{t}</div>
                  <div className="text-xs text-muted-foreground">${TIER_PRICES[t]}/mo</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createMembership.mutate({ data: { guestName: name.trim(), email: email.trim(), tier } })}
                disabled={createMembership.isPending || !name.trim() || !email.trim()}
                className="flex-1 bg-primary text-black font-bold uppercase tracking-wider">
                {createMembership.isPending ? "Creating..." : "Create Membership"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)
          : (memberships ?? []).length === 0
          ? <Card className="p-8 bg-card/20 border-border/30 text-center text-muted-foreground">No VIP members yet.</Card>
          : (memberships ?? []).map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-4 bg-card/40 border-border/50 flex items-center justify-between ${m.status !== "active" ? "opacity-50" : ""}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className={`w-4 h-4 ${TIER_COLORS[m.tier]}`} />
                    <span className="font-bold">{m.guestName}</span>
                    <span className={`text-xs capitalize font-mono ${TIER_COLORS[m.tier]}`}>{m.tier}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-green-400/15 text-green-400" : "bg-red-400/15 text-red-400"}`}>{m.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{m.email} · ${m.pricePerMonth}/mo · {m.perks}</div>
                </div>
                {m.status === "active" && (
                  <Button variant="ghost" size="sm" onClick={() => cancelMembership.mutate({ id: m.id })} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
