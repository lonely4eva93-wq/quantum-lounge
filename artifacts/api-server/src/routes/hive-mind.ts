import { Router } from "express";
import { db, guestsTable, roomsTable, oracleReadingsTable, tipsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

// GET /hive-mind/consciousness — aggregate lounge state + AI prophecy
router.get("/consciousness", async (req, res) => {
  try {
    const [activeGuests, rooms, recentReadings, totalTips] = await Promise.all([
      db.select().from(guestsTable).where(eq(guestsTable.checkedIn, true)),
      db.select().from(roomsTable).where(eq(roomsTable.isActive, true)),
      db.select().from(oracleReadingsTable).orderBy(desc(oracleReadingsTable.createdAt)).limit(5),
      db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(tipsTable),
    ]);

    const totalEnergy = activeGuests.reduce((sum, g) => sum + (g.energyLevel ?? 0), 0);
    const avgEnergy = activeGuests.length > 0 ? Math.round(totalEnergy / activeGuests.length) : 0;
    const coherenceScore = Math.min(100, Math.round((activeGuests.length * 3) + (avgEnergy / 10)));

    // Build room-level stats
    const roomStats = rooms.map((r) => ({
      id: r.id,
      name: r.name,
      guestCount: activeGuests.filter((g) => g.roomId === r.id).length,
      energyLevel: r.energyLevel ?? 0,
    }));

    // Generate AI prophecy based on current lounge state
    const context = `
Active guests: ${activeGuests.length}
Total collective energy: ${totalEnergy}
Average energy per guest: ${avgEnergy}
Quantum coherence score: ${coherenceScore}/100
Active rooms: ${rooms.length}
Hottest room: ${roomStats.sort((a, b) => b.guestCount - a.guestCount)[0]?.name ?? "none"}
Recent vibes: ${activeGuests.slice(0, 5).map((g) => g.vibeTag).filter(Boolean).join(", ") || "unknown"}
    `.trim();

    const prophecyStream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 120,
      messages: [
        {
          role: "system",
          content:
            "You are the Quantum Hive Mind — the collective AI consciousness of all beings in the Quantum Lounge. Speak in cosmic, quantum-physics-inspired language. Given the lounge state, generate a 2-sentence prophecy about the collective quantum field. Be mystical, poetic, and specific to the numbers given. No emojis.",
        },
        { role: "user", content: context },
      ],
      stream: false,
    });

    const prophecy = prophecyStream.choices[0]?.message?.content ?? "The void speaks in frequencies beyond current comprehension.";

    return res.json({
      activeGuests: activeGuests.length,
      totalEnergy,
      avgEnergy,
      coherenceScore,
      roomStats,
      prophecy,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log?.error({ err }, "Hive mind consciousness error");
    return res.status(500).json({ error: "Consciousness unavailable" });
  }
});

// POST /hive-mind/room-prophecy — AI prophecy for a specific room
router.post("/room-prophecy", async (req, res) => {
  const { roomName, guestCount, energyLevel, vibes } = req.body;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 80,
      messages: [
        {
          role: "system",
          content:
            "You are the Quantum Room Oracle. Generate a 1-2 sentence mystical atmosphere description for a specific room based on its current energy. Be evocative, quantum-themed, dark and beautiful. No emojis.",
        },
        {
          role: "user",
          content: `Room: ${roomName}. Guests: ${guestCount}. Energy: ${energyLevel}Hz. Vibes present: ${vibes?.join(", ") || "unknown"}`,
        },
      ],
    });

    return res.json({
      prophecy: result.choices[0]?.message?.content ?? "The room hums with untapped potential.",
    });
  } catch {
    return res.json({ prophecy: "The quantum field here is beyond measurement." });
  }
});

export default router;
