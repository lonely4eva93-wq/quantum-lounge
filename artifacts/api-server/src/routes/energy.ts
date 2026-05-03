import { Router } from "express";
import { db, energyUpgradesTable, guestUpgradesTable, guestsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { awardBadgeIfNew } from "../lib/award-badge";

const router = Router();

router.get("/upgrades", async (_req, res) => {
  const upgrades = await db.select().from(energyUpgradesTable).orderBy(energyUpgradesTable.price);
  return res.json(upgrades);
});

router.post("/upgrades", async (req, res) => {
  const { name, level, description, price, color } = req.body;
  const [upgrade] = await db.insert(energyUpgradesTable).values({ name, level, description, price, color }).returning();
  return res.status(201).json(upgrade);
});

router.delete("/upgrades/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(energyUpgradesTable).where(eq(energyUpgradesTable.id, id));
  return res.status(204).send();
});

router.get("/guest-upgrades", async (_req, res) => {
  const rows = await db
    .select({
      id: guestUpgradesTable.id,
      guestId: guestUpgradesTable.guestId,
      guestName: guestsTable.name,
      upgradeId: guestUpgradesTable.upgradeId,
      upgradeName: energyUpgradesTable.name,
      level: energyUpgradesTable.level,
      amountPaid: guestUpgradesTable.amountPaid,
      purchasedAt: guestUpgradesTable.purchasedAt,
    })
    .from(guestUpgradesTable)
    .leftJoin(guestsTable, eq(guestUpgradesTable.guestId, guestsTable.id))
    .leftJoin(energyUpgradesTable, eq(guestUpgradesTable.upgradeId, energyUpgradesTable.id))
    .orderBy(guestUpgradesTable.purchasedAt);
  return res.json(rows);
});

router.post("/guest-upgrades", async (req, res) => {
  const { guestId, upgradeId } = req.body;
  const [upgrade] = await db.select().from(energyUpgradesTable).where(eq(energyUpgradesTable.id, upgradeId));
  if (!upgrade) return res.status(404).json({ error: "Upgrade not found" });
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.id, guestId));
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const [row] = await db
    .insert(guestUpgradesTable)
    .values({ guestId, upgradeId, amountPaid: upgrade.price })
    .returning();

  await db.update(guestsTable).set({ energyLevel: upgrade.level }).where(eq(guestsTable.id, guestId));

  // Auto-award energy tier badges
  if (upgrade.level === "charged") awardBadgeIfNew(guestId, "energy_charged").catch(() => {});
  if (upgrade.level === "quantum") awardBadgeIfNew(guestId, "energy_quantum").catch(() => {});
  if (upgrade.level === "transcended") awardBadgeIfNew(guestId, "energy_transcended").catch(() => {});

  await db.insert(transactionsTable).values({
    type: "energy_upgrade",
    amount: upgrade.price,
    description: `${upgrade.name} upgrade for ${guest.name}`,
    guestId,
    status: "completed",
  });

  return res.status(201).json({
    ...row,
    guestName: guest.name,
    upgradeName: upgrade.name,
    level: upgrade.level,
  });
});

export default router;
