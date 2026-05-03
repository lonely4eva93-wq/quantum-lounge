import { useListGuests, useUpdateGuest, useDeleteGuest, getListGuestsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Trash2, Activity, Zap, Radio } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GuestProfile } from "@/components/guest-profile";

export default function OwnerGuests() {
  const { data: guests, isLoading } = useListGuests();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [newStatus, setNewStatus] = useState<string>("active");
  const [profileGuestId, setProfileGuestId] = useState<number | null>(null);

  const updateGuest = useUpdateGuest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        toast({
          title: "Entity Updated",
          description: "Quantum state has been modified.",
        });
      }
    }
  });

  const deleteGuest = useDeleteGuest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestsQueryKey() });
        toast({
          title: "Entity Expunged",
          description: "Particle has been permanently removed from the lounge.",
        });
      }
    }
  });

  const handleUpdateStatus = (guestId: number, status: string) => {
    updateGuest.mutate({
      id: guestId,
      data: { status }
    });
  };

  const handleDelete = (guestId: number) => {
    if(confirm("Expunge this entity? This cannot be undone.")) {
      deleteGuest.mutate({ id: guestId });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Entity Roster
          </h1>
          <p className="text-muted-foreground font-mono">Monitor and modify guest quantum states.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-primary/50 font-mono animate-pulse">
            Scanning particle signatures...
          </div>
        ) : guests?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-primary/20 rounded-2xl bg-primary/5">
            <Radio className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <p className="text-primary/70 font-mono uppercase tracking-widest">No entities detected.</p>
          </div>
        ) : (
          guests?.map((guest) => (
            <Card key={guest.id} className="p-6 bg-card/40 border-primary/20 backdrop-blur-md">
              <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                    onClick={() => setProfileGuestId(guest.id)}
                    className="text-xl font-bold text-white font-display uppercase tracking-wider hover:text-primary transition-colors cursor-pointer"
                  >
                    {guest.name}
                  </button>
                    <div className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      guest.status === 'active' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted border-border text-muted-foreground'
                    }`}>
                      {guest.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-accent" /> {guest.energyLevel}
                    </span>
                    <span>•</span>
                    <span>Vibe: {guest.vibe}</span>
                    <span>•</span>
                    <span>Vector: {guest.roomName || 'Lobby'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-mono border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Arrived:</div>
                    <div className="text-white">{format(new Date(guest.checkedInAt), "HH:mm:ss")}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Fee Paid:</div>
                    <div className="text-primary">¤{guest.feePaid}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {guest.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(guest.id, 'checked_out')}
                        className="bg-black/50 border-secondary/50 text-secondary hover:bg-secondary hover:text-black font-display uppercase text-xs"
                      >
                        Check Out
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(guest.id)}
                      className="bg-destructive/20 text-destructive border border-destructive/50 hover:bg-destructive hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <GuestProfile guestId={profileGuestId} onClose={() => setProfileGuestId(null)} />
    </div>
  );
}
