import type { VercelRequest } from "@vercel/node";
import { verifyToken, type JWTPayload } from "./jwt";

export function getUser(req: VercelRequest): JWTPayload | null {
  const auth = req.headers["authorization"];
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    return verifyToken(token);
  }
  return null;
}

export function getUserId(req: VercelRequest): string | null {
  const user = getUser(req);
  if (user) return user.userId;
  const sessionId = req.headers["x-session-id"];
  if (typeof sessionId === "string" && sessionId.length >= 8) return sessionId;
  return null;
}

export function requireAuth(req: VercelRequest): string {
  const userId = getUserId(req);
  if (!userId) {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return userId;
}
