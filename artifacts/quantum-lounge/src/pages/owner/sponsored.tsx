import { useListSponsoredRooms, useCreateSponsoredRoom, useDeleteSponsoredRoom, useListRooms, getListSponsoredRoomsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Plus, X } from "lucide-react";

export default function OwnerSponsoredPage() {
  const { data: sponsors, isLoading } = useListSponsoredRooms({ query: { queryKey: getListSponsoredRoomsQueryKey() } });
  const { data: rooms } = useListRooms();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roomId: 0, sponsorName: "", brandColor: "#7C3AED", tagline: "", pricePerMonth: 299 });

  const createSponsor = useCreateSponsoredRoom({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSponsoredRoomsQueryKey() });
        toast({ title: "Sponsorship Created", description: `${form.sponsorName} is now sponsoring the room.` });
        setForm({ roomId: 0, sponsorName: "", brandColor: "#7C3AED", tagline: "", pricePerMonth: 299 });
        setShowForm(false);
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    },
  });

  const endSponsor = useDeleteSponsoredRoom({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSponsoredRoomsQueryKey() }) },
  });

  const activeSponsors = (sponsors ?? []).filter(s => s.status === "active");
  const monthlyRevenue = activeSponsors.reduce((sum, s) => sum + s.pricePerMonth, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-widest uppercase glow-text-primary mb-1">Sponsored Rooms</h1>
          <p className="text-muted-foreground">{activeSponsors.length} active · ${monthlyRevenue.toFixed(2)}/mo</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-black font-bold uppercase tracking-wider gap-2">
          <Plus className="w-4 h-4" /> Add Sponsor
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-card/40 border-primary/30 space-y-4">
            <h2 className="font-bold uppercase tracking-wider flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> New Sponsorship</h2>
            <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: Number(e.target.value) }))}
              className="w-full rounded-md bg-background/50 border border-border/50 px-3 py-2 text-sm">
              <option value={0}>Select Room</option>
              {(rooms ?? []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Sponsor/brand name" value={form.sponsorName} onChange={e => setForm(f => ({ ...f, sponsorName: e.target.value }))} className="bg-background/50 border-border/50" />
              <Input placeholder="Tagline" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} className="bg-background/50 border-border/50" />
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground w-24">Brand Color</label>
                <input type="color" value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} className="h-9 w-16 rounded border border-border/50 bg-background/50 cursor-pointer" />
                <span className="text-xs font-mono text-muted-foreground">{form.brandColor}</span>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price/month ($)</label>
                <Input type="number" value={form.pricePerMonth} onChange={e => setForm(f => ({ ...f, pricePerMonth: Number(e.target.value) }))} className="bg-background/50 border-border/50" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createSponsor.mutate({ data: { roomId: form.roomId, sponsorName: form.sponsorName, brandColor: form.brandColor, tagline: form.tagline, pricePerMonth: form.pricePerMonth } })}
                disabled={createSponsor.isPending || !form.roomId || !form.sponsorName || !form.tagline}
                className="flex-1 bg-primary text-black font-bold uppercase tracking-wider">
                {createSponsor.isPending ? "Creating..." : "Create Sponsorship"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        {isLoading
          ? [1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />)
          : (sponsors ?? []).length === 0
          ? <Card className="p-8 bg-card/20 border-border/30 text-center text-muted-foreground">No sponsorships yet.</Card>
          : (sponsors ?? []).map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-4 bg-card/40 border-border/50 flex items-center justify-between ${s.status !== "active" ? "opacity-50" : ""}`}
                style={{ borderLeftColor: s.brandColor, borderLeftWidth: "3px" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" style={{ color: s.brandColor }} />
                    <span className="font-bold">{s.sponsorName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-green-400/15 text-green-400" : "bg-red-400/15 text-red-400"}`}>{s.status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{s.tagline} · {s.roomName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary">${s.pricePerMonth.toFixed(2)}/mo</span>
                  {s.status === "active" && (
                    <Button variant="ghost" size="sm" onClick={() => endSponsor.mutate({ id: s.id })} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
