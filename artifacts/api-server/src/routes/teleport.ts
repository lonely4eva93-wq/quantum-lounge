import { Router } from "express";
import { db, teleportEventsTable, guestsTable, roomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { awardBadgeIfNew } from "../lib/award-badge";

const router = Router();

router.post("/", async (req, res) => {
  const { guestId, fromRoomId, toRoomId } = req.body;
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.id, guestId));
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  const [toRoom] = await db.select().from(roomsTable).where(eq(roomsTable.id, toRoomId));
  if (!toRoom) return res.status(404).json({ error: "Destination room not found" });

  const quantumShift = parseFloat((Math.random() * toRoom.frequency * 0.01).toFixed(4));

  await db.insert(teleportEventsTable).values({
    guestId,
    fromRoomId: fromRoomId ?? guest.roomId ?? null,
    toRoomId,
    quantumShift,
  });

  const [updated] = await db.update(guestsTable).set({ roomId: toRoomId }).where(eq(guestsTable.id, guestId)).returning();

  const [fromRoom] = fromRoomId ? await db.select().from(roomsTable).where(eq(roomsTable.id, fromRoomId)) : [null];

  // Auto-award teleporter badge (fire-and-forget)
  awardBadgeIfNew(guestId, "teleporter").catch(() => {});

  return res.json({
    success: true,
    guest: { ...updated, roomName: toRoom.name },
    message: `${guest.name} has been quantum-teleported to ${toRoom.name} at ${toRoom.frequency}Hz`,
    quantumShift,
  });
});

router.get("/history", async (_req, res) => {
  const rows = await db
    .select({
      id: teleportEventsTable.id,
      guestId: teleportEventsTable.guestId,
      guestName: guestsTable.name,
      fromRoomId: teleportEventsTable.fromRoomId,
      toRoomId: teleportEventsTable.toRoomId,
      quantumShift: teleportEventsTable.quantumShift,
      teleportedAt: teleportEventsTable.teleportedAt,
    })
    .from(teleportEventsTable)
    .leftJoin(guestsTable, eq(teleportEventsTable.guestId, guestsTable.id))
    .orderBy(teleportEventsTable.teleportedAt);

  const result = await Promise.all(
    rows.map(async (row) => {
      const fromRoom = row.fromRoomId
        ? (await db.select().from(roomsTable).where(eq(roomsTable.id, row.fromRoomId)))[0]
        : null;
      const [toRoom] = await db.select().from(roomsTable).where(eq(roomsTable.id, row.toRoomId));
      return {
        ...row,
        fromRoomName: fromRoom?.name ?? null,
        toRoomName: toRoom?.name ?? "Unknown",
      };
    }),
  );

  return res.json(result);
});

export default router;
