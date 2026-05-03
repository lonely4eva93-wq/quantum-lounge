import { useListVipMemberships, useCreateVipMembership, getListVipMembershipsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Crown, Sparkles, Star } from "lucide-react";

const TIERS = [
  {
    id: "silver",
    name: "Silver",
    price: 9.99,
    color: "from-slate-400 to-slate-600",
    icon: Star,
    perks: ["Priority Queue", "Custom Name Color", "Access to Silver Lounge"],
  },
  {
    id: "gold",
    name: "Gold",
    price: 19.99,
    color: "from-yellow-400 to-yellow-600",
    icon: Crown,
    perks: ["All Silver Perks", "Golden Aura", "Access to Gold VIP Room", "Monthly Free Boost"],
  },
  {
    id: "cosmic",
    name: "Cosmic",
    price: 29.99,
    color: "from-primary to-secondary",
    icon: Sparkles,
    perks: ["All Gold Perks", "Cosmic Particle Effects", "Private Room Creation", "Unlimited Priority"],
  },
];

export default function VipMembershipPage() {
  const { data: memberships, isLoading } = useListVipMemberships({ query: { queryKey: getListVipMembershipsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTier, setSelectedTier] = useState("silver");

  const createMembership = useCreateVipMembership({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListVipMembershipsQueryKey() });
        toast({ title: "Welcome to VIP", description: "Your membership has been activated." });
        setGuestName("");
        setEmail("");
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err.message || "Could not process membership.", variant: "destructive" });
      }
    }
  });

  const handleSubscribe = () => {
    if (!guestName || !email) return;
    createMembership.mutate({ data: { guestName, email, tier: selectedTier } });
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-pulse">
          Quantum VIP
        </h1>
        <p className="text-muted-foreground font-mono max-w-2xl mx-auto text-lg">
          Ascend the hierarchy. Unlock exclusive realms, enhanced visual auras, and priority network routing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TIERS.map((tier, idx) => (
          <motion.div key={tier.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className={`relative p-8 h-full flex flex-col bg-black/40 border-white/10 backdrop-blur-md overflow-hidden ${selectedTier === tier.id ? 'ring-2 ring-primary glow-primary' : ''}`}>
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${tier.color}`} />
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${tier.color} bg-opacity-20`}>
                  <tier.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-display font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-mono text-white mb-6">
                  ${tier.price}<span className="text-sm text-muted-foreground">/mo</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.perks.map((perk, i) => (
                    <li key={i} className="flex items-center text-sm font-mono text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => setSelectedTier(tier.id)}
                  variant={selectedTier === tier.id ? "default" : "outline"}
                  className={`w-full font-display uppercase tracking-widest ${selectedTier === tier.id ? 'bg-primary text-black hover:bg-primary/90' : 'border-white/20 text-white hover:bg-white/10'}`}
                >
                  {selectedTier === tier.id ? "Selected" : "Select Tier"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="max-w-md mx-auto p-8 bg-card/60 backdrop-blur-md border-primary/20 glow-primary">
        <h2 className="text-2xl font-display font-bold text-white mb-6 text-center">Activate Subscription</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Guest Identity</label>
            <Input 
              value={guestName} 
              onChange={(e) => setGuestName(e.target.value)} 
              placeholder="Enter your handle..." 
              className="bg-black/50 border-white/10 text-white font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Comm Link (Email)</label>
            <Input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email..." 
              className="bg-black/50 border-white/10 text-white font-mono"
            />
          </div>
          <Button 
            className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-white font-display uppercase tracking-widest hover:opacity-90"
            onClick={handleSubscribe}
            disabled={createMembership.isPending || !guestName || !email}
          >
            {createMembership.isPending ? "Processing..." : `Subscribe to ${TIERS.find(t => t.id === selectedTier)?.name}`}
          </Button>
        </div>
      </Card>

      <div className="pt-12 border-t border-white/10">
        <h2 className="text-2xl font-display font-bold text-white mb-6">Recent Ascensions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 bg-white/5 rounded-lg" />)
          ) : memberships?.slice(0, 9).map((member) => (
            <div key={member.id} className="p-4 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-white font-mono">{member.guestName}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{member.tier} Tier</div>
              </div>
              <div className={`w-3 h-3 rounded-full ${member.status === 'active' ? 'bg-primary shadow-[0_0_10px_rgba(0,255,255,0.8)]' : 'bg-muted'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
