import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "physique-ai-dev-secret-change-in-production";
const EXPIRY = "30d";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as JWTPayload & { iat?: number; exp?: number };
    return { userId: decoded.userId, email: decoded.email, name: decoded.name };
  } catch {
    return null;
  }
}
