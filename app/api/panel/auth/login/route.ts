import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createToken, COOKIE_NAME, MAX_AGE_SEC } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña son obligatorios." }, { status: 400 });
  }

  const sql = getDb();
  const [user] = await sql<{ id: string; email: string; password_hash: string }[]>`
    SELECT id, email, password_hash FROM panel_users WHERE email = ${email.toLowerCase().trim()}
  `;

  if (!user || !(await compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
  }

  // Actualiza last_login
  await sql`UPDATE panel_users SET last_login = now() WHERE id = ${user.id}`;

  const token = await createToken({ userId: user.id, email: user.email });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });

  return res;
}
