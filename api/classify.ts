import type { VercelRequest, VercelResponse } from "@vercel/node";
import { classify } from "./_lib/classifier";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { landmarks, height, weight } = req.body ?? {};

  if (!Array.isArray(landmarks) || landmarks.length === 0) {
    res.status(400).json({ error: "landmarks array is required" });
    return;
  }

  try {
    const result = classify(landmarks, height, weight);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Classification failed";
    res.status(500).json({ error: message });
  }
}
