import { useListRooms, useListGuests, useUpdateGuest, getListGuestsQueryKey, getListRoomsQueryKey } from "@workspace/api-client-react";
import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Grid, Radio, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FrequencyWaveform } from "@/components/frequency-waveform";
import { GlitchText } from "@/components/glitch-text";

const RoomCardSkeleton = memo(function RoomCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-white/5 bg-white/2 space-y-4 h-52">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-white/5 rounded" />
          <Skeleton className="h-4 w-24 bg-white/5 rounded" />
        </div>
        <Skeleton className="h-7 w-16 bg-white/5 rounded" />
      </div>
      <Skeleton className="h-8 w-full bg-white/5 rounded" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24 bg-white/5 rounded" />
        <Skeleton className="h-8 w-16 bg-white/5 rounded" />
      </div>
    </div>
  );
});

export default function Rooms() {
  const { data: rooms, isLoading: loadingRooms } = useListRooms();
  const { data: guests, isLoading: loadingGuests } = useListGuests();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const updateGuest = useUpdateGuest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey() });
        toast({
          title: "Quantum Shift Complete",
          description: "Entity has been injected into the vector.",
        });
      }
    }
  });

  const handleJoin = () => {
    if (!selectedGuestId || selectedRoomId === null) return;
    updateGuest.mutate({
      id: Number(selectedGuestId),
      data: { roomId: selectedRoomId }
    });
  };

  const activeGuests = guests?.filter(g => g.status === "active") || [];
  const openRooms = rooms?.filter(r => r.isOpen) || [];

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <section className="text-center py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-t-2 border-secondary border-r-2 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.3)] bg-secondary/10">
              <Grid className="w-8 h-8 text-secondary glow-secondary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-4 glow-text-secondary">
            <GlitchText interval={5500}>Quantum Vectors</GlitchText>
          </h1>
          <p className="text-secondary/80 font-mono max-w-xl mx-auto">
            Browse active frequencies and inject your particle into the desired social vector.
          </p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingRooms ? (
          <>
            {[1, 2, 3].map((i) => <RoomCardSkeleton key={i} />)}
          </>
        ) : openRooms.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-dashed border-secondary/20 rounded-2xl bg-secondary/5">
            <Radio className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
            <p className="text-secondary/70 font-mono uppercase tracking-widest">No active vectors detected.</p>
          </div>
        ) : (
          openRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative p-6 bg-card/60 backdrop-blur-xl border border-secondary/20 hover:border-secondary/50 transition-all h-full flex flex-col z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white mb-1 group-hover:text-secondary transition-colors">
                      {room.name}
                    </h3>
                    <div className="text-sm font-mono text-muted-foreground">{room.theme}</div>
                  </div>
                  <div className="px-3 py-1 rounded bg-black border border-secondary/50 text-secondary text-sm font-mono font-bold shadow-[0_0_10px_rgba(255,0,255,0.2)]">
                    {room.frequency}Hz
                  </div>
                </div>

                <div className="mb-4">
                  <FrequencyWaveform frequency={room.frequency} color="rgb(255,0,255)" barCount={16} height={36} />
                </div>

                <div className="flex-1" />

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-primary/70">Capacity:</span>
                    <span className="text-white font-bold">{room.guestCount}/{room.capacity}</span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedRoomId(room.id)}
                        className="bg-secondary/10 border-secondary/50 text-secondary hover:bg-secondary hover:text-black uppercase font-display tracking-wider text-xs"
                      >
                        Inject
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-secondary/30 backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="font-display uppercase tracking-widest text-secondary glow-text-secondary">
                          Vector Injection: {room.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-6 space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-secondary/70 uppercase tracking-widest">
                            Select Entity to Inject
                          </label>
                          <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
                            <SelectTrigger className="bg-black/50 border-secondary/30 text-white font-mono">
                              <SelectValue placeholder="Identify entity..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-secondary/30 text-white">
                              {activeGuests.map(g => (
                                <SelectItem key={g.id} value={g.id.toString()}>
                                  {g.name} ({g.energyLevel})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleJoin}
                          disabled={updateGuest.isPending || !selectedGuestId}
                          className="w-full bg-secondary/20 text-secondary border border-secondary hover:bg-secondary hover:text-black transition-all font-display uppercase tracking-widest"
                        >
                          {updateGuest.isPending ? "Processing..." : "Confirm Injection"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Fill bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 rounded-b-xl overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-1000"
                    style={{ width: `${(room.guestCount / room.capacity) * 100}%` }}
                  />
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
