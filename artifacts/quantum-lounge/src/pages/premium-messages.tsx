import { useListPremiumMessages, useSendPremiumMessage, getListPremiumMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Lock, Send, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PremiumMessagesPage() {
  const { data: messages, isLoading } = useListPremiumMessages({ query: { queryKey: getListPremiumMessagesQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [content, setContent] = useState("");
  const [viewerName, setViewerName] = useState("");

  const sendMsg = useSendPremiumMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPremiumMessagesQueryKey() });
        toast({ title: "Message Sent", description: "Your encrypted quantum message has been delivered." });
        setFrom(""); setTo(""); setContent("");
      },
      onError: (err: any) => toast({ title: "Send Failed", description: err.message, variant: "destructive" }),
    },
  });

  const myMessages = (messages ?? []).filter(
    (m) => viewerName && (m.fromGuestName === viewerName || m.toGuestName === viewerName)
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Lock className="w-8 h-8 text-primary" />
          <h1 className="font-display text-4xl font-bold tracking-widest uppercase glow-text-primary">Premium DM</h1>
        </div>
        <p className="text-muted-foreground">Encrypted quantum-signed direct messages. $0.99 per message.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 bg-card/40 border-border/50 space-y-4">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-primary" />
            <h2 className="font-bold uppercase tracking-wider">Send Encrypted Message</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Your name" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-background/50 border-border/50" />
            <Input placeholder="Recipient name" value={to} onChange={(e) => setTo(e.target.value)} className="bg-background/50 border-border/50" />
          </div>
          <textarea
            placeholder="Your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-md bg-background/50 border border-border/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <Button
            onClick={() => sendMsg.mutate({ data: { fromGuestName: from.trim(), toGuestName: to.trim(), content: content.trim() } })}
            disabled={sendMsg.isPending || !from.trim() || !to.trim() || !content.trim()}
            className="w-full bg-primary text-black font-bold uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-all"
          >
            {sendMsg.isPending ? "Encrypting..." : "Send for $0.99"}
          </Button>
        </Card>
      </motion.div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <Inbox className="w-5 h-5 text-secondary" />
          <h2 className="font-bold uppercase tracking-wider">View My Messages</h2>
          <Input
            placeholder="Enter your name"
            value={viewerName}
            onChange={(e) => setViewerName(e.target.value)}
            className="ml-auto w-40 bg-background/50 border-border/50 text-sm h-8"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-lg bg-white/5" />)}</div>
        ) : !viewerName ? (
          <Card className="p-6 bg-card/20 border-border/30 text-center text-muted-foreground">Enter your name above to view your messages.</Card>
        ) : myMessages.length === 0 ? (
          <Card className="p-6 bg-card/20 border-border/30 text-center text-muted-foreground">No premium messages found for "{viewerName}"</Card>
        ) : (
          <div className="space-y-3">
            {myMessages.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`p-4 bg-card/40 border-border/50 space-y-2 ${m.fromGuestName === viewerName ? "border-l-2 border-l-primary" : "border-l-2 border-l-secondary"}`}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{m.fromGuestName === viewerName ? "Sent to" : "From"}: <strong className="text-foreground">{m.fromGuestName === viewerName ? m.toGuestName : m.fromGuestName}</strong></span>
                    <span className="font-mono text-xs text-primary/60">{m.quantumSignature}</span>
                  </div>
                  <p className="text-sm text-foreground">{m.content}</p>
                  <div className="text-xs text-muted-foreground">{new Date(m.sentAt).toLocaleString()}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
