import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();
  const [c] = await sql`SELECT * FROM clientes WHERE id = ${id} AND activo = true`;
  if (!c) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const sql = getDb();

  await sql`
    UPDATE clientes SET
      nombre    = COALESCE(${body.nombre    ?? null}, nombre),
      telefono  = COALESCE(${body.telefono  ?? null}, telefono),
      email     = COALESCE(${body.email     ?? null}, email),
      municipio = COALESCE(${body.municipio ?? null}, municipio),
      direccion = COALESCE(${body.direccion ?? null}, direccion),
      notas     = COALESCE(${body.notas     ?? null}, notas),
      updated_at = now()
    WHERE id = ${id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();
  await sql`UPDATE clientes SET activo = false, updated_at = now() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
