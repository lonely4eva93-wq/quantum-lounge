import { useCreateOracleReading, useListOracleReadings, getListOracleReadingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, Hexagon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OraclePage() {
  const { data: readings, isLoading } = useListOracleReadings({ query: { queryKey: getListOracleReadingsQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [guestName, setGuestName] = useState("");
  const [vibe, setVibe] = useState("");
  const [energyLevel, setEnergyLevel] = useState("basic");
  const [activeReading, setActiveReading] = useState<any>(null);

  const createReading = useCreateOracleReading({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListOracleReadingsQueryKey() });
        setActiveReading(data);
        toast({ title: "The Oracle Speaks", description: "Your cosmic signature has been decoded." });
      },
      onError: (err: any) => {
        toast({ title: "Interference", description: err.message || "Failed to contact the Oracle.", variant: "destructive" });
      }
    }
  });

  const handleConsult = () => {
    if (!guestName || !vibe || !energyLevel) return;
    createReading.mutate({ data: { guestName, vibe, energyLevel } });
  };

  return (
    <div className="container max-w-5xl mx-auto py-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,255,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="text-center space-y-6 mb-16 relative z-10">
        <Hexagon className="w-16 h-16 mx-auto text-secondary animate-[spin_10s_linear_infinite]" />
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-widest text-white glow-text-primary">
          Quantum Oracle
        </h1>
        <p className="text-muted-foreground font-mono max-w-2xl mx-auto text-lg">
          Offer your energy. Receive cosmic truth. Cost: $4.99 per divination.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 relative z-10">
        <Card className="p-8 bg-black/60 border-secondary/30 backdrop-blur-xl glow-secondary relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
          <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
            <Eye className="text-secondary" /> Initiate Connection
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-secondary uppercase tracking-widest">Identity</label>
              <Input 
                value={guestName} 
                onChange={(e) => setGuestName(e.target.value)} 
                placeholder="Enter your handle..." 
                className="bg-black/50 border-secondary/30 text-white font-mono focus-visible:ring-secondary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono text-secondary uppercase tracking-widest">Current Vibe</label>
              <Input 
                value={vibe} 
                onChange={(e) => setVibe(e.target.value)} 
                placeholder="e.g. ethereal, chaotic, seeking..." 
                className="bg-black/50 border-secondary/30 text-white font-mono focus-visible:ring-secondary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-secondary uppercase tracking-widest">Energy State</label>
              <Select value={energyLevel} onValueChange={setEnergyLevel}>
                <SelectTrigger className="bg-black/50 border-secondary/30 text-white font-mono focus:ring-secondary">
                  <SelectValue placeholder="Select energy level" />
                </SelectTrigger>
                <SelectContent className="bg-card border-secondary/30">
                  <SelectItem value="basic">Basic (Ground State)</SelectItem>
                  <SelectItem value="charged">Charged (Excited)</SelectItem>
                  <SelectItem value="quantum">Quantum (Superposition)</SelectItem>
                  <SelectItem value="transcended">Transcended (Ascended)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full h-14 bg-secondary/20 border border-secondary text-secondary hover:bg-secondary hover:text-black font-display uppercase tracking-widest transition-all duration-300"
              onClick={handleConsult}
              disabled={createReading.isPending || !guestName || !vibe}
            >
              {createReading.isPending ? "Divining..." : "Consult Oracle ($4.99)"}
            </Button>
          </div>
        </Card>

        <div className="relative">
          <AnimatePresence mode="wait">
            {activeReading ? (
              <motion.div
                key="reading"
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                className="h-full"
              >
                <Card className="h-full p-8 bg-secondary/10 border-secondary backdrop-blur-xl flex flex-col justify-center text-center space-y-6 glow-secondary">
                  <Sparkles className="w-12 h-12 mx-auto text-secondary animate-pulse" />
                  <div className="font-mono text-sm text-secondary/70 uppercase tracking-widest">
                    Frequency: {activeReading.frequency}Hz
                  </div>
                  <p className="text-2xl md:text-3xl font-display leading-relaxed text-white">
                    "{activeReading.reading}"
                  </p>
                  <div className="font-mono text-xs text-secondary/50 break-all pt-8 border-t border-secondary/20">
                    SIG: {activeReading.cosmicSignature}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Card className="h-full p-8 bg-black/40 border-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 rounded-full border border-secondary/20 flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 animate-ping" />
                  </div>
                  <p className="text-muted-foreground font-mono">The Oracle awaits your offering.</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-24 space-y-8">
        <h3 className="text-2xl font-display font-bold text-white text-center">Recent Divinations</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 bg-white/5 rounded-xl" />)
          ) : readings?.slice(0, 6).map((reading) => (
            <Card key={reading.id} className="p-6 bg-black/40 border-white/10 hover:border-secondary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <span className="font-bold text-white font-mono">{reading.guestName}</span>
                <span className="text-xs text-secondary font-mono px-2 py-1 bg-secondary/10 rounded">
                  {reading.frequency}Hz
                </span>
              </div>
              <p className="text-sm text-white/80 italic font-serif">"{reading.reading}"</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
