import { useListReferralCodes, useCreateReferralCode, useApplyReferralCode, getListReferralCodesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Share2, Tag, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReferralsPage() {
  const { data: codes, isLoading } = useListReferralCodes({ query: { queryKey: getListReferralCodesQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [ownerName, setOwnerName] = useState("");
  const [applyCode, setApplyCode] = useState("");
  const [applyName, setApplyName] = useState("");
  const [appliedResult, setAppliedResult] = useState<any>(null);

  const createCode = useCreateReferralCode({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReferralCodesQueryKey() });
        toast({ title: "Code Created", description: "Your referral code is ready to share." });
        setOwnerName("");
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    },
  });

  const applyMutation = useApplyReferralCode({
    mutation: {
      onSuccess: (data) => {
        setAppliedResult(data);
        queryClient.invalidateQueries({ queryKey: getListReferralCodesQueryKey() });
        toast({ title: "Code Applied", description: data.message });
      },
      onError: (err: any) => toast({ title: "Invalid Code", description: err.message || "Code not found.", variant: "destructive" }),
    },
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold tracking-widest uppercase glow-text-primary mb-2">Referral Codes</h1>
        <p className="text-muted-foreground">Create a code for friends. They get a discount, you earn a reward.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-card/40 border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-primary" />
              <h2 className="font-bold uppercase tracking-wider">Create Code</h2>
            </div>
            <Input placeholder="Your name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="bg-background/50 border-border/50" />
            <Button
              onClick={() => createCode.mutate({ data: { ownerGuestName: ownerName.trim(), discountAmount: 2, rewardAmount: 1 } })}
              disabled={createCode.isPending || !ownerName.trim()}
              className="w-full bg-primary text-black font-bold uppercase tracking-wider"
            >
              {createCode.isPending ? "Creating..." : "Generate Code"}
            </Button>
            <p className="text-xs text-muted-foreground">Friends get $2.00 off. You earn $1.00 per use.</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-6 bg-card/40 border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-secondary" />
              <h2 className="font-bold uppercase tracking-wider">Apply Code</h2>
            </div>
            <Input placeholder="Referral code (e.g. ALEX-AB12CD)" value={applyCode} onChange={(e) => setApplyCode(e.target.value.toUpperCase())} className="bg-background/50 border-border/50 font-mono" />
            <Input placeholder="Your name" value={applyName} onChange={(e) => setApplyName(e.target.value)} className="bg-background/50 border-border/50" />
            <Button
              onClick={() => applyMutation.mutate({ data: { code: applyCode.trim(), guestName: applyName.trim() } })}
              disabled={applyMutation.isPending || !applyCode.trim() || !applyName.trim()}
              variant="outline"
              className="w-full border-secondary/50 text-secondary hover:bg-secondary/10"
            >
              {applyMutation.isPending ? "Applying..." : "Apply Code"}
            </Button>
            {appliedResult && (
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 rounded p-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {appliedResult.message}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <div>
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4">Active Codes</h2>
        {isLoading ? (
          <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg bg-white/5" />)}</div>
        ) : (codes ?? []).length === 0 ? (
          <Card className="p-6 bg-card/20 border-border/30 text-center text-muted-foreground">No codes yet. Create the first one.</Card>
        ) : (
          <div className="space-y-3">
            {(codes ?? []).filter(c => c.isActive).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 bg-card/40 border-border/50 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-primary">{c.code}</div>
                    <div className="text-xs text-muted-foreground">by {c.ownerGuestName} · {c.usesCount} uses{c.maxUses ? ` / ${c.maxUses}` : ""}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-green-400">-${c.discountAmount.toFixed(2)} discount</div>
                    <div className="text-muted-foreground">+${c.rewardAmount.toFixed(2)} reward</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
