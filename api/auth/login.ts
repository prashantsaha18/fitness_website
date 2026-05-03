import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { query, ensureTables } from "../_lib/db";
import { signToken } from "../_lib/jwt";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await ensureTables();

  const { email, password } = req.body ?? {};

  if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });
  if (!password || typeof password !== "string") return res.status(400).json({ error: "Password is required" });

  const rows = await query<{ id: string; email: string; password_hash: string; display_name: string }>(
    "SELECT id, email, password_hash, display_name FROM users WHERE email = $1",
    [email.toLowerCase().trim()]
  );

  if (rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken({ userId: user.id, email: user.email, name: user.display_name });

  res.json({ token, user: { id: user.id, email: user.email, name: user.display_name } });
}
