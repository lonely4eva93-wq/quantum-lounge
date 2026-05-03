import { Router } from "express";
import { db, roomChatTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { insertChatSchema } from "@workspace/db";

const router = Router();

router.get("/:roomId", async (req, res) => {
  const roomId = parseInt(req.params.roomId);
  if (isNaN(roomId)) return res.status(400).json({ error: "Invalid room ID" });
  const messages = await db
    .select()
    .from(roomChatTable)
    .where(eq(roomChatTable.roomId, roomId))
    .orderBy(roomChatTable.sentAt)
    .limit(50);
  return res.json(messages);
});

router.post("/", async (req, res) => {
  const parsed = insertChatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const [msg] = await db.insert(roomChatTable).values(parsed.data).returning();

  // Broadcast to WebSocket clients in this room
  const wss = (req as any).app.locals.wss;
  if (wss) {
    wss.clients.forEach((client: any) => {
      if (client.readyState === 1 && client.roomId === parsed.data.roomId) {
        client.send(JSON.stringify({ type: "chat", payload: msg }));
      }
    });
  }

  return res.json(msg);
});

export default router;
