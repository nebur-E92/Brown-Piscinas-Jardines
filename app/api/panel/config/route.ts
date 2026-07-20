import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const sql = getDb();
  const [user] = await sql`
    SELECT nombre_profesional, firma_base64
    FROM panel_users WHERE id = ${session.userId}
  `;

  return NextResponse.json(user ?? { nombre_profesional: null, firma_base64: null });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const sql = getDb();

  await sql`
    UPDATE panel_users SET
      nombre_profesional = COALESCE(${body.nombre_profesional ?? null}, nombre_profesional),
      firma_base64       = COALESCE(${body.firma_base64       ?? null}, firma_base64)
    WHERE id = ${session.userId}
  `;

  return NextResponse.json({ ok: true });
}
