import { Router } from "express";
import { db, messagesTable, roomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function generateQuantumSignature(): string {
  return "QS-" + crypto.randomBytes(8).toString("hex").toUpperCase();
}

async function withRoom(msg: typeof messagesTable.$inferSelect) {
  if (!msg.roomId) return { ...msg, roomName: null };
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, msg.roomId));
  return { ...msg, roomName: room?.name ?? null };
}

router.get("/", async (req, res) => {
  const roomId = req.query.roomId ? Number(req.query.roomId) : undefined;
  const messages = roomId
    ? await db.select().from(messagesTable).where(eq(messagesTable.roomId, roomId)).orderBy(messagesTable.sentAt)
    : await db.select().from(messagesTable).orderBy(messagesTable.sentAt);
  return res.json(await Promise.all(messages.map(withRoom)));
});

router.post("/", async (req, res) => {
  const { senderName, content, roomId } = req.body;
  const [msg] = await db
    .insert(messagesTable)
    .values({
      senderName,
      content,
      roomId: roomId ?? null,
      isEncrypted: true,
      quantumSignature: generateQuantumSignature(),
    })
    .returning();
  return res.status(201).json(await withRoom(msg));
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(messagesTable).where(eq(messagesTable.id, id));
  return res.status(204).send();
});

export default router;
