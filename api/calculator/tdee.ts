import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const weight = parseFloat(req.query.weight as string);
  const height = parseFloat(req.query.height as string);
  const age = parseFloat(req.query.age as string);
  const gender = req.query.gender as string;
  const activityLevel = (req.query.activityLevel as string) || "moderate";

  if (!weight || !height || !age || !gender) {
    res.status(400).json({ error: "weight, height, age, and gender are required" });
    return;
  }

  let bmr: number;
  if (gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = activityMultipliers[activityLevel] ?? 1.55;
  const tdee = Math.round(bmr * multiplier);

  res.json({
    bmr: Math.round(bmr),
    tdee,
    activityLevel,
    macros: {
      fat_loss: {
        calories: tdee - 500,
        protein: Math.round(weight * 2.0),
        carbs: Math.round(((tdee - 500) * 0.4) / 4),
        fat: Math.round(((tdee - 500) * 0.3) / 9),
      },
      maintenance: {
        calories: tdee,
        protein: Math.round(weight * 1.8),
        carbs: Math.round((tdee * 0.45) / 4),
        fat: Math.round((tdee * 0.25) / 9),
      },
      muscle_gain: {
        calories: tdee + 300,
        protein: Math.round(weight * 2.2),
        carbs: Math.round(((tdee + 300) * 0.5) / 4),
        fat: Math.round(((tdee + 300) * 0.2) / 9),
      },
    },
  });
}
