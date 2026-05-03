import { Router } from "express";
import { db, xrpAccountsTable, xrpTransactionsTable, guestsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const NEW_USER_BONUS = 5; // XRP credits awarded to new users
const PLATFORM_FEE_PCT = 0.05; // 5% platform cut on P2P transfers

async function getOrCreateAccount(guestId: number) {
  const [existing] = await db
    .select()
    .from(xrpAccountsTable)
    .where(eq(xrpAccountsTable.guestId, guestId));
  if (existing) return existing;
  const [created] = await db
    .insert(xrpAccountsTable)
    .values({ guestId, creditBalance: 0, lifetimeEarned: 0, bonusClaimed: false })
    .returning();
  return created;
}

// GET /api/xrp/account/:guestId
router.get("/account/:guestId", async (req, res) => {
  const guestId = Number(req.params.guestId);
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.id, guestId));
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  const account = await getOrCreateAccount(guestId);
  return res.json(account);
});

// POST /api/xrp/claim-bonus  { guestId }
router.post("/claim-bonus", async (req, res) => {
  const { guestId } = req.body;
  if (!guestId) return res.status(400).json({ error: "guestId required" });

  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.id, Number(guestId)));
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const account = await getOrCreateAccount(Number(guestId));
  if (account.bonusClaimed) {
    return res.status(409).json({ error: "Bonus already claimed" });
  }

  const [updated] = await db
    .update(xrpAccountsTable)
    .set({
      bonusClaimed: true,
      creditBalance: account.creditBalance + NEW_USER_BONUS,
      lifetimeEarned: account.lifetimeEarned + NEW_USER_BONUS,
      updatedAt: new Date(),
    })
    .where(eq(xrpAccountsTable.id, account.id))
    .returning();

  await db.insert(xrpTransactionsTable).values({
    toGuestId: Number(guestId),
    amount: NEW_USER_BONUS,
    type: "bonus",
    description: `New user XRP welcome bonus for ${guest.name}`,
    status: "completed",
  });

  return res.json({ account: updated, bonus: NEW_USER_BONUS });
});

// POST /api/xrp/transfer  { fromGuestId, toGuestId, amount }
router.post("/transfer", async (req, res) => {
  const { fromGuestId, toGuestId, amount } = req.body;
  if (!fromGuestId || !toGuestId || !amount) {
    return res.status(400).json({ error: "fromGuestId, toGuestId, and amount are required" });
  }
  if (Number(amount) <= 0) return res.status(400).json({ error: "Amount must be positive" });
  if (Number(fromGuestId) === Number(toGuestId)) return res.status(400).json({ error: "Cannot transfer to yourself" });

  const fromAccount = await getOrCreateAccount(Number(fromGuestId));
  const fee = parseFloat((Number(amount) * PLATFORM_FEE_PCT).toFixed(4));
  const net = parseFloat((Number(amount) - fee).toFixed(4));

  if (fromAccount.creditBalance < Number(amount)) {
    return res.status(400).json({ error: "Insufficient XRP credit balance" });
  }

  const [toGuest] = await db.select().from(guestsTable).where(eq(guestsTable.id, Number(toGuestId)));
  if (!toGuest) return res.status(404).json({ error: "Recipient not found" });

  const toAccount = await getOrCreateAccount(Number(toGuestId));

  await db
    .update(xrpAccountsTable)
    .set({ creditBalance: parseFloat((fromAccount.creditBalance - Number(amount)).toFixed(4)), updatedAt: new Date() })
    .where(eq(xrpAccountsTable.id, fromAccount.id));

  await db
    .update(xrpAccountsTable)
    .set({
      creditBalance: parseFloat((toAccount.creditBalance + net).toFixed(4)),
      lifetimeEarned: parseFloat((toAccount.lifetimeEarned + net).toFixed(4)),
      updatedAt: new Date(),
    })
    .where(eq(xrpAccountsTable.id, toAccount.id));

  await db.insert(xrpTransactionsTable).values({
    fromGuestId: Number(fromGuestId),
    toGuestId: Number(toGuestId),
    amount: Number(amount),
    type: "transfer",
    description: `P2P transfer to ${toGuest.name} (fee: ${fee} XRP)`,
    status: "completed",
  });

  const [updatedFrom] = await db.select().from(xrpAccountsTable).where(eq(xrpAccountsTable.id, fromAccount.id));
  return res.json({ success: true, fee, net, account: updatedFrom });
});

// POST /api/xrp/set-address  { guestId, xrpAddress }
router.post("/set-address", async (req, res) => {
  const { guestId, xrpAddress } = req.body;
  if (!guestId || !xrpAddress) return res.status(400).json({ error: "guestId and xrpAddress required" });

  const account = await getOrCreateAccount(Number(guestId));
  const [updated] = await db
    .update(xrpAccountsTable)
    .set({ xrpAddress: String(xrpAddress).trim(), updatedAt: new Date() })
    .where(eq(xrpAccountsTable.id, account.id))
    .returning();

  return res.json(updated);
});

// POST /api/xrp/withdraw  { guestId, amount }
router.post("/withdraw", async (req, res) => {
  const { guestId, amount } = req.body;
  if (!guestId || !amount) return res.status(400).json({ error: "guestId and amount required" });

  const account = await getOrCreateAccount(Number(guestId));
  if (!account.xrpAddress) {
    return res.status(400).json({ error: "No XRP wallet address set. Please set your XRPL address first." });
  }
  if (account.creditBalance < Number(amount)) {
    return res.status(400).json({ error: "Insufficient balance for withdrawal" });
  }

  await db
    .update(xrpAccountsTable)
    .set({ creditBalance: parseFloat((account.creditBalance - Number(amount)).toFixed(4)), updatedAt: new Date() })
    .where(eq(xrpAccountsTable.id, account.id));

  await db.insert(xrpTransactionsTable).values({
    fromGuestId: Number(guestId),
    amount: Number(amount),
    type: "withdrawal",
    description: `Withdrawal request: ${amount} XRP to ${account.xrpAddress}`,
    status: "pending",
  });

  return res.json({ success: true, message: "Withdrawal queued. Real XRP will be sent to your XRPL address.", amount, address: account.xrpAddress });
});

// GET /api/xrp/history/:guestId
router.get("/history/:guestId", async (req, res) => {
  const guestId = Number(req.params.guestId);
  const txs = await db
    .select()
    .from(xrpTransactionsTable)
    .where(
      sql`${xrpTransactionsTable.fromGuestId} = ${guestId} OR ${xrpTransactionsTable.toGuestId} = ${guestId}`
    )
    .orderBy(sql`${xrpTransactionsTable.createdAt} desc`)
    .limit(20);
  return res.json(txs);
});

// GET /api/xrp/leaderboard
router.get("/leaderboard", async (_req, res) => {
  const accounts = await db
    .select({
      guestId: xrpAccountsTable.guestId,
      creditBalance: xrpAccountsTable.creditBalance,
      lifetimeEarned: xrpAccountsTable.lifetimeEarned,
      guestName: guestsTable.name,
      energyLevel: guestsTable.energyLevel,
    })
    .from(xrpAccountsTable)
    .leftJoin(guestsTable, eq(xrpAccountsTable.guestId, guestsTable.id))
    .orderBy(sql`${xrpAccountsTable.lifetimeEarned} desc`)
    .limit(10);
  return res.json(accounts);
});

export default router;
