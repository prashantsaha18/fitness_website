import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { query, ensureTables } from "../_lib/db";
import { signToken } from "../_lib/jwt";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await ensureTables();

  const { email, password, name } = req.body ?? {};

  if (!email || typeof email !== "string") return res.status(400).json({ error: "Email is required" });
  if (!password || typeof password !== "string") return res.status(400).json({ error: "Password is required" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
  if (existing.length > 0) return res.status(409).json({ error: "An account with this email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const displayName = (name?.trim()) || normalizedEmail.split("@")[0];

  const rows = await query<{ id: string; email: string; display_name: string }>(
    "INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name",
    [normalizedEmail, passwordHash, displayName]
  );

  const user = rows[0];
  const token = signToken({ userId: user.id, email: user.email, name: user.display_name });

  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.display_name } });
}
