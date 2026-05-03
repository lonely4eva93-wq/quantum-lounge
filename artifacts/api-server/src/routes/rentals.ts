import { Router } from "express";
import { db, roomRentalsTable, roomsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const HOURLY_RATE = 50;

async function withRoom(rental: typeof roomRentalsTable.$inferSelect) {
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, rental.roomId));
  return { ...rental, roomName: room?.name ?? "Unknown Room" };
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(roomRentalsTable).orderBy(roomRentalsTable.createdAt);
  return res.json(await Promise.all(rows.map(withRoom)));
});

router.post("/", async (req, res) => {
  const { roomId, renterName, eventName, startTime, endTime, notes } = req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 3_600_000));
  const priceTotal = hours * HOURLY_RATE;

  const [row] = await db.insert(roomRentalsTable).values({
    roomId, renterName, eventName,
    startTime: start, endTime: end,
    priceTotal, status: "confirmed",
    notes: notes ?? null,
  }).returning();

  await db.insert(transactionsTable).values({
    type: "house_fee",
    amount: priceTotal,
    description: `Room rental — ${eventName} by ${renterName} (${hours}h)`,
    status: "completed",
  });

  return res.status(201).json(await withRoom(row));
});

router.put("/:id", async (req, res) => {
  const { status } = req.body;
  const [row] = await db.update(roomRentalsTable)
    .set({ status })
    .where(eq(roomRentalsTable.id, Number(req.params.id)))
    .returning();
  if (!row) return res.status(404).json({ error: "Rental not found" });
  return res.json(await withRoom(row));
});

router.delete("/:id", async (req, res) => {
  await db.delete(roomRentalsTable).where(eq(roomRentalsTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;
