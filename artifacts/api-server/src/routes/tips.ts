import { Router } from "express";
import { db, tipsTable, transactionsTable } from "@workspace/db";

const router = Router();
const HOUSE_CUT_PCT = 0.15;

router.get("/", async (_req, res) => {
  const rows = await db.select().from(tipsTable).orderBy(tipsTable.createdAt);
  return res.json(rows);
});

router.post("/", async (req, res) => {
  const { fromGuestName, toGuestName, toHouse, amount, message } = req.body;
  const houseCut = toHouse ? amount : parseFloat((amount * HOUSE_CUT_PCT).toFixed(2));

  const [row] = await db.insert(tipsTable).values({
    fromGuestName,
    toGuestName: toGuestName ?? null,
    toHouse: toHouse ?? false,
    amount,
    houseCut,
    message: message ?? null,
  }).returning();

  await db.insert(transactionsTable).values({
    type: "house_fee",
    amount: houseCut,
    description: toHouse
      ? `Tip to the house from ${fromGuestName}`
      : `Tip cut (15%) — ${fromGuestName} tipped ${toGuestName}`,
    status: "completed",
  });

  return res.status(201).json(row);
});

export default router;
