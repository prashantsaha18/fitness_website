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
      "SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
    return;
  }

  if (req.method === "POST") {
    const { goalType, title, targetValue, currentValue, unit, deadline } = req.body ?? {};
    if (!goalType || !title) {
      res.status(400).json({ error: "goalType and title are required" });
      return;
    }
    const [row] = await query(
      `INSERT INTO fitness_goals (user_id, goal_type, title, target_value, current_value, unit, deadline, completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE) RETURNING *`,
      [userId, goalType, title, targetValue ?? null, currentValue ?? null, unit ?? null, deadline ? new Date(deadline) : null]
    );
    res.status(201).json(row);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
