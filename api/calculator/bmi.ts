import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const weight = parseFloat(req.query.weight as string);
  const height = parseFloat(req.query.height as string);

  if (!weight || !height || height <= 0) {
    res.status(400).json({ error: "weight and height are required" });
    return;
  }

  const bmi = weight / (height / 100) ** 2;
  let category = "";
  let description = "";
  let color = "";

  if (bmi < 18.5) {
    category = "Underweight";
    description = "Below healthy weight range";
    color = "#60a5fa";
  } else if (bmi < 25) {
    category = "Normal";
    description = "Healthy weight range";
    color = "#34d399";
  } else if (bmi < 30) {
    category = "Overweight";
    description = "Above healthy weight range";
    color = "#fbbf24";
  } else {
    category = "Obese";
    description = "Significantly above healthy range";
    color = "#f87171";
  }

  res.json({ bmi: Math.round(bmi * 10) / 10, category, description, color, weight, height });
}
