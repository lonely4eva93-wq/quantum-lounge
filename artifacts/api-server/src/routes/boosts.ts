import { Router } from "express";
import { db, leaderboardBoostsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const BOOST_PRICE_PER_HOUR = 4.99;

router.get("/", async (_req, res) => {
  const rows = await db.select().from(leaderboardBoostsTable).orderBy(leaderboardBoostsTable.createdAt);
  return res.json(rows);
});

router.post("/", async (req, res) => {
  const { guestName, durationHours } = req.body;
  const hours = Math.max(1, Number(durationHours));
  const price = parseFloat((hours * BOOST_PRICE_PER_HOUR).toFixed(2));
  const expiresAt = new Date(Date.now() + hours * 3_600_000);

  const [row] = await db.insert(leaderboardBoostsTable).values({
    guestName, price, expiresAt, isActive: true,
  }).returning();

  await db.insert(transactionsTable).values({
    type: "energy_upgrade",
    amount: price,
    description: `Leaderboard boost (${hours}h) for ${guestName}`,
    status: "completed",
  });

  return res.status(201).json(row);
});

router.delete("/:id", async (req, res) => {
  await db.update(leaderboardBoostsTable)
    .set({ isActive: false })
    .where(eq(leaderboardBoostsTable.id, Number(req.params.id)));
  return res.status(204).send();
});

export default router;
