import { useListGuests, useListRooms, useCreateGuest, useUpdateGuest, getListGuestsQueryKey, getListRoomsQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { useState, memo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Radio, Activity, Fingerprint, LogIn, Rss, LogOut, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { FrequencyWaveform } from "@/components/frequency-waveform";
import { GlitchText } from "@/components/glitch-text";
import { GuestProfile } from "@/components/guest-profile";

const activityTypeColors: Record<string, string> = {
  join: "text-green-400 border-green-400/20 bg-green-400/5",
  teleport: "text-primary border-primary/20 bg-primary/5",
  purchase: "text-secondary border-secondary/20 bg-secondary/5",
};

const activityTypeLabels: Record<string, string> = {
  join: "JOIN",
  teleport: "JUMP",
  purchase: "ACQR",
};

const GuestListItem = memo(function GuestListItem({
  guest,
  onNameClick,
  onCheckOut,
  checkingOut,
}: {
  guest: { id: number; name: string; vibe: string; energyLevel: string; roomName?: string | null };
  onNameClick: (id: number) => void;
  onCheckOut: (id: number) => void;
  checkingOut: boolean;
}) {
  return (
    <motion.div
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
          <button
            onClick={() => onNameClick(guest.id)}
            className="font-bold text-white tracking-wide hover:text-accent transition-colors cursor-pointer underline-offset-2 hover:underline"
          >
            {guest.name}
          </button>
          <span className="ml-2 text-xs font-mono text-muted-foreground px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {guest.vibe}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs font-mono text-accent/70">
          {guest.roomName || "Lobby"}
        </div>
        <button
          onClick={() => onCheckOut(guest.id)}
          disabled={checkingOut}
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Out
        </button>
      </div>
    </motion.div>
  );
});

export default function Home() {
  const { data: guests, isLoading: loadingGuests } = useListGuests({
    query: { refetchInterval: 20_000, queryKey: getListGuestsQueryKey() },
  });
  const { data: rooms, isLoading: loadingRooms } = useListRooms({
    query: { refetchInterval: 20_000, queryKey: getListRoomsQueryKey() },
  });
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity({
    query: { refetchInterval: 10_000, queryKey: getGetRecentActivityQueryKey() },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("");
  const [bio, setBio] = useState("");
  const [roomId, setRoomId] = useState<string>("none");
  const [profileGuestId, setProfileGuestId] = useState<number | null>(null);

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
        setBio("");
        setRoomId("none");
      },
    },
  });

  const checkOutGuest = useUpdateGuest({
    mutation: {
      onSuccess: (guest) => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey() });
        toast({
          title: "Departure Logged",
          description: `${guest.name} has left the Quantum Lounge.`,
        });
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
        bio,
        roomId: roomId === "none" ? undefined : Number(roomId),
      },
    });
  };

  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.origin;
    const text = "I'm at the Quantum Lounge — an immersive digital nightclub with frequency rooms, teleportation, and cosmic oracle readings. Enter the void:";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Quantum Lounge", text, url });
      } catch {
        // dismissed
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            <GlitchText interval={5000}>Enter the Void</GlitchText>
          </h1>
          <p className="text-xl text-primary/80 font-mono max-w-2xl mx-auto mb-8">
            A nexus of social energy where particles entangle and vibrations synchronize.
          </p>
          <motion.button
            onClick={handleShare}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/40 bg-primary/10 text-primary font-mono text-sm uppercase tracking-widest hover:bg-primary/20 hover:border-primary/60 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Link Copied!" : "Share the Void"}
          </motion.button>
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
                Quantum Bio <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the void who you are..."
                maxLength={280}
                rows={3}
                className="w-full bg-black/50 border border-primary/30 focus:border-primary text-white font-mono text-sm rounded-md px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
              />
              <div className="text-right text-[10px] font-mono text-muted-foreground/40">
                {bio.length}/280
              </div>
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
                <>
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-28 bg-white/5 rounded" />
                        <Skeleton className="h-5 w-16 bg-white/5 rounded" />
                      </div>
                      <Skeleton className="h-4 w-40 bg-white/5 rounded" />
                      <Skeleton className="h-6 w-full bg-white/5 rounded" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-24 bg-white/5 rounded" />
                        <Skeleton className="h-3 w-16 bg-white/5 rounded" />
                      </div>
                    </div>
                  ))}
                </>
              ) : openRooms.length === 0 ? (
                <div className="text-primary/50 font-mono border border-dashed border-primary/20 p-8 text-center rounded-lg">
                  No vectors currently open.
                </div>
              ) : (
                <AnimatePresence>
                  {openRooms.slice(0, 4).map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.3 }}
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
                      <div className="text-sm text-muted-foreground mb-3">{room.theme}</div>
                      <div className="mb-3">
                        <FrequencyWaveform frequency={room.frequency} color="rgb(255,0,255)" barCount={14} height={28} />
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-secondary/70">
                        <span>Capacity: {room.guestCount}/{room.capacity}</span>
                        <Link href="/rooms" className="text-secondary hover:text-white transition-colors">
                          Inspect →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-2 h-2 rounded-full bg-white/10" />
                        <Skeleton className="h-4 w-24 bg-white/10 rounded" />
                        <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                      </div>
                      <Skeleton className="h-3 w-12 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : activeGuests.length === 0 ? (
                <div className="text-accent/50 font-mono text-center py-8">
                  The void is currently empty.
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {activeGuests.map((guest) => (
                      <GuestListItem
                        key={guest.id}
                        guest={guest}
                        onNameClick={setProfileGuestId}
                        onCheckOut={(id) => checkOutGuest.mutate({ id, data: { status: "checked_out" } })}
                        checkingOut={checkOutGuest.isPending}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Live Activity Feed */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Rss className="w-6 h-6 text-primary glow-text-primary" />
          <h2 className="text-2xl font-display font-bold uppercase tracking-wider text-white">
            Activity Feed
          </h2>
          <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-widest animate-pulse">
            Live
          </div>
        </div>

        <div className="bg-black/20 border border-border/50 rounded-xl p-4 max-h-80 overflow-y-auto">
          {loadingActivity ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-white/5">
                  <Skeleton className="h-5 w-12 bg-white/5 rounded" />
                  <Skeleton className="h-4 w-24 bg-white/5 rounded" />
                  <Skeleton className="h-4 flex-1 bg-white/5 rounded" />
                  <Skeleton className="h-3 w-14 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : !activity || activity.length === 0 ? (
            <div className="text-primary/50 font-mono text-center py-8">
              Awaiting quantum events...
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {activity.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-widest shrink-0 ${activityTypeColors[event.type] ?? "text-muted-foreground"}`}>
                      {activityTypeLabels[event.type] ?? event.type}
                    </span>
                    <button
                      onClick={() => {
                        if (event.guestId) {
                          setProfileGuestId(event.guestId);
                        } else {
                          const guest = guests?.find(g => g.name === event.guestName);
                          if (guest) setProfileGuestId(guest.id);
                        }
                      }}
                      className="font-bold text-white text-sm hover:text-primary transition-colors cursor-pointer"
                    >
                      {event.guestName}
                    </button>
                    <span className="text-muted-foreground text-sm font-mono flex-1 truncate">{event.detail}</span>
                    <span className="text-xs font-mono text-white/30 shrink-0 tabular-nums">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <GuestProfile guestId={profileGuestId} onClose={() => setProfileGuestId(null)} />
    </div>
  );
}
