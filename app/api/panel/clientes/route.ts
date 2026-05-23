import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const sql = getDb();
  const clientes = await sql`
    SELECT id, nombre, telefono, email, municipio, direccion, notas, created_at
    FROM clientes WHERE activo = true ORDER BY nombre
  `;
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const { nombre, telefono, email, municipio, direccion, notas } = body;

  if (!nombre?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }

  const sql = getDb();
  const [row] = await sql`
    INSERT INTO clientes (nombre, telefono, email, municipio, direccion, notas)
    VALUES (
      ${nombre.trim()},
      ${telefono?.trim() || null},
      ${email?.trim()    || null},
      ${municipio?.trim()|| null},
      ${direccion?.trim()|| null},
      ${notas?.trim()    || null}
    )
    RETURNING id
  `;

  return NextResponse.json({ id: row.id }, { status: 201 });
}
