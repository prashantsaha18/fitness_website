import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query, ensureTables } from "./_lib/db";
import { requireAuth } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureTables();

  let userId: string;
  try {
    userId = await requireAuth(req);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    const rows = await query(
      "SELECT * FROM body_measurements WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    res.json(rows);
    return;
  }

  if (req.method === "POST") {
    const { weight, waist, chest, arms, hips, neck, notes } = req.body ?? {};
    const [row] = await query(
      `INSERT INTO body_measurements (user_id, weight, waist, chest, arms, hips, neck, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, weight, waist, chest, arms, hips, neck, notes]
    );
    res.status(201).json(row);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
