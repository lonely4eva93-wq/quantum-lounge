import { useListGuests, useListRooms, useTeleportGuest, getListGuestsQueryKey, getListRoomsQueryKey, useListTeleportHistory } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, RadioReceiver, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { GuestProfile } from "@/components/guest-profile";

const PARTICLE_COUNT = 16;

function ParticleBurst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-40">
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const angle = (i / PARTICLE_COUNT) * 360;
            const distance = 80 + Math.random() * 60;
            const rad = (angle * Math.PI) / 180;
            const tx = Math.cos(rad) * distance;
            const ty = Math.sin(rad) * distance;
            const colors = ["#00f3ff", "#ff00ff", "#0064ff", "#ffffff", "#7c3aed"];
            const color = colors[i % colors.length];
            const size = 3 + Math.random() * 4;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.015 }}
                style={{
                  position: "absolute",
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function Teleport() {
  const { data: guests } = useListGuests();
  const { data: rooms } = useListRooms();
  const { data: history } = useListTeleportHistory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [guestId, setGuestId] = useState<string>("");
  const [toRoomId, setToRoomId] = useState<string>("");
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [profileGuestId, setProfileGuestId] = useState<number | null>(null);

  const activeGuests = guests?.filter(g => g.status === "active") || [];
  const openRooms = rooms?.filter(r => r.isOpen) || [];

  const teleport = useTeleportGuest({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey() });
        
        setShowBurst(true);
        setTimeout(() => {
          setShowBurst(false);
          setIsTeleporting(true);
          setTimeout(() => {
            setIsTeleporting(false);
            toast({
              title: "Teleportation Successful",
              description: `Quantum shift of ${data.quantumShift} completed.`,
            });
            setGuestId("");
            setToRoomId("");
          }, 1200);
        }, 700);
      },
      onError: (err: any) => {
        toast({
          title: "Teleportation Failed",
          description: err.message || "Quantum entanglement error.",
          variant: "destructive",
        });
      }
    }
  });

  const handleTeleport = () => {
    if (!guestId || !toRoomId) return;
    const guest = activeGuests.find(g => g.id.toString() === guestId);
    if (!guest) return;

    teleport.mutate({
      data: {
        guestId: Number(guestId),
        fromRoomId: guest.roomId,
        toRoomId: Number(toRoomId),
      }
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <section className="text-center py-12 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-t-2 border-accent border-r-2 flex items-center justify-center shadow-[0_0_30px_rgba(0,100,255,0.3)] bg-accent/10 relative overflow-hidden">
              <ArrowRightLeft className="w-10 h-10 text-accent glow-accent" />
              {isTeleporting && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-4 glow-text-accent">
            Quantum Portal
          </h1>
          <p className="text-accent/80 font-mono max-w-xl mx-auto">
            Instantaneous matter transfer between dimensional vectors.
          </p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Portal Controls */}
        <Card className="p-8 bg-card/40 backdrop-blur-md border-accent/20 h-fit relative overflow-hidden">
          <ParticleBurst active={showBurst} />

          {isTeleporting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.2, 1] }}
              className="absolute inset-0 bg-white z-50 mix-blend-overlay pointer-events-none"
            />
          )}

          <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white mb-8 flex items-center gap-3">
            <RadioReceiver className="w-6 h-6 text-accent" /> Configure Jump
          </h2>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-mono text-accent/70 uppercase tracking-widest">
                Target Entity
              </label>
              <Select value={guestId} onValueChange={setGuestId}>
                <SelectTrigger className="bg-black/50 border-accent/30 text-white font-mono h-12">
                  <SelectValue placeholder="Identify particle..." />
                </SelectTrigger>
                <SelectContent className="bg-black border-accent/30 text-white">
                  {activeGuests.map(g => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name} (Current: {g.roomName || "Lobby"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center py-2">
              <div className="w-1 px-8 py-4 border-l-2 border-r-2 border-dashed border-accent/30 h-16 flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-accent/50 rotate-90" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-accent/70 uppercase tracking-widest">
                Destination Vector
              </label>
              <Select value={toRoomId} onValueChange={setToRoomId}>
                <SelectTrigger className="bg-black/50 border-accent/30 text-white font-mono h-12">
                  <SelectValue placeholder="Select coordinates..." />
                </SelectTrigger>
                <SelectContent className="bg-black border-accent/30 text-white">
                  {openRooms.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name} ({r.frequency}Hz)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleTeleport}
              disabled={teleport.isPending || isTeleporting || showBurst || !guestId || !toRoomId}
              className="w-full h-14 bg-accent/20 text-accent border border-accent hover:bg-accent hover:text-black transition-all font-display uppercase tracking-widest text-lg mt-8 shadow-[0_0_15px_rgba(0,100,255,0.2)] hover:shadow-[0_0_30px_rgba(0,100,255,0.6)]"
            >
              {teleport.isPending || isTeleporting || showBurst ? "Initiating Jump..." : "Engage Portal"}
            </Button>
          </div>
        </Card>

        {/* Teleport Log */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent" /> Jump Log
          </h2>

          <div className="space-y-3">
            {history?.length === 0 ? (
              <div className="p-8 text-center text-accent/50 font-mono border border-dashed border-accent/20 rounded-xl">
                No recent teleportation events detected.
              </div>
            ) : (
              <AnimatePresence>
                {history?.slice(0, 10).map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-card/30 border border-accent/20 rounded-xl hover:border-accent/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <button
                        onClick={() => {
                          if (event.guestId) {
                            setProfileGuestId(event.guestId);
                          } else {
                            const guest = guests?.find(g => g.name === event.guestName);
                            if (guest) setProfileGuestId(guest.id);
                          }
                        }}
                        className="font-bold text-white hover:text-accent transition-colors cursor-pointer"
                      >
                        {event.guestName}
                      </button>
                      <span className="text-xs font-mono text-muted-foreground">
                        {format(new Date(event.teleportedAt), "HH:mm:ss")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm font-mono text-accent/80 bg-black/30 p-2 rounded">
                      <span className="flex-1 truncate">{event.fromRoomName || "Lobby"}</span>
                      <ArrowRightLeft className="w-4 h-4 shrink-0 text-accent" />
                      <span className="flex-1 truncate text-right text-white">{event.toRoomName}</span>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <span className="text-[10px] font-mono text-accent/50 px-2 py-1 rounded bg-accent/5 border border-accent/10 uppercase">
                        Shift: {event.quantumShift}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <GuestProfile guestId={profileGuestId} onClose={() => setProfileGuestId(null)} />
    </div>
  );
}
