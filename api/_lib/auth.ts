import type { VercelRequest } from "@vercel/node";

export function getUserId(req: VercelRequest): string | null {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || typeof sessionId !== "string" || sessionId.length < 8) return null;
  return sessionId;
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
