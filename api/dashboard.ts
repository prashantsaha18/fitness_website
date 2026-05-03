import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query, ensureTables } from "./_lib/db";
import { requireAuth } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  await ensureTables();

  const userId = requireAuth(req);
  if (!userId) {
    res.status(401).json({ error: "No session ID" });
    return;
  }

  const [profileRows, classifications, measurements, goals] = await Promise.all([
    query("SELECT * FROM user_profiles WHERE user_id = $1", [userId]),
    query(
      "SELECT * FROM classifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    ),
    query(
      "SELECT * FROM body_measurements WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [userId]
    ),
    query(
      "SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    ),
  ]);

  const profile = profileRows[0] ?? null;
  const latestScan = (classifications[0] as Record<string, unknown>) ?? null;
  const totalScans = classifications.length;
  const completedGoals = (goals as Record<string, unknown>[]).filter((g) => g.completed).length;
  const activeGoals = (goals as Record<string, unknown>[]).filter((g) => !g.completed).length;

  const scanDays = new Set(
    (classifications as Record<string, unknown>[]).map(
      (c) => new Date(c.created_at as string).toISOString().slice(0, 10)
    )
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (scanDays.has(d.toISOString().slice(0, 10))) {
      streak++;
    } else {
      break;
    }
  }

  res.json({
    profile,
    latestScan,
    totalScans,
    completedGoals,
    activeGoals,
    streak,
    recentMeasurements: measurements.slice(0, 5),
    recentClassifications: classifications.slice(0, 5),
  });
}
