import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query, ensureTables } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: string | null;
  fitness_goal: string | null;
  fitness_level: string | null;
  physique_type: string | null;
  created_at: Date;
  updated_at: Date;
}

function rowToProfile(r: ProfileRow) {
  return {
    userId: r.user_id,
    displayName: r.display_name,
    height: r.height,
    weight: r.weight,
    age: r.age,
    gender: r.gender,
    fitnessGoal: r.fitness_goal,
    fitnessLevel: r.fitness_level,
    physiqueType: r.physique_type,
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureTables();

  const userId = requireAuth(req);
  if (!userId) {
    res.status(401).json({ error: "No session ID" });
    return;
  }

  if (req.method === "GET") {
    const rows = await query<ProfileRow>(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [userId]
    );
    res.json(rows[0] ? rowToProfile(rows[0]) : null);
    return;
  }

  if (req.method === "PUT") {
    const { displayName, height, weight, age, gender, fitnessGoal, fitnessLevel, physiqueType } =
      req.body ?? {};

    const existing = await query("SELECT user_id FROM user_profiles WHERE user_id = $1", [userId]);

    if (existing.length > 0) {
      const [updated] = await query<ProfileRow>(
        `UPDATE user_profiles SET
          display_name = $2, height = $3, weight = $4, age = $5, gender = $6,
          fitness_goal = $7, fitness_level = $8, physique_type = $9, updated_at = NOW()
         WHERE user_id = $1 RETURNING *`,
        [userId, displayName, height, weight, age, gender, fitnessGoal, fitnessLevel, physiqueType]
      );
      res.json(rowToProfile(updated));
    } else {
      const [created] = await query<ProfileRow>(
        `INSERT INTO user_profiles (user_id, display_name, height, weight, age, gender, fitness_goal, fitness_level, physique_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [userId, displayName, height, weight, age, gender, fitnessGoal, fitnessLevel, physiqueType]
      );
      res.json(rowToProfile(created));
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
