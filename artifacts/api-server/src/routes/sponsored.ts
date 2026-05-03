import { Router } from "express";
import { db, sponsoredRoomsTable, roomsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function withRoom(row: typeof sponsoredRoomsTable.$inferSelect) {
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, row.roomId));
  return { ...row, roomName: room?.name ?? "Unknown Room" };
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(sponsoredRoomsTable).orderBy(sponsoredRoomsTable.createdAt);
  return res.json(await Promise.all(rows.map(withRoom)));
});

router.post("/", async (req, res) => {
  const { roomId, sponsorName, brandColor, tagline, pricePerMonth } = req.body;
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);

  const [row] = await db.insert(sponsoredRoomsTable).values({
    roomId, sponsorName, brandColor, tagline, pricePerMonth,
    status: "active", endsAt,
  }).returning();

  await db.insert(transactionsTable).values({
    type: "house_fee",
    amount: pricePerMonth,
    description: `Room sponsorship — ${sponsorName}`,
    status: "completed",
  });

  return res.status(201).json(await withRoom(row));
});

router.delete("/:id", async (req, res) => {
  await db.update(sponsoredRoomsTable)
    .set({ status: "cancelled" })
    .where(eq(sponsoredRoomsTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;
