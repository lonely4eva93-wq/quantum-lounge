import { Router } from "express";
import { db, guestsTable, roomsTable, transactionsTable, messagesTable, teleportEventsTable, guestUpgradesTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/overview", async (_req, res) => {
  const [activeGuestsRow] = await db
    .select({ c: count() })
    .from(guestsTable)
    .where(eq(guestsTable.status, "active"));
  const [totalGuestsRow] = await db.select({ c: count() }).from(guestsTable);
  const [openRoomsRow] = await db.select({ c: count() }).from(roomsTable).where(eq(roomsTable.isOpen, true));
  const [totalRoomsRow] = await db.select({ c: count() }).from(roomsTable);
  const [totalMessagesRow] = await db.select({ c: count() }).from(messagesTable);
  const [totalTeleportsRow] = await db.select({ c: count() }).from(teleportEventsTable);

  const allTx = await db.select().from(transactionsTable);
  const revenue = allTx
    .filter((t) => t.type !== "cashout")
    .reduce((s, t) => s + (t.amount ?? 0), 0);
  const cashedOut = allTx
    .filter((t) => t.type === "cashout")
    .reduce((s, t) => s + Math.abs(t.amount ?? 0), 0);

  const recentTransactions = await db
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
    .orderBy(sql`${transactionsTable.createdAt} desc`)
    .limit(10);

  return res.json({
    totalRevenue: parseFloat(revenue.toFixed(2)),
    availableBalance: parseFloat((revenue - cashedOut).toFixed(2)),
    totalCashedOut: parseFloat(cashedOut.toFixed(2)),
    activeGuests: Number(activeGuestsRow.c),
    totalGuests: Number(totalGuestsRow.c),
    openRooms: Number(openRoomsRow.c),
    totalRooms: Number(totalRoomsRow.c),
    totalMessages: Number(totalMessagesRow.c),
    totalTeleports: Number(totalTeleportsRow.c),
    recentTransactions,
  });
});

router.get("/leaderboard", async (req, res) => {
  const energyTier: Record<string, number> = {
    basic: 0,
    charged: 1,
    quantum: 2,
    transcended: 3,
  };

  const includeAll = req.query.includeAll === "true";

  const guests = includeAll
    ? await db.select().from(guestsTable)
    : await db.select().from(guestsTable).where(eq(guestsTable.status, "active"));

  const [upgradeCountRows] = await Promise.all([
    db
      .select({ guestId: guestUpgradesTable.guestId, cnt: count() })
      .from(guestUpgradesTable)
      .groupBy(guestUpgradesTable.guestId),
  ]);

  const teleportCountRows = await db
    .select({ guestId: teleportEventsTable.guestId, cnt: count() })
    .from(teleportEventsTable)
    .groupBy(teleportEventsTable.guestId);

  const upgradeMap = new Map(upgradeCountRows.map((r) => [r.guestId, Number(r.cnt)]));
  const teleportMap = new Map(teleportCountRows.map((r) => [r.guestId, Number(r.cnt)]));

  const scored = guests.map((g) => {
    const tier = energyTier[g.energyLevel] ?? 0;
    const upgCnt = upgradeMap.get(g.id) ?? 0;
    const telCnt = teleportMap.get(g.id) ?? 0;
    const score = tier * 100 + upgCnt * 10 + telCnt;
    return {
      guestId: g.id,
      guestName: g.name,
      energyLevel: g.energyLevel,
      status: g.status,
      upgradeCount: upgCnt,
      teleportCount: telCnt,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const result = scored.slice(0, 10).map((entry, idx) => ({
    rank: idx + 1,
    ...entry,
  }));

  return res.json(result);
});

export default router;
