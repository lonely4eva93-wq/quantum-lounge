import { useListMessages, useSendMessage, getListMessagesQueryKey, useListRooms, useListGuests } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { GlitchText } from "@/components/glitch-text";
import { GuestProfile } from "@/components/guest-profile";

export default function Messages() {
  const { data: messages, isLoading: loadingMessages } = useListMessages();
  const { data: rooms } = useListRooms();
  const { data: guests } = useListGuests();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [senderId, setSenderId] = useState<string>("");
  const [content, setContent] = useState("");
  const [roomId, setRoomId] = useState<string>("global");
  const [profileGuestId, setProfileGuestId] = useState<number | null>(null);

  const activeGuests = guests?.filter(g => g.status === "active") || [];
  const openRooms = rooms?.filter(r => r.isOpen) || [];

  const sendMessage = useSendMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
        setContent("");
        toast({
          title: "Transmission Sent",
          description: "Quantum signal broadcast successful.",
        });
      }
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderId || !content) return;

    const guest = activeGuests.find(g => g.id.toString() === senderId);
    if (!guest) return;

    sendMessage.mutate({
      data: {
        senderName: guest.name,
        content,
        roomId: roomId === "global" ? undefined : Number(roomId),
      }
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-widest text-white mb-2 flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-primary glow-text-primary" />
            <span className="glow-text-primary">
              <GlitchText interval={7000}>Comms Array</GlitchText>
            </span>
          </h1>
          <p className="text-primary/70 font-mono">Real-time quantum-encrypted transmissions.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        {/* Transmission Form */}
        <Card className="p-6 bg-card/40 backdrop-blur-md border-primary/20 h-fit md:w-80 shrink-0">
          <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> Broadcast
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">
                Transmitter Entity
              </label>
              <Select value={senderId} onValueChange={setSenderId}>
                <SelectTrigger className="bg-black/50 border-primary/30 text-white font-mono">
                  <SelectValue placeholder="Identify sender..." />
                </SelectTrigger>
                <SelectContent className="bg-black border-primary/30 text-white">
                  {activeGuests.map(g => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">
                Target Frequency
              </label>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger className="bg-black/50 border-primary/30 text-white font-mono">
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent className="bg-black border-primary/30 text-white">
                  <SelectItem value="global">Global Feed</SelectItem>
                  {openRooms.map(r => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-widest">
                Payload
              </label>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter signal data..."
                className="bg-black/50 border-primary/30 text-white font-mono focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={sendMessage.isPending || !senderId || !content}
              className="w-full bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black transition-all font-display uppercase tracking-widest mt-4"
            >
              {sendMessage.isPending ? "Transmitting..." : "Send Signal"}
            </Button>
          </form>
        </Card>

        {/* Message Feed */}
        <div className="flex-1 bg-black/40 border border-primary/20 rounded-xl p-6 overflow-y-auto relative flex flex-col gap-4 scroll-smooth">
          {loadingMessages ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card/50 border border-primary/10 rounded-lg p-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-l" />
                  <div className="pl-3 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28 bg-white/5 rounded" />
                      <Skeleton className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                    <Skeleton className="h-4 w-full bg-white/5 rounded" />
                    <Skeleton className="h-4 w-2/3 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages?.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-primary/50 font-mono">
              <Shield className="w-12 h-12 mb-4 opacity-20" />
              <p>Frequency is silent.</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages?.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card/50 border border-primary/10 rounded-lg p-4 hover:border-primary/30 transition-colors group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent" />
                  
                  <div className="flex justify-between items-start mb-2 pl-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const guest = guests?.find(g => g.name === msg.senderName);
                          if (guest) setProfileGuestId(guest.id);
                        }}
                        className="font-bold text-white tracking-wide hover:text-primary transition-colors cursor-pointer"
                      >
                        {msg.senderName}
                      </button>
                      {msg.roomName && (
                        <span className="text-xs font-mono text-secondary px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20">
                          {msg.roomName}
                        </span>
                      )}
                      {!msg.roomName && (
                        <span className="text-xs font-mono text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                          GLOBAL
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {format(new Date(msg.sentAt), "HH:mm:ss.SSS")}
                    </span>
                  </div>

                  <p className="text-white/90 pl-3 mb-3 leading-relaxed">
                    {msg.content}
                  </p>

                  <div className="flex items-center gap-2 pl-3 text-[10px] font-mono text-primary/40 border-t border-primary/10 pt-2 group-hover:text-primary/70 transition-colors">
                    <Zap className="w-3 h-3" />
                    <span>SIG: {msg.quantumSignature}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      ENCRYPTED
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <GuestProfile guestId={profileGuestId} onClose={() => setProfileGuestId(null)} />
    </div>
  );
}
