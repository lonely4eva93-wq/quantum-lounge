import { useListReferralCodes, useCreateReferralCode, getListReferralCodesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Share2, Plus, X, Copy } from "lucide-react";

export default function OwnerReferralsPage() {
  const { data: codes, isLoading } = useListReferralCodes({ query: { queryKey: getListReferralCodesQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [discount, setDiscount] = useState(2);
  const [reward, setReward] = useState(1);
  const [maxUses, setMaxUses] = useState("");

  const createCode = useCreateReferralCode({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReferralCodesQueryKey() });
        toast({ title: "Code Created" });
        setOwnerName(""); setDiscount(2); setReward(1); setMaxUses(""); setShowForm(false);
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    },
  });

  const totalUses = (codes ?? []).reduce((s, c) => s + c.usesCount, 0);
  const activeCodes = (codes ?? []).filter(c => c.isActive).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-widest uppercase glow-text-primary mb-1">Referral Codes</h1>
          <p className="text-muted-foreground">{activeCodes} active codes · {totalUses} total uses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-black font-bold uppercase tracking-wider gap-2">
          <Plus className="w-4 h-4" /> Create Code
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-card/40 border-primary/30 space-y-4">
            <h2 className="font-bold uppercase tracking-wider flex items-center gap-2"><Share2 className="w-4 h-4 text-primary" /> New Referral Code</h2>
            <Input placeholder="Owner/guest name" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="bg-background/50 border-border/50" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Discount ($)</label>
                <Input type="number" step="0.50" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="bg-background/50 border-border/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reward ($)</label>
                <Input type="number" step="0.50" value={reward} onChange={e => setReward(Number(e.target.value))} className="bg-background/50 border-border/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max Uses (blank = unlimited)</label>
                <Input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="unlimited" className="bg-background/50 border-border/50" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createCode.mutate({ data: { ownerGuestName: ownerName.trim(), discountAmount: discount, rewardAmount: reward, maxUses: maxUses ? Number(maxUses) : null } })}
                disabled={createCode.isPending || !ownerName.trim()}
                className="flex-1 bg-primary text-black font-bold uppercase tracking-wider">
                {createCode.isPending ? "Creating..." : "Generate Code"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)
          : (codes ?? []).length === 0
          ? <Card className="p-8 bg-card/20 border-border/30 text-center text-muted-foreground">No codes yet.</Card>
          : (codes ?? []).map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-4 bg-card/40 border-border/50 flex items-center justify-between ${!c.isActive ? "opacity-50" : ""}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary text-lg">{c.code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast({ title: "Copied" }); }}
                      className="text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-400/15 text-green-400" : "bg-red-400/15 text-red-400"}`}>
                      {c.isActive ? "active" : "inactive"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.ownerGuestName} · {c.usesCount}{c.maxUses ? `/${c.maxUses}` : ""} uses · -${c.discountAmount} discount · +${c.rewardAmount} reward
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
