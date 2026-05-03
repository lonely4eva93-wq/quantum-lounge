import {
  useListGuests, useListRooms, useCreateGuest, useUpdateGuest,
  getListGuestsQueryKey, getListRoomsQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import { useState, memo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Radio, Activity, Fingerprint, LogIn, Rss, LogOut,
  Share2, Check, Users, Globe, TrendingUp, Star, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { FrequencyWaveform } from "@/components/frequency-waveform";
import { GlitchText } from "@/components/glitch-text";
import { GuestProfile } from "@/components/guest-profile";
import { CountUp } from "@/components/count-up";

const VIBE_PRESETS = [
  "Cosmic Drifter", "Neon Prophet", "Void Walker", "Quantum Ghost",
  "Electric Sage", "Dark Matter", "Singularity", "Entropy Node",
  "Phantom Signal", "Stardust",
];

const energyGradients: Record<string, string> = {
  basic: "from-white/20 to-white/5",
  charged: "from-yellow-400/30 to-yellow-400/5",
  quantum: "from-cyan-400/30 to-cyan-400/5",
  transcended: "from-fuchsia-400/30 to-fuchsia-400/5",
};

const energyDots: Record<string, string> = {
  basic: "bg-white/40",
  charged: "bg-yellow-400",
  quantum: "bg-cyan-400",
  transcended: "bg-fuchsia-500 animate-pulse",
};

const activityTypeColors: Record<string, string> = {
  join: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
  teleport: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5",
  purchase: "text-fuchsia-400 border-fuchsia-400/20 bg-fuchsia-400/5",
};
const activityTypeLabels: Record<string, string> = {
  join: "JOIN", teleport: "JUMP", purchase: "ACQR",
};

const GuestListItem = memo(function GuestListItem({
  guest, onNameClick, onCheckOut, checkingOut,
}: {
  guest: { id: number; name: string; vibe: string; energyLevel: string; roomName?: string | null };
  onNameClick: (id: number) => void;
  onCheckOut: (id: number) => void;
  checkingOut: boolean;
}) {
  const dot = energyDots[guest.energyLevel] ?? energyDots.basic;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-white/5 hover:border-white/15 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${dot}`} />
        <div>
          <button
            onClick={() => onNameClick(guest.id)}
            className="font-bold text-white tracking-wide hover:text-primary transition-colors cursor-pointer text-sm"
          >
            {guest.name}
          </button>
          <span className="ml-2 text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            {guest.vibe}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs font-mono text-primary/60 hidden sm:block">{guest.roomName || "Lobby"}</div>
        <button
          onClick={() => onCheckOut(guest.id)}
          disabled={checkingOut}
          className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border border-white/10 text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <LogOut className="w-3 h-3" /> Out
        </button>
      </div>
    </motion.div>
  );
});

function PlatformStatTicker({
  label, value, icon: Icon, color,
}: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
      <span className={`text-sm font-bold font-mono ${color}`}>
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </span>
      <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
}

export default function Home() {
  const { data: guests, isLoading: loadingGuests } = useListGuests({
    query: { refetchInterval: 15_000, queryKey: getListGuestsQueryKey() },
  });
  const { data: rooms, isLoading: loadingRooms } = useListRooms({
    query: { refetchInterval: 20_000, queryKey: getListRoomsQueryKey() },
  });
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity({
    query: { refetchInterval: 8_000, queryKey: getGetRecentActivityQueryKey() },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [vibe, setVibe] = useState(VIBE_PRESETS[0]);
  const [customVibe, setCustomVibe] = useState("");
  const [bio, setBio] = useState("");
  const [profileGuestId, setProfileGuestId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const createGuest = useCreateGuest({
    mutation: {
      onSuccess: (guest) => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        toast({ title: "⚡ Materialization Complete", description: `${guest.name} has entered the Quantum Lounge.` });
        setName(""); setBio(""); setCustomVibe("");
      },
    },
  });

  const checkOutGuest = useUpdateGuest({
    mutation: {
      onSuccess: (guest) => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey() });
        toast({ title: "Departure Logged", description: `${guest.name} has left the Quantum Lounge.` });
      },
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const finalVibe = customVibe.trim() || vibe;
    if (!finalVibe) return;
    createGuest.mutate({ data: { name, vibe: finalVibe, bio } });
  };

  const handleShare = async () => {
    const url = window.location.origin;
    const text = "I'm at the Quantum Lounge — an immersive digital nightclub with frequency rooms, XRP rewards, teleportation & cosmic oracle readings.";
    if (navigator.share) {
      try { await navigator.share({ title: "Quantum Lounge", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeGuests = guests?.filter((g) => g.status === "active") || [];
  const openRooms = rooms?.filter((r) => r.isOpen) || [];
  const totalGuests = guests?.length ?? 0;

  return (
    <div className="space-y-0">
      {/* Platform Stats Ticker */}
      <div className="border-b border-white/5 bg-black/30 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center divide-x divide-white/5 overflow-x-auto scrollbar-none">
          <PlatformStatTicker icon={Users} label="Online Now" value={activeGuests.length} color="text-emerald-400" />
          <PlatformStatTicker icon={Globe} label="All Time Guests" value={totalGuests} color="text-cyan-400" />
          <PlatformStatTicker icon={Radio} label="Rooms Live" value={openRooms.length} color="text-fuchsia-400" />
          <PlatformStatTicker icon={TrendingUp} label="Events" value={activity?.filter(a => a.type === "join").length ?? 0} color="text-yellow-400" />
          <div className="px-4 py-2 flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-16 relative">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }} className="relative z-10"
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 text-xs font-mono uppercase tracking-widest mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeGuests.length} entity{activeGuests.length !== 1 ? "s" : ""} online now
            </motion.div>

            <h1 className="text-5xl md:text-7xl xl:text-8xl font-display font-bold uppercase tracking-[0.15em] text-white mb-4 leading-none">
              <GlitchText interval={6000}>Enter the Void</GlitchText>
            </h1>
            <p className="text-base md:text-xl text-primary/70 font-mono max-w-2xl mx-auto mb-8 leading-relaxed">
              The world's first immersive quantum digital nightclub. Frequency rooms, XRP rewards,
              cosmic oracle readings & real-time teleportation.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/rooms">
                <motion.div
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black font-bold font-mono text-sm uppercase tracking-widest hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-all cursor-pointer"
                >
                  <Radio className="w-4 h-4" /> Browse Rooms
                </motion.div>
              </Link>
              <motion.button
                onClick={handleShare} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white font-mono text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share the Lounge"}
              </motion.button>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Check-in Form */}
          <Card className="p-6 bg-card/50 backdrop-blur-md border-primary/20 shadow-[0_0_40px_rgba(0,243,255,0.04)] lg:col-span-1 h-fit relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white">Materialize</h2>
                <p className="text-[11px] text-muted-foreground font-mono">Enter the quantum field</p>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">Entity Alias</label>
                <Input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Choose your name..." maxLength={32}
                  className="bg-black/50 border-primary/20 focus:border-primary text-white font-mono h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">Select Vibe</label>
                <div className="flex flex-wrap gap-1.5">
                  {VIBE_PRESETS.map((v) => (
                    <button
                      key={v} type="button"
                      onClick={() => { setVibe(v); setCustomVibe(""); }}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                        vibe === v && !customVibe
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-white/10 bg-white/3 text-muted-foreground hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <Input
                  value={customVibe} onChange={(e) => { setCustomVibe(e.target.value); setVibe(""); }}
                  placeholder="Or write your own vibe..."
                  className="bg-black/40 border-white/10 focus:border-primary/50 text-white font-mono h-9 text-sm mt-1"
                  maxLength={50}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                  Quantum Bio <span className="text-muted-foreground/40">(optional)</span>
                </label>
                <textarea
                  value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the void who you are..."
                  maxLength={280} rows={2}
                  className="w-full bg-black/40 border border-white/10 focus:border-primary/50 text-white font-mono text-sm rounded-md px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/40 transition-colors"
                />
                <div className="text-right text-[10px] font-mono text-muted-foreground/30">{bio.length}/280</div>
              </div>

              <Button
                type="submit"
                disabled={createGuest.isPending || !name || (!vibe && !customVibe)}
                className="w-full bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black transition-all font-display uppercase tracking-widest h-11 mt-2 rounded-xl"
              >
                {createGuest.isPending ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Enter the Lounge
                  </span>
                )}
              </Button>
            </form>

            {/* Social proof */}
            {activeGuests.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 relative z-10"
              >
                <div className="flex -space-x-1">
                  {activeGuests.slice(0, 4).map((g, i) => (
                    <div
                      key={g.id}
                      className={`w-6 h-6 rounded-full border border-background flex items-center justify-center text-[9px] font-bold bg-gradient-to-br ${energyGradients[g.energyLevel] ?? energyGradients.basic}`}
                    >
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {activeGuests.length} in the lounge now
                </span>
              </motion.div>
            )}
          </Card>

          {/* Live Grid */}
          <div className="lg:col-span-2 space-y-8">
            {/* Open Rooms */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-secondary" />
                  <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white">Active Nodes</h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-mono">
                    {openRooms.length} LIVE
                  </span>
                </div>
                <Link href="/rooms">
                  <span className="text-xs text-muted-foreground hover:text-white font-mono flex items-center gap-1 transition-colors cursor-pointer">
                    All rooms <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loadingRooms ? (
                  [1, 2].map((i) => <div key={i} className="h-28 rounded-xl bg-white/3 animate-pulse" />)
                ) : openRooms.length === 0 ? (
                  <div className="md:col-span-2 text-primary/40 font-mono border border-dashed border-primary/15 p-8 text-center rounded-xl text-sm">
                    No frequency nodes currently active
                  </div>
                ) : (
                  <AnimatePresence>
                    {openRooms.slice(0, 4).map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }} whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-xl border border-secondary/20 bg-black/30 hover:bg-secondary/5 hover:border-secondary/40 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-display font-bold text-base text-white group-hover:text-secondary transition-colors">{room.name}</h3>
                          <div className="px-2 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary text-[11px] font-mono">{room.frequency}Hz</div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2 font-mono">{room.theme}</div>
                        <FrequencyWaveform frequency={room.frequency} color="rgb(191,0,255)" barCount={14} height={24} />
                        <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-secondary/60">
                          <span>{room.guestCount}/{room.capacity} entities</span>
                          <Link href="/rooms">
                            <span className="hover:text-white transition-colors">Enter →</span>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white">Entangled Entities</h2>
                </div>
                <Link href="/leaderboard">
                  <span className="text-xs text-muted-foreground hover:text-white font-mono flex items-center gap-1 transition-colors cursor-pointer">
                    Rankings <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>

              <div className="bg-black/20 border border-border/30 rounded-2xl p-4 max-h-[280px] overflow-y-auto space-y-1.5">
                {loadingGuests ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-white/3 animate-pulse" />)
                ) : activeGuests.length === 0 ? (
                  <div className="text-muted-foreground/40 font-mono text-center py-10 text-sm">
                    The void is currently empty. Be the first to materialize.
                  </div>
                ) : (
                  <AnimatePresence>
                    {activeGuests.map((guest) => (
                      <GuestListItem
                        key={guest.id} guest={guest}
                        onNameClick={setProfileGuestId}
                        onCheckOut={(id) => checkOutGuest.mutate({ id, data: { status: "checked_out" } })}
                        checkingOut={checkOutGuest.isPending}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Platform Features Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Radio, label: "Frequency Rooms", desc: "Unique Hz-tuned spaces", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
            { icon: Zap, label: "XRP Rewards", desc: "Earn on every action", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
            { icon: Star, label: "Oracle Readings", desc: "AI-powered cosmic insight", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
            { icon: TrendingUp, label: "Live Rankings", desc: "Compete for #1", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          ].map((f) => (
            <motion.div
              key={f.label} whileHover={{ y: -2 }}
              className={`p-4 rounded-xl border ${f.bg} text-center group cursor-default transition-all`}
            >
              <f.icon className={`w-6 h-6 mx-auto mb-2 ${f.color}`} />
              <div className={`text-sm font-bold ${f.color} mb-0.5`}>{f.label}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{f.desc}</div>
            </motion.div>
          ))}
        </section>

        {/* Live Activity Feed */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Rss className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white">Live Feed</h2>
            <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest animate-pulse">
              Live
            </div>
          </div>

          <div className="bg-black/20 border border-border/30 rounded-2xl p-4 max-h-72 overflow-y-auto">
            {loadingActivity ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="h-10 mb-2 rounded-lg bg-white/3 animate-pulse" />)
            ) : !activity || activity.length === 0 ? (
              <div className="text-primary/40 font-mono text-center py-8 text-sm">Awaiting quantum events...</div>
            ) : (
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {activity.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-card/30 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest shrink-0 ${activityTypeColors[event.type] ?? "text-muted-foreground"}`}>
                        {activityTypeLabels[event.type] ?? event.type}
                      </span>
                      <button
                        onClick={() => { if (event.guestId) setProfileGuestId(event.guestId); }}
                        className="font-bold text-white text-sm hover:text-primary transition-colors cursor-pointer shrink-0"
                      >
                        {event.guestName}
                      </button>
                      <span className="text-muted-foreground text-xs font-mono flex-1 truncate">{event.detail}</span>
                      <span className="text-[10px] font-mono text-white/25 shrink-0 tabular-nums">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </div>

      <GuestProfile guestId={profileGuestId} onClose={() => setProfileGuestId(null)} />
    </div>
  );
}
