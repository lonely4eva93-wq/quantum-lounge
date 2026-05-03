import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  guestName: string;
  message: string;
  sentAt: string;
  roomId: number;
  self?: boolean;
  id?: string;
}

interface RoomChatProps {
  roomId: number;
  roomName: string;
  guestName?: string;
}

export function RoomChat({ roomId, roomName, guestName = "Guest" }: RoomChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const url = `${protocol}://${host}/api/ws?roomId=${roomId}&guestName=${encodeURIComponent(guestName)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000); // reconnect
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "chat") {
          const msg: ChatMessage = { ...data.payload, id: `${Date.now()}-${Math.random()}` };
          setMessages((prev) => [...prev.slice(-99), msg]);
          if (!open) setUnread((n) => n + 1);
        }
      } catch { /* ignore */ }
    };
  }, [roomId, guestName, open]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [roomId]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, messages]);

  const send = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "chat", message: input.trim() }));
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-xs font-mono uppercase tracking-widest"
      >
        <MessageCircle className="w-4 h-4" />
        Chat
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-secondary text-[10px] font-bold flex items-center justify-center text-white">
            {unread}
          </span>
        )}
        <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 z-50 rounded-2xl border border-primary/30 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,243,255,0.1)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-primary/5">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary">{roomName}</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-xs text-center">
                  <div>
                    <MessageCircle className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    No messages yet. Say something.
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id ?? idx}
                    initial={{ opacity: 0, x: msg.self ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${msg.self ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground mb-0.5">{msg.guestName}</span>
                    <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-xs font-mono ${
                      msg.self
                        ? "bg-primary/20 border border-primary/30 text-primary"
                        : "bg-white/5 border border-white/10 text-white"
                    }`}>
                      {msg.message}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 p-3 border-t border-white/5">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Transmit..."
                className="bg-black/30 border-white/10 text-xs font-mono h-8"
                maxLength={200}
              />
              <Button size="sm" onClick={send} disabled={!input.trim() || !connected} className="h-8 w-8 p-0 bg-primary/20 border border-primary/30 hover:bg-primary/30">
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
