import { useListRoomRentals, useCreateRoomRental, useUpdateRoomRental, useDeleteRoomRental, useListRooms, getListRoomRentalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, X } from "lucide-react";

export default function OwnerRentalsPage() {
  const { data: rentals, isLoading } = useListRoomRentals({ query: { queryKey: getListRoomRentalsQueryKey() } });
  const { data: rooms } = useListRooms();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ roomId: 0, renterName: "", eventName: "", startTime: "", endTime: "", notes: "" });

  const createRental = useCreateRoomRental({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRoomRentalsQueryKey() });
        toast({ title: "Rental Booked", description: `${form.eventName} confirmed.` });
        setForm({ roomId: 0, renterName: "", eventName: "", startTime: "", endTime: "", notes: "" });
        setShowForm(false);
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    },
  });

  const updateRental = useUpdateRoomRental({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRoomRentalsQueryKey() }) },
  });

  const deleteRental = useDeleteRoomRental({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListRoomRentalsQueryKey() }) },
  });

  const totalRevenue = (rentals ?? []).filter(r => r.status !== "cancelled").reduce((s, r) => s + r.priceTotal, 0);

  const STATUS_COLORS: Record<string, string> = {
    confirmed: "bg-green-400/15 text-green-400",
    cancelled: "bg-red-400/15 text-red-400",
    completed: "bg-blue-400/15 text-blue-400",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-widest uppercase glow-text-primary mb-1">Room Rentals</h1>
          <p className="text-muted-foreground">${totalRevenue.toFixed(2)} total rental revenue · $50/hr</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-black font-bold uppercase tracking-wider gap-2">
          <Plus className="w-4 h-4" /> Book Rental
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-card/40 border-primary/30 space-y-4">
            <h2 className="font-bold uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> New Rental</h2>
            <select value={form.roomId} onChange={e => setForm(f => ({ ...f, roomId: Number(e.target.value) }))}
              className="w-full rounded-md bg-background/50 border border-border/50 px-3 py-2 text-sm">
              <option value={0}>Select Room</option>
              {(rooms ?? []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Renter name" value={form.renterName} onChange={e => setForm(f => ({ ...f, renterName: e.target.value }))} className="bg-background/50 border-border/50" />
              <Input placeholder="Event name" value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} className="bg-background/50 border-border/50" />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                <Input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="bg-background/50 border-border/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End</label>
                <Input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="bg-background/50 border-border/50" />
              </div>
            </div>
            <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-background/50 border-border/50" />
            <div className="flex gap-3">
              <Button onClick={() => createRental.mutate({ data: { roomId: form.roomId, renterName: form.renterName, eventName: form.eventName, startTime: form.startTime, endTime: form.endTime, notes: form.notes || null } })}
                disabled={createRental.isPending || !form.roomId || !form.renterName || !form.eventName || !form.startTime || !form.endTime}
                className="flex-1 bg-primary text-black font-bold uppercase tracking-wider">
                {createRental.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}><X className="w-4 h-4" /></Button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />)
          : (rentals ?? []).length === 0
          ? <Card className="p-8 bg-card/20 border-border/30 text-center text-muted-foreground">No rentals yet.</Card>
          : (rentals ?? []).map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`p-4 bg-card/40 border-border/50 flex items-start justify-between ${r.status === "cancelled" ? "opacity-50" : ""}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="font-bold">{r.eventName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? ""}`}>{r.status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{r.renterName} · {r.roomName}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.startTime).toLocaleString()} → {new Date(r.endTime).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-primary">${r.priceTotal.toFixed(2)}</span>
                  {r.status === "confirmed" && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => updateRental.mutate({ id: r.id, data: { status: "completed" } })} className="text-xs text-blue-400 hover:text-blue-300 h-7 px-2">Done</Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteRental.mutate({ id: r.id })} className="text-xs hover:text-destructive h-7 px-2"><X className="w-3 h-3" /></Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
