import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, userProfilesTable, bodyMeasurementsTable, fitnessGoalsTable, classificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

// GET /api/user/profile
router.get("/user/profile", requireAuth, async (req: any, res) => {
  try {
    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, req.userId));
    res.json(profile ?? null);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// PUT /api/user/profile
router.put("/user/profile", requireAuth, async (req: any, res) => {
  const { displayName, height, weight, age, gender, fitnessGoal, fitnessLevel, physiqueType } = req.body;
  try {
    const existing = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, req.userId));

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProfilesTable)
        .set({ displayName, height, weight, age, gender, fitnessGoal, fitnessLevel, physiqueType, updatedAt: new Date() })
        .where(eq(userProfilesTable.userId, req.userId))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(userProfilesTable)
        .values({ userId: req.userId, displayName, height, weight, age, gender, fitnessGoal, fitnessLevel, physiqueType })
        .returning();
      res.json(created);
    }
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/dashboard
router.get("/dashboard", requireAuth, async (req: any, res) => {
  try {
    const [profile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, req.userId));
    const classifications = await db.select().from(classificationsTable).where(eq(classificationsTable.userId, req.userId)).orderBy(desc(classificationsTable.createdAt)).limit(10);
    const measurements = await db.select().from(bodyMeasurementsTable).where(eq(bodyMeasurementsTable.userId, req.userId)).orderBy(desc(bodyMeasurementsTable.createdAt)).limit(10);
    const goals = await db.select().from(fitnessGoalsTable).where(eq(fitnessGoalsTable.userId, req.userId)).orderBy(desc(fitnessGoalsTable.createdAt));

    const totalScans = classifications.length;
    const latestScan = classifications[0] ?? null;
    const completedGoals = goals.filter(g => g.completed).length;
    const activeGoals = goals.filter(g => !g.completed).length;

    // streak: count consecutive days with a scan
    const scanDays = new Set(classifications.map(c => c.createdAt.toISOString().slice(0, 10)));
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
      profile: profile ?? null,
      latestScan,
      totalScans,
      completedGoals,
      activeGoals,
      streak,
      recentMeasurements: measurements.slice(0, 5),
      recentClassifications: classifications.slice(0, 5),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard");
    res.status(500).json({ error: "Failed to get dashboard" });
  }
});

// GET /api/measurements
router.get("/measurements", requireAuth, async (req: any, res) => {
  try {
    const rows = await db
      .select()
      .from(bodyMeasurementsTable)
      .where(eq(bodyMeasurementsTable.userId, req.userId))
      .orderBy(desc(bodyMeasurementsTable.createdAt))
      .limit(50);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get measurements");
    res.status(500).json({ error: "Failed to get measurements" });
  }
});

// POST /api/measurements
router.post("/measurements", requireAuth, async (req: any, res) => {
  const { weight, waist, chest, arms, hips, neck, notes } = req.body;
  try {
    const [inserted] = await db
      .insert(bodyMeasurementsTable)
      .values({ userId: req.userId, weight, waist, chest, arms, hips, neck, notes })
      .returning();
    res.status(201).json(inserted);
  } catch (err) {
    req.log.error({ err }, "Failed to save measurement");
    res.status(500).json({ error: "Failed to save measurement" });
  }
});

// GET /api/goals
router.get("/goals", requireAuth, async (req: any, res) => {
  try {
    const rows = await db
      .select()
      .from(fitnessGoalsTable)
      .where(eq(fitnessGoalsTable.userId, req.userId))
      .orderBy(desc(fitnessGoalsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get goals");
    res.status(500).json({ error: "Failed to get goals" });
  }
});

// POST /api/goals
router.post("/goals", requireAuth, async (req: any, res) => {
  const { goalType, title, targetValue, currentValue, unit, deadline } = req.body;
  if (!goalType || !title) {
    res.status(400).json({ error: "goalType and title are required" });
    return;
  }
  try {
    const [inserted] = await db
      .insert(fitnessGoalsTable)
      .values({
        userId: req.userId,
        goalType,
        title,
        targetValue,
        currentValue,
        unit,
        deadline: deadline ? new Date(deadline) : null,
        completed: false,
      })
      .returning();
    res.status(201).json(inserted);
  } catch (err) {
    req.log.error({ err }, "Failed to create goal");
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// PATCH /api/goals/:id
router.patch("/goals/:id", requireAuth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  const { currentValue, completed } = req.body;
  try {
    const [updated] = await db
      .update(fitnessGoalsTable)
      .set({ currentValue, completed, updatedAt: new Date() })
      .where(eq(fitnessGoalsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update goal");
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// GET /api/calculator/bmi?weight=70&height=175
router.get("/calculator/bmi", (req, res) => {
  const weight = parseFloat(req.query.weight as string);
  const height = parseFloat(req.query.height as string);
  if (!weight || !height || height <= 0) {
    res.status(400).json({ error: "weight and height are required" });
    return;
  }
  const bmi = weight / ((height / 100) ** 2);
  let category = "";
  let description = "";
  let color = "";
  if (bmi < 18.5) { category = "Underweight"; description = "Below healthy weight range"; color = "#60a5fa"; }
  else if (bmi < 25) { category = "Normal"; description = "Healthy weight range"; color = "#34d399"; }
  else if (bmi < 30) { category = "Overweight"; description = "Above healthy weight range"; color = "#fbbf24"; }
  else { category = "Obese"; description = "Significantly above healthy range"; color = "#f87171"; }
  res.json({ bmi: Math.round(bmi * 10) / 10, category, description, color, weight, height });
});

// GET /api/calculator/tdee?weight=70&height=175&age=25&gender=male&activityLevel=moderate
router.get("/calculator/tdee", (req, res) => {
  const weight = parseFloat(req.query.weight as string);
  const height = parseFloat(req.query.height as string);
  const age = parseFloat(req.query.age as string);
  const gender = req.query.gender as string;
  const activityLevel = (req.query.activityLevel as string) || "moderate";

  if (!weight || !height || !age || !gender) {
    res.status(400).json({ error: "weight, height, age, and gender are required" });
    return;
  }

  // Mifflin-St Jeor BMR
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
        carbs: Math.round(((tdee - 500) * 0.40) / 4),
        fat: Math.round(((tdee - 500) * 0.30) / 9),
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
        carbs: Math.round(((tdee + 300) * 0.50) / 4),
        fat: Math.round(((tdee + 300) * 0.20) / 9),
      },
    },
  });
});

export { requireAuth };
export default router;
