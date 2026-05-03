import { useGetGuest, useListGuestUpgrades, useListTeleportHistory, getGetGuestQueryKey, getListGuestUpgradesQueryKey, getListTeleportHistoryQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ArrowRightLeft, ShoppingBag, User } from "lucide-react";
import { format } from "date-fns";

interface GuestProfileProps {
  guestId: number | null;
  onClose: () => void;
}

export function GuestProfile({ guestId, onClose }: GuestProfileProps) {
  const { data: guest } = useGetGuest(guestId ?? 0, { query: { enabled: !!guestId, queryKey: getGetGuestQueryKey(guestId ?? 0) } });
  const { data: allUpgrades } = useListGuestUpgrades({ query: { enabled: !!guestId, queryKey: getListGuestUpgradesQueryKey() } });
  const { data: allTeleports } = useListTeleportHistory({ query: { enabled: !!guestId, queryKey: getListTeleportHistoryQueryKey() } });

  const upgrades = allUpgrades?.filter((u) => u.guestId === guestId) ?? [];
  const teleports = allTeleports?.filter((t) => t.guestId === guestId) ?? [];

  const energyColors: Record<string, string> = {
    basic: "text-muted-foreground",
    charged: "text-accent",
    quantum: "text-primary",
    transcended: "text-secondary",
  };

  return (
    <AnimatePresence>
      {guestId !== null && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-primary/30 z-50 flex flex-col overflow-hidden shadow-[-20px_0_60px_rgba(0,243,255,0.1)]"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-white tracking-wider">
                    {guest?.name ?? "Loading..."}
                  </h2>
                  <div className={`text-xs font-mono uppercase tracking-widest ${energyColors[guest?.energyLevel ?? "basic"]}`}>
                    {guest?.energyLevel ?? "—"}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {guest && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Vibe</div>
                    <div className="text-sm text-white font-mono">{guest.vibe}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Location</div>
                    <div className="text-sm text-white font-mono">{guest.roomName ?? "Lobby"}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Status</div>
                    <div className={`text-sm font-mono uppercase ${guest.status === "active" ? "text-green-400" : "text-muted-foreground"}`}>
                      {guest.status}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Fee Paid</div>
                    <div className="text-sm text-white font-mono">¤{guest.feePaid}</div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Upgrades ({upgrades.length})
                </h3>
                {upgrades.length === 0 ? (
                  <div className="text-xs font-mono text-muted-foreground text-center py-4 border border-dashed border-white/10 rounded-lg">
                    No upgrades acquired
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upgrades.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-primary/10">
                        <div>
                          <div className="text-sm font-bold text-white">{u.upgradeName}</div>
                          <div className="text-xs font-mono text-muted-foreground uppercase">{u.level}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-primary">¤{u.amountPaid}</div>
                          <div className="text-xs font-mono text-muted-foreground">
                            {format(new Date(u.purchasedAt), "MMM d, HH:mm")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" /> Teleport History ({teleports.length})
                </h3>
                {teleports.length === 0 ? (
                  <div className="text-xs font-mono text-muted-foreground text-center py-4 border border-dashed border-white/10 rounded-lg">
                    No teleport events
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teleports.slice().reverse().map((t) => (
                      <div key={t.id} className="p-3 rounded-lg bg-black/30 border border-accent/10">
                        <div className="flex items-center gap-2 text-sm font-mono text-accent/80 mb-1">
                          <span className="flex-1 truncate text-muted-foreground">{t.fromRoomName ?? "Lobby"}</span>
                          <ArrowRightLeft className="w-3 h-3 shrink-0" />
                          <span className="flex-1 truncate text-right text-white">{t.toRoomName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono text-muted-foreground">
                            {format(new Date(t.teleportedAt), "MMM d, HH:mm:ss")}
                          </span>
                          <span className="text-xs font-mono text-accent/60">Δ{t.quantumShift}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Check-in
                </h3>
                {guest && (
                  <div className="text-xs font-mono text-muted-foreground p-3 bg-black/20 rounded-lg border border-white/5">
                    {format(new Date(guest.checkedInAt), "MMM d, yyyy HH:mm:ss")}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
