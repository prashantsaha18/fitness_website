import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getWorkoutPlan, type PhysiqueType, type Goal, type Level } from "../_lib/workouts-data";

const VALID_TYPES = ["athletic", "skinny", "overweight"] as const;
const VALID_GOALS = ["muscle_gain", "fat_loss", "endurance", "flexibility", "general_fitness"] as const;
const VALID_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const physiqueType = req.query.physiqueType as string;
  const goal = (req.query.goal as string) || "general_fitness";
  const fitnessLevel = (req.query.fitnessLevel as string) || "beginner";

  if (!VALID_TYPES.includes(physiqueType as PhysiqueType)) {
    res.status(400).json({ error: "Invalid physique type" });
    return;
  }

  const safeGoal = VALID_GOALS.includes(goal as Goal) ? (goal as Goal) : "general_fitness";
  const safeLevel = VALID_LEVELS.includes(fitnessLevel as Level) ? (fitnessLevel as Level) : "beginner";

  const plan = getWorkoutPlan(physiqueType as PhysiqueType, safeGoal, safeLevel);
  res.json(plan);
}
