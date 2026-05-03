import { useListVipMemberships, useCreateVipMembership, getListVipMembershipsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Crown, Sparkles, Star, Check, Zap, Lock, Shield, Rocket, Eye, Radio, MessageSquare } from "lucide-react";
import { GlitchText } from "@/components/glitch-text";

const TIERS = [
  {
    id: "silver",
    name: "Silver",
    price: 9.99,
    priceLabel: "$9.99/mo",
    gradient: "from-slate-400 via-slate-300 to-slate-500",
    glowColor: "rgba(148,163,184,0.3)",
    borderColor: "border-slate-400/40",
    bgColor: "bg-slate-400/10",
    textColor: "text-slate-300",
    icon: Star,
    badge: "⭐",
    description: "Access the quantum frequency. Begin your ascent.",
    perks: [
      { icon: Shield, text: "Priority check-in queue" },
      { icon: Radio, text: "Exclusive Silver frequency rooms" },
      { icon: Zap, text: "2× XRP earning multiplier" },
      { icon: MessageSquare, text: "Unlimited quantum messages" },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 19.99,
    priceLabel: "$19.99/mo",
    gradient: "from-yellow-400 via-amber-300 to-yellow-600",
    glowColor: "rgba(251,191,36,0.35)",
    borderColor: "border-yellow-400/50",
    bgColor: "bg-yellow-400/10",
    textColor: "text-yellow-400",
    icon: Crown,
    badge: "👑",
    featured: true,
    description: "Golden aura. VIP rooms. Monthly boost included.",
    perks: [
      { icon: Shield, text: "All Silver perks included" },
      { icon: Crown, text: "Golden aura particle effects" },
      { icon: Radio, text: "Private Gold VIP room access" },
      { icon: Rocket, text: "1× free leaderboard boost/month" },
      { icon: Eye, text: "Oracle readings at 25% off" },
      { icon: Zap, text: "5× XRP earning multiplier" },
    ],
  },
  {
    id: "cosmic",
    name: "Cosmic",
    price: 49.99,
    priceLabel: "$49.99/mo",
    gradient: "from-cyan-400 via-fuchsia-400 to-cyan-400",
    glowColor: "rgba(0,243,255,0.3)",
    borderColor: "border-primary/50",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    icon: Sparkles,
    badge: "🌌",
    description: "Transcend the ordinary. Become a cosmic entity.",
    perks: [
      { icon: Shield, text: "All Gold perks included" },
      { icon: Sparkles, text: "Cosmic particle visual effects" },
      { icon: Radio, text: "Private room creation rights" },
      { icon: Lock, text: "Unlimited premium encrypted DMs" },
      { icon: Eye, text: "Unlimited free oracle readings" },
      { icon: Zap, text: "10× XRP earning multiplier" },
    ],
  },
];

const COMPARISON = [
  { feature: "XRP Multiplier", silver: "2×", gold: "5×", cosmic: "10×" },
  { feature: "Exclusive Rooms", silver: "Silver only", gold: "Silver + Gold", cosmic: "All + Private" },
  { feature: "Leaderboard Boosts", silver: "Purchase only", gold: "1 free/month", cosmic: "Unlimited" },
  { feature: "Oracle Readings", silver: "Full price", gold: "25% off", cosmic: "Free" },
  { feature: "Premium DMs", silver: "Purchase only", gold: "Purchase only", cosmic: "Unlimited" },
  { feature: "Priority Queue", silver: "✓", gold: "✓", cosmic: "✓" },
];

export default function VipMembershipPage() {
  const { data: memberships, isLoading } = useListVipMemberships({ query: { queryKey: getListVipMembershipsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [guestName, setGuestName] = useState("");
  const [selectedTier, setSelectedTier] = useState("gold");
  const [submitting, setSubmitting] = useState(false);

  const createMembership = useCreateVipMembership({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVipMembershipsQueryKey() });
        toast({ title: "👑 VIP Access Granted", description: `Welcome to the ${selectedTier.toUpperCase()} tier, ${guestName}.` });
        setGuestName(""); setSubmitting(false);
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err.message || "Could not process membership.", variant: "destructive" });
        setSubmitting(false);
      },
    },
  });

  const handleSubscribe = (tierId: string) => {
    if (!guestName.trim()) {
      toast({ title: "Enter your guest name", description: "Required to activate your membership." });
      return;
    }
    setSubmitting(true);
    const tier = TIERS.find(t => t.id === tierId)!;
    createMembership.mutate({ data: { guestName: guestName.trim(), tier: tierId, amount: tier.price } });
  };

  const activeMemberships = memberships?.filter(m => m.isActive) || [];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-16">
      {/* Hero */}
      <section className="text-center py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-primary/20 border border-yellow-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.2)]">
              <Crown className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-widest text-white mb-4" style={{ textShadow: "0 0 40px rgba(251,191,36,0.3)" }}>
            <GlitchText>VIP Access</GlitchText>
          </h1>
          <p className="text-primary/70 font-mono text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Transcend the ordinary. Unlock multipliers, exclusive rooms, oracle access and cosmic particle effects.
          </p>
        </motion.div>
      </section>

      {/* Guest name input */}
      <div className="max-w-sm mx-auto">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Your Guest Name</label>
        <Input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Enter your alias..."
          className="bg-black/50 border-primary/30 focus:border-primary text-white font-mono text-center"
        />
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier, idx) => {
          const Icon = tier.icon;
          const isSelected = selectedTier === tier.id;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                isSelected ? `${tier.borderColor} shadow-[0_0_40px_${tier.glowColor}]` : "border-white/10 hover:border-white/20"
              }`}
              style={isSelected ? { boxShadow: `0 0 40px ${tier.glowColor}` } : {}}
            >
              {tier.featured && (
                <div className="absolute top-0 left-0 right-0 py-1.5 text-center bg-yellow-400/20 border-b border-yellow-400/30">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold">Most Popular</span>
                </div>
              )}

              <div className={`p-6 ${tier.featured ? "pt-10" : ""}`}>
                {/* Icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl ${tier.bgColor} border ${tier.borderColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${tier.textColor}`} />
                  </div>
                  <div>
                    <div className={`text-lg font-display font-bold uppercase tracking-wider ${tier.textColor}`}>{tier.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{tier.badge} VIP Tier</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className={`text-3xl font-display font-bold ${tier.textColor}`}>{tier.priceLabel.split("/")[0]}</span>
                  <span className="text-sm text-muted-foreground font-mono">/month</span>
                </div>

                <p className="text-sm text-muted-foreground font-mono mb-5 leading-relaxed">{tier.description}</p>

                {/* Perks */}
                <ul className="space-y-2.5 mb-6">
                  {tier.perks.map((perk) => (
                    <li key={perk.text} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full ${tier.bgColor} border ${tier.borderColor} flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-3 h-3 ${tier.textColor}`} />
                      </div>
                      <span className="text-muted-foreground">{perk.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={submitting || !guestName.trim()}
                  className={`w-full font-display uppercase tracking-widest text-sm rounded-xl h-11 transition-all ${
                    isSelected
                      ? `${tier.bgColor} ${tier.textColor} border ${tier.borderColor} hover:opacity-90`
                      : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {submitting && selectedTier === tier.id ? (
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 animate-spin" /> Processing...</span>
                  ) : isSelected ? (
                    <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Subscribe Now</span>
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div>
        <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white text-center mb-6">Full Comparison</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-4 bg-white/5 px-4 py-3">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Feature</div>
            {TIERS.map(t => (
              <div key={t.id} className={`text-xs font-mono uppercase tracking-widest text-center ${t.textColor}`}>{t.name}</div>
            ))}
          </div>
          {COMPARISON.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-4 px-4 py-3 ${i % 2 === 0 ? "bg-black/20" : "bg-black/10"}`}>
              <div className="text-sm text-muted-foreground font-mono">{row.feature}</div>
              <div className="text-sm text-slate-300 font-mono text-center">{row.silver}</div>
              <div className="text-sm text-yellow-400 font-mono text-center">{row.gold}</div>
              <div className="text-sm text-cyan-400 font-mono text-center">{row.cosmic}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active memberships */}
      {isLoading ? null : activeMemberships.length > 0 && (
        <div>
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" /> Active Members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeMemberships.slice(0, 6).map((m: any) => {
              const tier = TIERS.find(t => t.id === m.tier) ?? TIERS[0];
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${tier.borderColor} ${tier.bgColor}`}
                >
                  <span className="text-lg">{tier.badge}</span>
                  <div>
                    <div className={`font-bold text-sm ${tier.textColor}`}>{m.guestName}</div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{tier.name} Member</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-[11px] text-muted-foreground/50 font-mono">
        Memberships are digital access passes to Quantum Lounge features. XRP credits are in-app rewards.
        All transactions are subject to the <a href="/smart-contracts" className="underline hover:text-muted-foreground">Smart Contracts</a> and <a href="/legal" className="underline hover:text-muted-foreground">Terms of Service</a>.
      </p>
    </div>
  );
}
