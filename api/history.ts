import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query, ensureTable } from "./_lib/db";

interface ClassificationRow {
  id: number;
  physique_type: string;
  confidence: number;
  body_metrics: object;
  created_at: Date;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureTable();

  if (req.method === "GET") {
    const rows = await query<ClassificationRow>(
      "SELECT id, physique_type, confidence, body_metrics, created_at FROM classifications ORDER BY created_at DESC LIMIT 20"
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        physiqueType: r.physique_type,
        confidence: r.confidence,
        bodyMetrics: r.body_metrics,
        createdAt: new Date(r.created_at).toISOString(),
      }))
    );
    return;
  }

  if (req.method === "POST") {
    const { physiqueType, confidence, bodyMetrics } = req.body ?? {};
    if (!physiqueType || confidence === undefined || !bodyMetrics) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [row] = await query<ClassificationRow>(
      "INSERT INTO classifications (physique_type, confidence, body_metrics) VALUES ($1, $2, $3) RETURNING *",
      [physiqueType, confidence, JSON.stringify(bodyMetrics)]
    );
    res.status(201).json({
      id: row.id,
      physiqueType: row.physique_type,
      confidence: row.confidence,
      bodyMetrics: row.body_metrics,
      createdAt: new Date(row.created_at).toISOString(),
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
