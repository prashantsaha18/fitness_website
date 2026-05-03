import type { VercelRequest } from "@vercel/node";

/**
 * Extracts and verifies the Clerk session token from the request cookie.
 * Returns the user ID (sub) or null if not authenticated.
 */
export async function getUserId(req: VercelRequest): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const cookieHeader = req.headers.cookie ?? "";
  const sessionMatch = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  const token = sessionMatch?.[1];
  if (!token) return null;

  try {
    const { verifyToken } = await import("@clerk/backend");
    const payload = await verifyToken(token, { secretKey });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export async function requireAuth(req: VercelRequest): Promise<string> {
  const userId = await getUserId(req);
  if (!userId) {
    const err = new Error("Unauthorized") as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return userId;
}
