import { Router } from "express";
import { db, guestsTable, roomsTable, transactionsTable, messagesTable, teleportEventsTable } from "@workspace/db";
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

export default router;
