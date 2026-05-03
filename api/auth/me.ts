import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUser } from "../_lib/auth";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = getUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  res.json({ userId: user.userId, email: user.email, name: user.name });
}
