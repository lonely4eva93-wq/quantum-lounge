import { Router } from "express";
import { db, premiumMessagesTable, transactionsTable } from "@workspace/db";
import crypto from "crypto";

const router = Router();
const PREMIUM_MSG_PRICE = 0.99;

router.get("/", async (_req, res) => {
  const rows = await db.select().from(premiumMessagesTable).orderBy(premiumMessagesTable.sentAt);
  return res.json(rows);
});

router.post("/", async (req, res) => {
  const { fromGuestName, toGuestName, content } = req.body;
  const quantumSignature = "PM-" + crypto.randomBytes(8).toString("hex").toUpperCase();

  const [row] = await db.insert(premiumMessagesTable).values({
    fromGuestName, toGuestName, content,
    price: PREMIUM_MSG_PRICE,
    quantumSignature,
    isRead: false,
  }).returning();

  await db.insert(transactionsTable).values({
    type: "energy_upgrade",
    amount: PREMIUM_MSG_PRICE,
    description: `Premium DM from ${fromGuestName} to ${toGuestName}`,
    status: "completed",
  });

  return res.status(201).json(row);
});

export default router;
