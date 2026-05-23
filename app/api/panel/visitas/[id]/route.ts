import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";

type Params = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const sql = getDb();

  const estadosValidos = ["programada", "completada", "cancelada"];
  const estado = body.estado && estadosValidos.includes(body.estado) ? body.estado : null;

  await sql`
    UPDATE visitas SET
      estado     = COALESCE(${estado}::estado_visita, estado),
      tipo       = COALESCE(${body.tipo   ?? null}::tipo_visita, tipo),
      fecha      = COALESCE(${body.fecha  ?? null}::date, fecha),
      precio     = COALESCE(${body.precio != null ? parseFloat(body.precio) : null}, precio),
      notas      = COALESCE(${body.notas  ?? null}, notas),
      updated_at = now()
    WHERE id = ${id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM visitas WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
