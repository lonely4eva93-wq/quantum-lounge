import { Router } from "express";
import { db, guestsTable, transactionsTable, roomsTable, teleportEventsTable, messagesTable } from "@workspace/db";
import { eq, count, sql, gte } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req, res) => {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const sevenDaysAgo = days[0];

  const [recentGuests, recentTx, allGuests, allRooms, allTx] = await Promise.all([
    db.select({ checkedInAt: guestsTable.checkedInAt }).from(guestsTable).where(gte(guestsTable.checkedInAt, sevenDaysAgo)),
    db.select({ amount: transactionsTable.amount, createdAt: transactionsTable.createdAt, type: transactionsTable.type }).from(transactionsTable).where(gte(transactionsTable.createdAt, sevenDaysAgo)),
    db.select({ energyLevel: guestsTable.energyLevel, status: guestsTable.status }).from(guestsTable),
    db.select({ id: roomsTable.id, name: roomsTable.name }).from(roomsTable),
    db.select({ amount: transactionsTable.amount, type: transactionsTable.type, description: transactionsTable.description }).from(transactionsTable),
  ]);

  const dailyVisitors = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const count = recentGuests.filter((g) => g.checkedInAt >= day && g.checkedInAt < next).length;
    return { day: label, visitors: count };
  });

  const dailyRevenue = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const label = day.toLocaleDateString("en-US", { weekday: "short" });
    const revenue = recentTx
      .filter((t) => t.type === "credit" && t.createdAt >= day && t.createdAt < next)
      .reduce((s, t) => s + (t.amount ?? 0), 0);
    return { day: label, revenue: parseFloat(revenue.toFixed(2)) };
  });

  const energyDistribution = ["basic", "charged", "quantum", "transcended"].map((level) => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    value: allGuests.filter((g) => g.energyLevel === level).length,
  })).filter((e) => e.value > 0);

  const totalRevenue = allTx.filter((t) => t.type === "credit").reduce((s, t) => s + (t.amount ?? 0), 0);
  const weekRevenue = recentTx.filter((t) => t.type === "credit").reduce((s, t) => s + (t.amount ?? 0), 0);

  return res.json({
    dailyVisitors,
    dailyRevenue,
    energyDistribution,
    totalGuests: allGuests.length,
    activeGuests: allGuests.filter((g) => g.status === "active").length,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    weekRevenue: parseFloat(weekRevenue.toFixed(2)),
    weekVisitors: recentGuests.length,
  });
});

export default router;
