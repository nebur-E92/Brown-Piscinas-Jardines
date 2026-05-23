import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const COOKIE_NAME = "panel_session";
export const MAX_AGE_SEC = 8 * 60 * 60; // 8 horas

function getSecret(): Uint8Array {
  const s = process.env.PANEL_JWT_SECRET;
  if (!s) throw new Error("PANEL_JWT_SECRET no está definida.");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { userId: string; email: string };

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { userId: payload.userId as string, email: payload.email as string };
  } catch {
    return null;
  }
}

/** Obtiene la sesión desde la cookie — solo usar en Server Components y Route Handlers */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Obtiene la sesión desde el request (para middleware Edge) */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
