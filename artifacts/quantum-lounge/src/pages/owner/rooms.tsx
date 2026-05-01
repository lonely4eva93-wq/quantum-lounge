import { useListRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, getListRoomsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Grid, Plus, Edit2, Trash2, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function OwnerRooms() {
  const { data: rooms, isLoading } = useListRooms();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [frequency, setFrequency] = useState(432);
  const [capacity, setCapacity] = useState(10);
  const [isRoomOpen, setIsRoomOpen] = useState(true);

  const createRoom = useCreateRoom({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey() });
        toast({ title: "Vector Created", description: "New dimensional space initialized." });
        setIsOpen(false);
        resetForm();
      }
    }
  });

  const updateRoom = useUpdateRoom({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey() });
        toast({ title: "Vector Updated", description: "Dimensional parameters modified." });
        setIsOpen(false);
        setEditingRoom(null);
        resetForm();
      }
    }
  });

  const deleteRoom = useDeleteRoom({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRoomsQueryKey() });
        toast({ title: "Vector Collapsed", description: "Space has been permanently closed." });
      }
    }
  });

  const resetForm = () => {
    setName("");
    setTheme("");
    setFrequency(432);
    setCapacity(10);
    setIsRoomOpen(true);
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setName(room.name);
    setTheme(room.theme);
    setFrequency(room.frequency);
    setCapacity(room.capacity);
    setIsRoomOpen(room.isOpen);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoom.mutate({
        id: editingRoom.id,
        data: { name, theme, frequency, capacity, isOpen: isRoomOpen }
      });
    } else {
      createRoom.mutate({
        data: { name, theme, frequency, capacity, isOpen: isRoomOpen }
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-3">
            <Grid className="w-8 h-8 text-secondary" /> Vector Control
          </h1>
          <p className="text-muted-foreground font-mono">Manage dimensional spaces and frequencies.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if(!open) { setEditingRoom(null); resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-secondary/20 text-secondary border border-secondary hover:bg-secondary hover:text-black font-display uppercase tracking-widest">
              <Plus className="w-4 h-4 mr-2" /> New Vector
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-secondary/30 backdrop-blur-xl text-white">
            <DialogHeader>
              <DialogTitle className="font-display uppercase tracking-widest text-secondary glow-text-secondary">
                {editingRoom ? "Modify Vector" : "Initialize Vector"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-secondary/70 uppercase tracking-widest">Designation</label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="bg-black/50 border-secondary/30 focus:border-secondary font-mono" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-secondary/70 uppercase tracking-widest">Theme / Vibe</label>
                <Input value={theme} onChange={e => setTheme(e.target.value)} required className="bg-black/50 border-secondary/30 focus:border-secondary font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-secondary/70 uppercase tracking-widest">Frequency (Hz)</label>
                  <Input type="number" value={frequency} onChange={e => setFrequency(Number(e.target.value))} required className="bg-black/50 border-secondary/30 focus:border-secondary font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-secondary/70 uppercase tracking-widest">Max Entities</label>
                  <Input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} required className="bg-black/50 border-secondary/30 focus:border-secondary font-mono" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-secondary/30 rounded bg-black/30 mt-4">
                <span className="font-mono text-sm">Status</span>
                <Button type="button" variant="outline" onClick={() => setIsRoomOpen(!isRoomOpen)}
                  className={isRoomOpen ? "bg-primary/20 text-primary border-primary" : "bg-destructive/20 text-destructive border-destructive"}>
                  {isRoomOpen ? "OPEN" : "LOCKED"}
                </Button>
              </div>
              <Button type="submit" disabled={createRoom.isPending || updateRoom.isPending} className="w-full bg-secondary/20 text-secondary border border-secondary hover:bg-secondary hover:text-black font-display uppercase tracking-widest mt-4">
                {editingRoom ? "Save Modifications" : "Initialize"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-secondary/50 font-mono animate-pulse">
            Scanning dimension geometry...
          </div>
        ) : rooms?.length === 0 ? (
          <div className="col-span-full text-center py-20 border border-dashed border-secondary/20 rounded-2xl bg-secondary/5">
            <Radio className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
            <p className="text-secondary/70 font-mono uppercase tracking-widest">No vectors initialized.</p>
          </div>
        ) : (
          rooms?.map((room) => (
            <Card key={room.id} className="p-6 bg-card/40 border-secondary/20 backdrop-blur-md hover:border-secondary/40 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-display uppercase tracking-wider">{room.name}</h3>
                  <div className="text-sm font-mono text-muted-foreground">{room.theme}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-mono font-bold border ${room.isOpen ? 'bg-primary/10 text-primary border-primary/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                  {room.isOpen ? 'OPEN' : 'LOCKED'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-white/5 text-sm font-mono">
                <div>
                  <div className="text-muted-foreground text-xs uppercase mb-1">Freq</div>
                  <div className="text-secondary">{room.frequency}Hz</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs uppercase mb-1">Capacity</div>
                  <div className="text-white">{room.guestCount}/{room.capacity}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(room)} className="bg-black/50 border-white/10 hover:border-secondary/50 hover:text-secondary">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { if(confirm("Collapse this vector? All entities inside will be displaced.")) deleteRoom.mutate({ id: room.id }) }} className="bg-destructive/10 border-destructive/50 hover:bg-destructive text-destructive hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
