import { Router } from "express";
import { db, guestsTable, teleportEventsTable, guestUpgradesTable, energyUpgradesTable, roomsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/recent", async (_req, res) => {
  const joins = await db
    .select({
      id: guestsTable.id,
      guestName: guestsTable.name,
      timestamp: guestsTable.checkedInAt,
    })
    .from(guestsTable)
    .orderBy(sql`${guestsTable.checkedInAt} desc`)
    .limit(20);

  const teleports = await db
    .select({
      id: teleportEventsTable.id,
      guestId: teleportEventsTable.guestId,
      guestName: guestsTable.name,
      toRoomId: teleportEventsTable.toRoomId,
      timestamp: teleportEventsTable.teleportedAt,
    })
    .from(teleportEventsTable)
    .leftJoin(guestsTable, eq(teleportEventsTable.guestId, guestsTable.id))
    .orderBy(sql`${teleportEventsTable.teleportedAt} desc`)
    .limit(20);

  const purchases = await db
    .select({
      id: guestUpgradesTable.id,
      guestId: guestUpgradesTable.guestId,
      guestName: guestsTable.name,
      upgradeName: energyUpgradesTable.name,
      timestamp: guestUpgradesTable.purchasedAt,
    })
    .from(guestUpgradesTable)
    .leftJoin(guestsTable, eq(guestUpgradesTable.guestId, guestsTable.id))
    .leftJoin(energyUpgradesTable, eq(guestUpgradesTable.upgradeId, energyUpgradesTable.id))
    .orderBy(sql`${guestUpgradesTable.purchasedAt} desc`)
    .limit(20);

  const roomMap = new Map<number, string>();
  for (const t of teleports) {
    if (!roomMap.has(t.toRoomId)) {
      const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, t.toRoomId));
      roomMap.set(t.toRoomId, room?.name ?? "Unknown");
    }
  }

  const events: Array<{ id: string; type: string; guestId: number | null; guestName: string; detail: string; timestamp: string }> = [];

  for (const j of joins) {
    events.push({
      id: `join-${j.id}`,
      type: "join",
      guestId: j.id,
      guestName: j.guestName,
      detail: "materialized into the Quantum Lounge",
      timestamp: j.timestamp.toISOString(),
    });
  }

  for (const t of teleports) {
    events.push({
      id: `teleport-${t.id}`,
      type: "teleport",
      guestId: t.guestId,
      guestName: t.guestName ?? "Unknown",
      detail: `teleported to ${roomMap.get(t.toRoomId) ?? "Unknown"}`,
      timestamp: t.timestamp.toISOString(),
    });
  }

  for (const p of purchases) {
    events.push({
      id: `purchase-${p.id}`,
      type: "purchase",
      guestId: p.guestId,
      guestName: p.guestName ?? "Unknown",
      detail: `acquired ${p.upgradeName ?? "Unknown"} upgrade`,
      timestamp: p.timestamp.toISOString(),
    });
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return res.json(events.slice(0, 20));
});

export default router;
