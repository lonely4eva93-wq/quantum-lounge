import { Router } from "express";
import { db, roomEventsTable, roomsTable } from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { insertRoomEventSchema } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  const events = await db
    .select({
      id: roomEventsTable.id,
      name: roomEventsTable.name,
      description: roomEventsTable.description,
      roomId: roomEventsTable.roomId,
      roomName: roomsTable.name,
      startTime: roomEventsTable.startTime,
      endTime: roomEventsTable.endTime,
      isActive: roomEventsTable.isActive,
      createdAt: roomEventsTable.createdAt,
    })
    .from(roomEventsTable)
    .leftJoin(roomsTable, eq(roomEventsTable.roomId, roomsTable.id))
    .orderBy(roomEventsTable.startTime);
  return res.json(events);
});

router.post("/", async (req, res) => {
  const parsed = insertRoomEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const [event] = await db.insert(roomEventsTable).values(parsed.data).returning();
  return res.json(event);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
  await db.delete(roomEventsTable).where(eq(roomEventsTable.id, id));
  return res.json({ success: true });
});

export default router;
