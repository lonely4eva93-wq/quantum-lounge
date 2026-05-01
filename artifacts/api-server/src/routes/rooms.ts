import { Router } from "express";
import { db, roomsTable, guestsTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const rooms = await db.select().from(roomsTable).orderBy(roomsTable.createdAt);
  const result = await Promise.all(
    rooms.map(async (room) => {
      const [{ guestCount }] = await db
        .select({ guestCount: count() })
        .from(guestsTable)
        .where(and(eq(guestsTable.roomId, room.id), eq(guestsTable.status, "active")));
      return { ...room, guestCount: Number(guestCount) };
    }),
  );
  return res.json(result);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, id));
  if (!room) return res.status(404).json({ error: "Room not found" });
  const [{ guestCount }] = await db
    .select({ guestCount: count() })
    .from(guestsTable)
    .where(and(eq(guestsTable.roomId, id), eq(guestsTable.status, "active")));
  return res.json({ ...room, guestCount: Number(guestCount) });
});

router.post("/", async (req, res) => {
  const { name, theme, frequency, capacity, isOpen } = req.body;
  const [room] = await db
    .insert(roomsTable)
    .values({ name, theme, frequency, capacity, isOpen: isOpen ?? true })
    .returning();
  return res.status(201).json({ ...room, guestCount: 0 });
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, theme, frequency, capacity, isOpen } = req.body;
  const updates: Partial<typeof roomsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (theme !== undefined) updates.theme = theme;
  if (frequency !== undefined) updates.frequency = frequency;
  if (capacity !== undefined) updates.capacity = capacity;
  if (isOpen !== undefined) updates.isOpen = isOpen;
  const [room] = await db.update(roomsTable).set(updates).where(eq(roomsTable.id, id)).returning();
  if (!room) return res.status(404).json({ error: "Room not found" });
  const [{ guestCount }] = await db
    .select({ guestCount: count() })
    .from(guestsTable)
    .where(and(eq(guestsTable.roomId, id), eq(guestsTable.status, "active")));
  return res.json({ ...room, guestCount: Number(guestCount) });
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(roomsTable).where(eq(roomsTable.id, id));
  return res.status(204).send();
});

export default router;
