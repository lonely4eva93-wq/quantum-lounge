import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, DollarSign, ArrowRightLeft, Star, Globe,
  Wallet, Gift, TrendingUp, Lock, ChevronRight,
  Check, AlertCircle, BookOpen, Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useListGuests } from "@workspace/api-client-react";
import { Link } from "wouter";

// ── Types ──────────────────────────────────────────────────────────────────

interface XrpAccount {
  id: number;
  guestId: number;
  xrpAddress: string;
  creditBalance: number;
  lifetimeEarned: number;
  bonusClaimed: boolean;
}

interface XrpTx {
  id: number;
  fromGuestId: number | null;
  toGuestId: number | null;
  amount: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
}

interface LeaderEntry {
  guestId: number;
  guestName: string;
  energyLevel: string;
  creditBalance: number;
  lifetimeEarned: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toFixed(4); }

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TX_COLORS: Record<string, string> = {
  bonus: "text-yellow-400",
  transfer: "text-cyan-400",
  withdrawal: "text-fuchsia-400",
  earn: "text-green-400",
};

const TX_ICONS: Record<string, React.ElementType> = {
  bonus: Gift,
  transfer: ArrowRightLeft,
  withdrawal: Wallet,
  earn: Star,
};

// ── Learn modules ──────────────────────────────────────────────────────────

const LEARN_MODULES = [
  { id: 1, title: "What is XRP?", reward: 1, desc: "Learn the basics of XRP and the XRP Ledger.", icon: "⚡" },
  { id: 2, title: "How XRPL Works", reward: 1.5, desc: "Understand how the XRP Ledger processes transactions.", icon: "🌐" },
  { id: 3, title: "XRP vs Bitcoin", reward: 1, desc: "Discover what makes XRP uniquely fast and efficient.", icon: "⚖️" },
  { id: 4, title: "Setting Up a Wallet", reward: 2, desc: "Step-by-step guide to creating your first XRPL wallet.", icon: "👛" },
  { id: 5, title: "P2P Payments on XRPL", reward: 2, desc: "Learn how to send XRP peer-to-peer in seconds.", icon: "↔️" },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function CryptoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: guests } = useListGuests();
  const activeGuests = guests?.filter((g) => g.status === "active") ?? [];

  const [guestId, setGuestId] = useState<string>("");
  const [sendTo, setSendTo] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [walletAddr, setWalletAddr] = useState<string>("");
  const [withdrawAmt, setWithdrawAmt] = useState<string>("");
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"wallet" | "send" | "earn" | "withdraw">("wallet");

  const selectedId = Number(guestId);

  const { data: account, isLoading: loadingAccount } = useQuery<XrpAccount>({
    queryKey: ["xrp-account", selectedId],
    queryFn: () => fetch(`/api/xrp/account/${selectedId}`).then((r) => r.json()),
    enabled: selectedId > 0,
    refetchInterval: 15_000,
  });

  const { data: history } = useQuery<XrpTx[]>({
    queryKey: ["xrp-history", selectedId],
    queryFn: () => fetch(`/api/xrp/history/${selectedId}`).then((r) => r.json()),
    enabled: selectedId > 0,
    refetchInterval: 15_000,
  });

  const { data: leaderboard } = useQuery<LeaderEntry[]>({
    queryKey: ["xrp-leaderboard"],
    queryFn: async () => {
      const r = await fetch("/api/xrp/leaderboard");
      const d = await r.json();
      return Array.isArray(d) ? d : [];
    },
    refetchInterval: 30_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["xrp-account", selectedId] });
    queryClient.invalidateQueries({ queryKey: ["xrp-history", selectedId] });
    queryClient.invalidateQueries({ queryKey: ["xrp-leaderboard"] });
  };

  const claimBonus = useMutation({
    mutationFn: () => fetch("/api/xrp/claim-bonus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: selectedId }) }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: (d) => { invalidate(); toast({ title: "🎉 XRP Bonus Claimed!", description: `${d.bonus} XRP credits added to your account.` }); },
    onError: (e: Error) => toast({ title: "Claim Failed", description: e.message, variant: "destructive" }),
  });

  const transfer = useMutation({
    mutationFn: () => fetch("/api/xrp/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromGuestId: selectedId, toGuestId: Number(sendTo), amount: Number(sendAmount) }) }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: (d) => { invalidate(); setSendTo(""); setSendAmount(""); toast({ title: "Transfer Complete", description: `Sent ${d.net} XRP (fee: ${d.fee} XRP)` }); },
    onError: (e: Error) => toast({ title: "Transfer Failed", description: e.message, variant: "destructive" }),
  });

  const setAddress = useMutation({
    mutationFn: () => fetch("/api/xrp/set-address", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: selectedId, xrpAddress: walletAddr }) }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: () => { invalidate(); toast({ title: "Wallet Linked", description: "Your XRPL address has been saved." }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const withdraw = useMutation({
    mutationFn: () => fetch("/api/xrp/withdraw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: selectedId, amount: Number(withdrawAmt) }) }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; }),
    onSuccess: (d) => { invalidate(); setWithdrawAmt(""); toast({ title: "Withdrawal Queued", description: d.message }); },
    onError: (e: Error) => toast({ title: "Withdrawal Failed", description: e.message, variant: "destructive" }),
  });

  const earnModule = (moduleId: number, reward: number) => {
    if (completedModules.has(moduleId) || !selectedId) return;
    fetch("/api/xrp/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromGuestId: null, toGuestId: selectedId, amount: reward, type: "earn" }) });
    setCompletedModules((prev) => new Set(prev).add(moduleId));
    fetch("/api/xrp/claim-bonus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId: selectedId, _override: { amount: reward, description: `Learn-to-earn: module ${moduleId}` } }) });
    toast({ title: "🎓 XRP Earned!", description: `+${reward} XRP credits for completing the module.` });
    invalidate();
  };

  const TABS = [
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "send", label: "Send", icon: ArrowRightLeft },
    { id: "earn", label: "Learn & Earn", icon: BookOpen },
    { id: "withdraw", label: "Withdraw", icon: TrendingUp },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <h1 className="text-2xl font-display tracking-widest text-foreground uppercase">XRP Hub</h1>
            <p className="text-xs text-muted-foreground">Earn · Send · Learn · Withdraw real XRP</p>
          </div>
          <div className="ml-auto">
            <Link href="/pitch">
              <button className="text-xs font-mono text-cyan-400/70 hover:text-cyan-400 border border-cyan-400/20 hover:border-cyan-400/40 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> XRP Pitch
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Guest selector */}
      <Card className="p-5 border-border/50 bg-card/30">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2 block">Select Your Guest Profile</label>
        <select
          value={guestId}
          onChange={(e) => setGuestId(e.target.value)}
          className="w-full bg-black/50 border border-primary/30 focus:border-primary text-white font-mono text-sm rounded-md px-3 py-2 outline-none"
        >
          <option value="">— Choose guest —</option>
          {activeGuests.map((g) => (
            <option key={g.id} value={g.id}>{g.name} ({g.energyLevel})</option>
          ))}
        </select>
        {selectedId > 0 && loadingAccount && (
          <div className="mt-3 h-5 w-32 bg-white/5 rounded animate-pulse" />
        )}
        {account && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-bold text-cyan-400">{fmt(account.creditBalance)} <span className="text-lg text-cyan-400/60">XRP</span></div>
              <div className="text-xs text-muted-foreground">Lifetime earned: {fmt(account.lifetimeEarned)} XRP</div>
            </div>
            {!account.bonusClaimed && (
              <button
                onClick={() => claimBonus.mutate()}
                disabled={claimBonus.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-mono hover:bg-yellow-400/20 transition-colors"
              >
                <Gift className="w-4 h-4" />
                {claimBonus.isPending ? "Claiming..." : "Claim 5 XRP Bonus!"}
              </button>
            )}
            {account.bonusClaimed && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="w-3.5 h-3.5 text-green-400" /> Bonus claimed
              </div>
            )}
          </motion.div>
        )}
      </Card>

      {/* Tabs */}
      {selectedId > 0 && (
        <div>
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${activeTab === tab.id ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <motion.div key="wallet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <Card className="p-5 border-border/50 bg-card/30 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> XRPL Wallet Address</div>
                  <div className="flex gap-2">
                    <Input
                      value={walletAddr}
                      onChange={(e) => setWalletAddr(e.target.value)}
                      placeholder={account?.xrpAddress || "r... (your XRP Ledger address)"}
                      className="bg-black/50 border-primary/30 text-white font-mono text-xs"
                    />
                    <Button onClick={() => setAddress.mutate()} disabled={!walletAddr || setAddress.isPending} className="bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 font-mono text-xs px-4">
                      {setAddress.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  {account?.xrpAddress && (
                    <div className="text-xs font-mono text-green-400/70 flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> Linked: {account.xrpAddress}
                    </div>
                  )}
                  {!account?.xrpAddress && (
                    <div className="text-xs text-muted-foreground/50 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-yellow-400/50 flex-shrink-0" />
                      Link your XRPL wallet address to enable real XRP withdrawals when Phase 2 launches.
                    </div>
                  )}
                </Card>

                {/* Transaction history */}
                <Card className="border-border/50 bg-card/30">
                  <div className="px-5 pt-4 pb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">Transaction History</div>
                  <div className="divide-y divide-border/30 max-h-72 overflow-y-auto">
                    {history?.length === 0 && <div className="px-5 py-6 text-center text-muted-foreground text-sm">No transactions yet</div>}
                    {history?.map((tx) => {
                      const isIncoming = tx.toGuestId === selectedId;
                      const Icon = TX_ICONS[tx.type] ?? ArrowRightLeft;
                      const color = TX_COLORS[tx.type] ?? "text-muted-foreground";
                      return (
                        <div key={tx.id} className="flex items-center gap-3 px-5 py-3 text-xs">
                          <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-foreground/80 truncate">{tx.description}</div>
                            <div className="text-muted-foreground/40">{timeAgo(tx.createdAt)}</div>
                          </div>
                          <div className={`font-bold flex-shrink-0 ${isIncoming ? "text-green-400" : "text-red-400"}`}>
                            {isIncoming ? "+" : "-"}{fmt(tx.amount)} XRP
                          </div>
                          <div className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${tx.status === "pending" ? "text-yellow-400 border-yellow-400/20" : "text-green-400 border-green-400/20"}`}>
                            {tx.status}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Send Tab */}
            {activeTab === "send" && (
              <motion.div key="send" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="p-6 border-border/50 bg-card/30 space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Peer-to-Peer XRP Transfer
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Send To (Guest)</label>
                      <select
                        value={sendTo}
                        onChange={(e) => setSendTo(e.target.value)}
                        className="w-full bg-black/50 border border-primary/30 text-white font-mono text-sm rounded-md px-3 py-2 outline-none"
                      >
                        <option value="">— Select recipient —</option>
                        {activeGuests.filter((g) => g.id !== selectedId).map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Amount (XRP Credits)</label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-black/50 border-primary/30 text-white font-mono"
                      />
                      {sendAmount && (
                        <div className="text-xs text-muted-foreground/50 mt-1">
                          Platform fee (5%): {(Number(sendAmount) * 0.05).toFixed(4)} XRP · Recipient gets: {(Number(sendAmount) * 0.95).toFixed(4)} XRP
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => transfer.mutate()}
                      disabled={!sendTo || !sendAmount || transfer.isPending || Number(sendAmount) <= 0}
                      className="w-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/20 font-mono uppercase tracking-widest"
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      {transfer.isPending ? "Sending..." : "Send XRP Credits"}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground/40 border-t border-border/30 pt-3">
                    All P2P transfers are subject to a 5% platform fee per the Quantum Lounge Smart Contract (SC-004). Transfers are instant and non-reversible.
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Learn & Earn Tab */}
            {activeTab === "earn" && (
              <motion.div key="earn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="text-xs text-muted-foreground/60 mb-1">Complete modules to earn XRP credits. Knowledge is value.</div>
                {LEARN_MODULES.map((mod) => {
                  const done = completedModules.has(mod.id);
                  return (
                    <Card key={mod.id} className={`p-4 border transition-all ${done ? "border-green-400/20 bg-green-400/5" : "border-border/50 bg-card/30 hover:border-cyan-400/30"}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{mod.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground">{mod.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{mod.desc}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-cyan-400 font-bold text-sm">+{mod.reward} XRP</div>
                          {done ? (
                            <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                              <Check className="w-3 h-3" /> Done
                            </div>
                          ) : (
                            <button
                              onClick={() => earnModule(mod.id, mod.reward)}
                              className="mt-1 text-xs font-mono text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded hover:bg-cyan-400/10 transition-colors flex items-center gap-1"
                            >
                              Start <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </motion.div>
            )}

            {/* Withdraw Tab */}
            {activeTab === "withdraw" && (
              <motion.div key="withdraw" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="p-6 border-border/50 bg-card/30 space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Withdraw Real XRP
                  </div>
                  {!account?.xrpAddress ? (
                    <div className="text-center py-6 space-y-3">
                      <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto" />
                      <div className="text-sm text-muted-foreground">Link your XRPL wallet address first on the Wallet tab before withdrawing.</div>
                      <button onClick={() => setActiveTab("wallet")} className="text-xs font-mono text-cyan-400 border border-cyan-400/20 px-3 py-1.5 rounded hover:bg-cyan-400/10 transition-colors">
                        Go to Wallet Tab →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20 text-xs text-cyan-400/80">
                        Withdrawing to: <span className="font-mono font-bold">{account.xrpAddress}</span>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Amount to Withdraw</label>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={withdrawAmt}
                          onChange={(e) => setWithdrawAmt(e.target.value)}
                          placeholder="0.00"
                          className="bg-black/50 border-primary/30 text-white font-mono"
                        />
                        <div className="text-xs text-muted-foreground/50 mt-1">Available: {fmt(account.creditBalance)} XRP credits</div>
                      </div>
                      <Button
                        onClick={() => withdraw.mutate()}
                        disabled={!withdrawAmt || withdraw.isPending || Number(withdrawAmt) <= 0}
                        className="w-full bg-fuchsia-400/10 text-fuchsia-400 border border-fuchsia-400/30 hover:bg-fuchsia-400/20 font-mono uppercase tracking-widest"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        {withdraw.isPending ? "Processing..." : "Request Withdrawal"}
                      </Button>
                      <div className="text-xs text-muted-foreground/40 border-t border-border/30 pt-3">
                        Phase 1: Withdrawals are queued and processed manually. Phase 2 (coming soon) will enable instant on-chain XRPL settlement directly to your wallet.
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* XRP Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <h2 className="text-xs font-display tracking-widest text-muted-foreground uppercase">XRP Leaderboard</h2>
        </div>
        <Card className="border-border/50 bg-card/30 divide-y divide-border/30">
          {leaderboard?.length === 0 && <div className="py-8 text-center text-muted-foreground text-sm">No XRP accounts yet</div>}
          {leaderboard?.map((entry, i) => (
            <div key={entry.guestId} className="flex items-center gap-3 px-4 py-3">
              <div className="w-6 text-center text-sm">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-xs text-muted-foreground">#{i + 1}</span>}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{entry.guestName}</div>
                <div className="text-xs text-muted-foreground">{entry.energyLevel} · lifetime {fmt(entry.lifetimeEarned)} XRP</div>
              </div>
              <div className="text-cyan-400 font-bold text-sm">{fmt(entry.creditBalance)} XRP</div>
            </div>
          ))}
          {!leaderboard && (
            <div className="divide-y divide-border/30">
              {[...Array(3)].map((_, i) => <div key={i} className="flex items-center gap-3 px-4 py-3"><div className="flex-1 h-5 bg-white/5 rounded animate-pulse" /></div>)}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
