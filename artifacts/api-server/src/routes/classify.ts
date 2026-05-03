import { Router } from "express";
import { spawn } from "child_process";
import path from "path";
import { ClassifyPhysiqueBody } from "@workspace/api-zod";
import { db, classificationsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();
const PYTHON_SCRIPT = path.resolve(process.cwd(), "python/predict.py");

async function runPythonClassifier(input: object): Promise<object> {
  return new Promise((resolve, reject) => {
    const py = spawn("python3", [PYTHON_SCRIPT], {
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (d) => (stdout += d.toString()));
    py.stderr.on("data", (d) => (stderr += d.toString()));

    py.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || "Python classifier exited with error"));
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("Failed to parse classifier output"));
      }
    });

    py.stdin.write(JSON.stringify(input));
    py.stdin.end();
  });
}

router.post("/classify", async (req, res) => {
  const parsed = ClassifyPhysiqueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.message });
    return;
  }

  try {
    const result = await runPythonClassifier(parsed.data) as Record<string, unknown>;
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Classification failed");
    res.status(500).json({ error: "Classification failed" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(classificationsTable)
      .orderBy(desc(classificationsTable.createdAt))
      .limit(20);

    res.json(
      rows.map((r) => ({
        id: r.id,
        physiqueType: r.physiqueType,
        confidence: r.confidence,
        bodyMetrics: r.bodyMetrics,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to fetch history");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.post("/history", async (req, res) => {
  const { physiqueType, confidence, bodyMetrics } = req.body;
  if (!physiqueType || confidence === undefined || !bodyMetrics) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const [inserted] = await db
      .insert(classificationsTable)
      .values({
        physiqueType,
        confidence,
        bodyMetrics,
      })
      .returning();

    res.status(201).json({
      id: inserted.id,
      physiqueType: inserted.physiqueType,
      confidence: inserted.confidence,
      bodyMetrics: inserted.bodyMetrics,
      createdAt: inserted.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save classification");
    res.status(500).json({ error: "Failed to save classification" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const rows = await db.select().from(classificationsTable);

    const breakdown = { athletic: 0, skinny: 0, overweight: 0 } as Record<string, number>;
    let totalConfidence = 0;

    for (const r of rows) {
      const t = r.physiqueType as string;
      if (t in breakdown) breakdown[t]++;
      totalConfidence += r.confidence;
    }

    const total = rows.length;
    const avgConfidence = total > 0 ? totalConfidence / total : 0;

    const recentActivity = rows
      .slice(-5)
      .reverse()
      .map((r) => `${r.physiqueType} detected (${Math.round(r.confidence * 100)}% confidence)`);

    res.json({
      totalClassifications: total,
      breakdown,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      recentActivity,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
