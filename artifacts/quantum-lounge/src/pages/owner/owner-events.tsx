import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useListRooms } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoomEvent {
  id: number;
  name: string;
  description: string;
  roomId: number | null;
  roomName: string | null;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
}

export default function OwnerEvents() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: rooms } = useListRooms();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roomId, setRoomId] = useState<string>("none");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: events, isLoading } = useQuery<RoomEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createEvent = useMutation({
    mutationFn: async (body: object) => {
      const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event Scheduled", description: "The quantum ceremony has been registered." });
      setName(""); setDescription(""); setRoomId("none"); setStartTime(""); setEndTime("");
    },
    onError: () => toast({ title: "Error", description: "Failed to create event.", variant: "destructive" }),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startTime) return;
    createEvent.mutate({
      name,
      description,
      roomId: roomId === "none" ? null : parseInt(roomId),
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : null,
      isActive: true,
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-secondary" /> Events
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">Schedule quantum ceremonies and room transmissions</p>
      </div>

      <Card className="p-6 bg-card/40 border-primary/20">
        <h2 className="text-sm font-mono uppercase tracking-widest text-primary mb-5">Schedule New Event</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input placeholder="Event name" value={name} onChange={(e) => setName(e.target.value)} className="bg-black/30 border-white/10 font-mono" required />
          </div>
          <div className="md:col-span-2">
            <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-black/30 border-white/10 font-mono" />
          </div>
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger className="bg-black/30 border-white/10 font-mono">
              <SelectValue placeholder="Select room (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No specific room</SelectItem>
              {rooms?.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div />
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">Start Time</label>
            <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-black/30 border-white/10 font-mono" required />
          </div>
          <div>
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest block mb-1">End Time (optional)</label>
            <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-black/30 border-white/10 font-mono" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={createEvent.isPending} className="bg-secondary/20 border border-secondary/40 text-secondary hover:bg-secondary/30 font-mono uppercase tracking-widest">
              <Plus className="w-4 h-4 mr-2" /> Schedule Event
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)
        ) : events?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-mono">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />No events scheduled.
          </div>
        ) : (
          events?.map((event, idx) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="p-4 bg-card/30 border-white/5 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-mono font-bold text-white">{event.name}</div>
                    {event.description && <div className="text-xs text-muted-foreground font-mono mt-0.5">{event.description}</div>}
                    <div className="flex items-center gap-3 mt-1 text-xs font-mono text-primary/60">
                      {event.roomName && <span>{event.roomName}</span>}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(event.startTime).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteEvent.mutate(event.id)} className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
