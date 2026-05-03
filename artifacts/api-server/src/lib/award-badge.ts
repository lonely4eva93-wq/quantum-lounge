import { db, guestAchievementsTable, guestsTable } from "@workspace/db";
import { and, eq, count } from "drizzle-orm";

export async function awardBadgeIfNew(guestId: number, badgeId: string): Promise<boolean> {
  const existing = await db
    .select({ id: guestAchievementsTable.id })
    .from(guestAchievementsTable)
    .where(and(eq(guestAchievementsTable.guestId, guestId), eq(guestAchievementsTable.badgeId, badgeId)));
  if (existing.length > 0) return false;
  await db.insert(guestAchievementsTable).values({ guestId, badgeId });
  return true;
}

export async function checkAndAwardBadges(guestId: number): Promise<string[]> {
  const awarded: string[] = [];
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.id, guestId));
  if (!guest) return awarded;

  if (await awardBadgeIfNew(guestId, "first_checkin")) awarded.push("first_checkin");

  if (guest.energyLevel === "charged" && await awardBadgeIfNew(guestId, "energy_charged")) awarded.push("energy_charged");
  if (guest.energyLevel === "quantum" && await awardBadgeIfNew(guestId, "energy_quantum")) awarded.push("energy_quantum");
  if (guest.energyLevel === "transcended" && await awardBadgeIfNew(guestId, "energy_transcended")) awarded.push("energy_transcended");

  return awarded;
}
