import { Router } from "express";
import { db, guestsTable, roomsTable, transactionsTable, settingsTable, teleportEventsTable, messagesTable, guestAchievementsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { awardBadgeIfNew } from "../lib/award-badge";

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

router.get("/:id/stats", async (req, res) => {
  const id = Number(req.params.id);
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.id, id));
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.guestId, id));

  const totalSpent = txs
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  const tipsGiven = txs
    .filter((t) => t.type === "house_fee" && t.description.toLowerCase().includes("tip"))
    .reduce((s, t) => s + t.amount, 0);

  const oracleSpend = txs
    .filter((t) => t.description.toLowerCase().includes("oracle"))
    .reduce((s, t) => s + t.amount, 0);

  const upgradeSpend = txs
    .filter((t) => t.type === "energy_upgrade" && t.description.toLowerCase().includes("upgrade for"))
    .reduce((s, t) => s + t.amount, 0);

  const dmSpend = txs
    .filter((t) => t.description.toLowerCase().includes("premium dm"))
    .reduce((s, t) => s + t.amount, 0);

  const boostSpend = txs
    .filter((t) => t.description.toLowerCase().includes("boost"))
    .reduce((s, t) => s + t.amount, 0);

  const vipSpend = txs
    .filter((t) => t.description.toLowerCase().includes("vip"))
    .reduce((s, t) => s + t.amount, 0);

  const [teleportRow] = await db
    .select({ c: count() })
    .from(teleportEventsTable)
    .where(eq(teleportEventsTable.guestId, id));

  const [msgRow] = await db
    .select({ c: count() })
    .from(messagesTable)
    .where(eq(messagesTable.senderName, guest.name));

  const [achievementRow] = await db
    .select({ c: count() })
    .from(guestAchievementsTable)
    .where(eq(guestAchievementsTable.guestId, id));

  const recentTxs = txs
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 8);

  return res.json({
    totalSpent: parseFloat(totalSpent.toFixed(2)),
    tipsGiven: parseFloat(tipsGiven.toFixed(2)),
    oracleSpend: parseFloat(oracleSpend.toFixed(2)),
    upgradeSpend: parseFloat(upgradeSpend.toFixed(2)),
    dmSpend: parseFloat(dmSpend.toFixed(2)),
    boostSpend: parseFloat(boostSpend.toFixed(2)),
    vipSpend: parseFloat(vipSpend.toFixed(2)),
    teleportCount: Number(teleportRow?.c ?? 0),
    messageCount: Number(msgRow?.c ?? 0),
    achievementCount: Number(achievementRow?.c ?? 0),
    transactionCount: txs.length,
    recentTransactions: recentTxs,
  });
});

router.post("/", async (req, res) => {
  const { name, vibe, roomId } = req.body;
  const settings = await db.select().from(settingsTable).limit(1);
  const houseFee = settings[0]?.houseFee ?? 15;

  const bio = req.body.bio ?? "";
  const [guest] = await db
    .insert(guestsTable)
    .values({ name, vibe, bio, roomId: roomId ?? null, feePaid: houseFee, status: "active", energyLevel: "basic" })
    .returning();

  await db.insert(transactionsTable).values({
    type: "house_fee",
    amount: houseFee,
    description: `House fee for ${name}`,
    guestId: guest.id,
    status: "completed",
  });

  // Auto-award first check-in badge (fire-and-forget)
  awardBadgeIfNew(guest.id, "first_checkin").catch(() => {});

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
  if (req.body.bio !== undefined) updates.bio = req.body.bio;
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
