import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query, ensureTable } from "./_lib/db";

interface Row {
  physique_type: string;
  confidence: number;
  created_at: Date;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  await ensureTable();

  const rows = await query<Row>(
    "SELECT physique_type, confidence, created_at FROM classifications ORDER BY created_at DESC"
  );

  const breakdown: Record<string, number> = { athletic: 0, skinny: 0, overweight: 0 };
  let totalConfidence = 0;

  for (const r of rows) {
    const t = r.physique_type;
    if (t in breakdown) breakdown[t]++;
    totalConfidence += r.confidence;
  }

  const total = rows.length;
  const avgConfidence = total > 0 ? totalConfidence / total : 0;

  const recentActivity = rows.slice(0, 5).map(
    (r) => `${r.physique_type} detected (${Math.round(r.confidence * 100)}% confidence)`
  );

  res.json({
    totalClassifications: total,
    breakdown,
    averageConfidence: Math.round(avgConfidence * 100) / 100,
    recentActivity,
  });
}
