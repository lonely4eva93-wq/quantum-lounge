import { Router } from "express";
import { db, transactionsTable, guestsTable } from "@workspace/db";
import { eq, sum } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const rows = await db
    .select({
      id: transactionsTable.id,
      type: transactionsTable.type,
      amount: transactionsTable.amount,
      description: transactionsTable.description,
      guestId: transactionsTable.guestId,
      guestName: guestsTable.name,
      status: transactionsTable.status,
      createdAt: transactionsTable.createdAt,
    })
    .from(transactionsTable)
    .leftJoin(guestsTable, eq(transactionsTable.guestId, guestsTable.id))
    .orderBy(transactionsTable.createdAt);
  return res.json(rows);
});

router.post("/cashout", async (req, res) => {
  const { amount, notes } = req.body;
  const [tx] = await db
    .insert(transactionsTable)
    .values({
      type: "cashout",
      amount: -Math.abs(amount),
      description: notes ? `Cashout: ${notes}` : "Owner cashout",
      guestId: null,
      status: "completed",
    })
    .returning();
  return res.status(201).json({ ...tx, guestName: null });
});

export default router;
