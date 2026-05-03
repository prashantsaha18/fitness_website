import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query, ensureTables } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  await ensureTables();

  let userId: string;
  try {
    userId = await requireAuth(req);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid goal id" });
    return;
  }

  const { currentValue, completed } = req.body ?? {};
  const [row] = await query(
    `UPDATE fitness_goals SET
       current_value = COALESCE($2, current_value),
       completed = COALESCE($3, completed),
       updated_at = NOW()
     WHERE id = $1 AND user_id = $4
     RETURNING *`,
    [id, currentValue ?? null, completed ?? null, userId]
  );

  if (!row) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }

  res.json(row);
}
