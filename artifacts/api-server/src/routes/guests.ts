import { Router } from "express";
import { db, guestsTable, roomsTable, transactionsTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function withRoom(guest: typeof guestsTable.$inferSelect) {
  if (!guest.roomId) return { ...guest, roomName: null };
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, guest.roomId));
  return { ...guest, roomName: room?.name ?? null };
}

router.get("/", async (_req, res) => {
  const guests = await db.select().from(guestsTable).orderBy(guestsTable.checkedInAt);
  const result = await Promise.all(guests.map(withRoom));
  return res.json(result);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.id, id));
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  return res.json(await withRoom(guest));
});

router.post("/", async (req, res) => {
  const { name, vibe, roomId } = req.body;
  const settings = await db.select().from(settingsTable).limit(1);
  const houseFee = settings[0]?.houseFee ?? 15;

  const [guest] = await db
    .insert(guestsTable)
    .values({ name, vibe, roomId: roomId ?? null, feePaid: houseFee, status: "active", energyLevel: "basic" })
    .returning();

  await db.insert(transactionsTable).values({
    type: "house_fee",
    amount: houseFee,
    description: `House fee for ${name}`,
    guestId: guest.id,
    status: "completed",
  });

  return res.status(201).json(await withRoom(guest));
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { status, roomId, vibe, energyLevel } = req.body;
  const updates: Partial<typeof guestsTable.$inferInsert> = {};
  if (status !== undefined) updates.status = status;
  if (roomId !== undefined) updates.roomId = roomId;
  if (vibe !== undefined) updates.vibe = vibe;
  if (energyLevel !== undefined) updates.energyLevel = energyLevel;
  if (status === "checked_out") updates.checkedOutAt = new Date();
  const [guest] = await db.update(guestsTable).set(updates).where(eq(guestsTable.id, id)).returning();
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  return res.json(await withRoom(guest));
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(guestsTable).where(eq(guestsTable.id, id));
  return res.status(204).send();
});

export default router;
