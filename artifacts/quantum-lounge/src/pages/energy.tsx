import { useListEnergyUpgrades, useListGuests, usePurchaseUpgrade, getListGuestsQueryKey, getListGuestUpgradesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BatteryCharging, Zap, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GlitchText } from "@/components/glitch-text";

export default function Energy() {
  const { data: upgrades, isLoading: loadingUpgrades } = useListEnergyUpgrades();
  const { data: guests } = useListGuests();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<number | null>(null);

  const purchaseUpgrade = usePurchaseUpgrade({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListGuestUpgradesQueryKey() });
        toast({
          title: "Entity Transcended",
          description: "Energy upgrade successfully integrated.",
        });
      }
    }
  });

  const handlePurchase = () => {
    if (!selectedGuestId || selectedUpgradeId === null) return;
    
    purchaseUpgrade.mutate({
      data: {
        guestId: Number(selectedGuestId),
        upgradeId: selectedUpgradeId,
      }
    });
  };

  const activeGuests = guests?.filter(g => g.status === "active") || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <section className="text-center py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-t-2 border-primary border-r-2 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)] bg-primary/10">
              <BatteryCharging className="w-8 h-8 text-primary glow-text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-4 glow-text-primary">
            <GlitchText interval={6000}>Energy Matrix</GlitchText>
          </h1>
          <p className="text-primary/80 font-mono max-w-xl mx-auto">
            Acquire quantum upgrades to elevate your entity's vibrational frequency.
          </p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loadingUpgrades ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 rounded-xl border border-white/5 bg-white/2 space-y-4 h-64">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-36 bg-white/5 rounded" />
                    <Skeleton className="h-5 w-24 bg-white/5 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full bg-white/5 rounded" />
                <Skeleton className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="flex justify-between items-end pt-4 border-t border-white/5">
                  <Skeleton className="h-8 w-20 bg-white/5 rounded" />
                  <Skeleton className="h-8 w-20 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : upgrades?.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-dashed border-primary/20 rounded-2xl bg-primary/5">
            <Zap className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <p className="text-primary/70 font-mono uppercase tracking-widest">No upgrades currently available.</p>
          </div>
        ) : (
          upgrades?.map((upgrade, index) => (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card 
                className="p-8 h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-2 border-2"
                style={{ 
                  backgroundColor: `color-mix(in srgb, ${upgrade.color} 5%, transparent)`,
                  borderColor: `color-mix(in srgb, ${upgrade.color} 20%, transparent)`
                }}
              >
                {/* Glow effect matching upgrade color */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                  style={{ backgroundColor: `color-mix(in srgb, ${upgrade.color} 10%, transparent)` }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-2xl text-white mb-2" style={{ textShadow: `0 0 10px ${upgrade.color}40` }}>
                        {upgrade.name}
                      </h3>
                      <div 
                        className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border uppercase tracking-wider"
                        style={{ 
                          color: upgrade.color, 
                          borderColor: `color-mix(in srgb, ${upgrade.color} 50%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${upgrade.color} 10%, transparent)`
                        }}
                      >
                        <ArrowUpCircle className="w-3 h-3" />
                        Level: {upgrade.level}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground font-mono text-sm mb-8 flex-1 leading-relaxed">
                    {upgrade.description}
                  </p>

                  <div className="flex items-end justify-between mt-auto pt-6 border-t border-white/5">
                    <div>
                      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Exchange Rate</div>
                      <div className="text-3xl font-bold font-display text-white tracking-widest">
                        ¤{upgrade.price}
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => setSelectedUpgradeId(upgrade.id)}
                          className="font-display uppercase tracking-widest transition-all hover:scale-105"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${upgrade.color} 20%, transparent)`,
                            color: upgrade.color,
                            border: `1px solid ${upgrade.color}`,
                            boxShadow: `0 0 15px color-mix(in srgb, ${upgrade.color} 20%, transparent)`
                          }}
                        >
                          Acquire
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-primary/30 backdrop-blur-xl">
                        <DialogHeader>
                          <DialogTitle className="font-display uppercase tracking-widest" style={{ color: upgrade.color, textShadow: `0 0 10px ${upgrade.color}80` }}>
                            Acquire {upgrade.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                              Select Target Entity
                            </label>
                            <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
                              <SelectTrigger className="bg-black/50 border-white/10 text-white font-mono">
                                <SelectValue placeholder="Identify entity..." />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-white/10 text-white">
                                {activeGuests.map(g => (
                                  <SelectItem key={g.id} value={g.id.toString()}>
                                    {g.name} (Current: {g.energyLevel})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-2">
                            <div className="flex justify-between text-sm font-mono">
                              <span className="text-muted-foreground">Exchange Rate</span>
                              <span className="text-white">¤{upgrade.price}</span>
                            </div>
                            <div className="flex justify-between text-sm font-mono">
                              <span className="text-muted-foreground">New Frequency</span>
                              <span style={{ color: upgrade.color }} className="uppercase">{upgrade.level}</span>
                            </div>
                          </div>

                          <Button
                            onClick={handlePurchase}
                            disabled={purchaseUpgrade.isPending || !selectedGuestId}
                            className="w-full font-display uppercase tracking-widest mt-4"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${upgrade.color} 20%, transparent)`,
                              color: upgrade.color,
                              border: `1px solid ${upgrade.color}`
                            }}
                          >
                            {purchaseUpgrade.isPending ? "Processing..." : "Confirm Integration"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
