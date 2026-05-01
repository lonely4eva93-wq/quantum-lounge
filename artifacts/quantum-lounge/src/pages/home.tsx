import { useListGuests, useListRooms, useCreateGuest, getListGuestsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Radio, Activity, Fingerprint, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";

export default function Home() {
  const { data: guests, isLoading: loadingGuests } = useListGuests();
  const { data: rooms, isLoading: loadingRooms } = useListRooms();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("");
  const [roomId, setRoomId] = useState<string>("none");

  const createGuest = useCreateGuest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        toast({
          title: "Materialization Complete",
          description: "You have entered the Quantum Lounge.",
        });
        setName("");
        setVibe("");
        setRoomId("none");
      },
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !vibe) return;

    createGuest.mutate({
      data: {
        name,
        vibe,
        roomId: roomId === "none" ? undefined : Number(roomId),
      },
    });
  };

  const activeGuests = guests?.filter((g) => g.status === "active") || [];
  const openRooms = rooms?.filter((r) => r.isOpen) || [];

  return (
    <div className="p-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-[0.2em] text-white mb-6 glow-text-primary">
            Enter the Void
          </h1>
          <p className="text-xl text-primary/80 font-mono max-w-2xl mx-auto">
            A nexus of social energy where particles entangle and vibrations synchronize.
          </p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Check-in Form */}
        <Card className="p-6 bg-card/40 backdrop-blur-md border-primary/20 shadow-[0_0_30px_rgba(0,243,255,0.05)] lg:col-span-1 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Fingerprint className="w-6 h-6 text-primary glow-text-primary" />
            <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white">
              Materialize
            </h2>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">
                Entity Designation
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alias..."
                className="bg-black/50 border-primary/30 focus:border-primary text-white font-mono"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">
                Current Frequency (Vibe)
              </label>
              <Input
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="How are you vibrating?"
                className="bg-black/50 border-primary/30 focus:border-primary text-white font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">
                Initial Vector (Room)
              </label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger className="bg-black/50 border-primary/30 text-white font-mono">
                  <SelectValue placeholder="Select vector..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30 text-white">
                  <SelectItem value="none">Stay in Lobby</SelectItem>
                  {openRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name} ({r.frequency}Hz)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={createGuest.isPending || !name || !vibe}
              className="w-full bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black transition-all font-display uppercase tracking-widest mt-6"
            >
              {createGuest.isPending ? (
                <Activity className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Inject Particle
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* Live Grid */}
        <div className="lg:col-span-2 space-y-8">
          {/* Open Rooms */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Radio className="w-6 h-6 text-secondary glow-secondary" />
              <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white">
                Active Nodes
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingRooms ? (
                <div className="text-primary/50 font-mono animate-pulse">Scanning frequencies...</div>
              ) : openRooms.length === 0 ? (
                <div className="text-primary/50 font-mono border border-dashed border-primary/20 p-8 text-center rounded-lg">
                  No vectors currently open.
                </div>
              ) : (
                openRooms.slice(0, 4).map((room) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-secondary transition-colors">
                        {room.name}
                      </h3>
                      <div className="px-2 py-1 rounded bg-black/50 border border-secondary/30 text-secondary text-xs font-mono">
                        {room.frequency}Hz
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">{room.theme}</div>
                    <div className="flex justify-between items-center text-xs font-mono text-secondary/70">
                      <span>Capacity: {room.guestCount}/{room.capacity}</span>
                      <Link href="/rooms" className="text-secondary hover:text-white transition-colors">
                        Inspect →
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Active Guests */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-accent glow-accent" />
              <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white">
                Entangled Entities
              </h2>
            </div>

            <div className="bg-black/20 border border-border/50 rounded-xl p-4 max-h-[300px] overflow-y-auto">
              {loadingGuests ? (
                <div className="text-accent/50 font-mono animate-pulse">Detecting signatures...</div>
              ) : activeGuests.length === 0 ? (
                <div className="text-accent/50 font-mono text-center py-8">
                  The void is currently empty.
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {activeGuests.map((guest) => (
                      <motion.div
                        key={guest.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-white/5 hover:border-accent/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${
                            guest.energyLevel === 'transcended' ? 'bg-secondary text-secondary animate-pulse' :
                            guest.energyLevel === 'quantum' ? 'bg-primary text-primary' :
                            guest.energyLevel === 'charged' ? 'bg-accent text-accent' :
                            'bg-muted-foreground text-muted-foreground'
                          }`} />
                          <div>
                            <span className="font-bold text-white tracking-wide">{guest.name}</span>
                            <span className="ml-2 text-xs font-mono text-muted-foreground px-2 py-0.5 rounded bg-white/5 border border-white/10">
                              {guest.vibe}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-accent/70">
                          {guest.roomName || "Lobby"}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
