import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/api/ws" });

// Store wss on app.locals so routes can broadcast
app.locals.wss = wss;

interface QuantumClient extends WebSocket {
  roomId?: number;
  guestName?: string;
}

wss.on("connection", (ws: QuantumClient, req) => {
  const url = new URL(req.url ?? "", `http://localhost`);
  const roomId = parseInt(url.searchParams.get("roomId") ?? "");
  const guestName = url.searchParams.get("guestName") ?? "Anonymous";

  if (!isNaN(roomId)) {
    ws.roomId = roomId;
    ws.guestName = guestName;
  }

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }
      // Broadcast chat to all clients in same room
      if (data.type === "chat" && ws.roomId) {
        const payload = JSON.stringify({
          type: "chat",
          payload: {
            guestName: ws.guestName,
            message: data.message,
            sentAt: new Date().toISOString(),
            roomId: ws.roomId,
          },
        });
        wss.clients.forEach((client: QuantumClient) => {
          if (client !== ws && client.readyState === WebSocket.OPEN && client.roomId === ws.roomId) {
            client.send(payload);
          }
        });
        // Echo back to sender with confirmation
        ws.send(JSON.stringify({
          type: "chat",
          payload: {
            guestName: ws.guestName,
            message: data.message,
            sentAt: new Date().toISOString(),
            roomId: ws.roomId,
            self: true,
          },
        }));
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on("error", (err) => logger.error({ err }, "WebSocket error"));
});

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
