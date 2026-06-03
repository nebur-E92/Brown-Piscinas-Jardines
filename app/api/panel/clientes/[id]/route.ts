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

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  const hard = req.nextUrl.searchParams.get("hard") === "1";

  if (hard) {
    const [deps] = await sql<{ propiedades_count: number; visitas_count: number }[]>`
      SELECT
        (SELECT COUNT(*)::int FROM propiedades WHERE cliente_id = ${id}) AS propiedades_count,
        (
          SELECT COUNT(*)::int
          FROM visitas v
          JOIN propiedades p ON p.id = v.propiedad_id
          WHERE p.cliente_id = ${id}
        ) AS visitas_count
    `;

    const propiedadesCount = deps?.propiedades_count ?? 0;
    const visitasCount = deps?.visitas_count ?? 0;
    if (propiedadesCount > 0 || visitasCount > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar definitivamente: el cliente tiene propiedades o visitas asociadas." },
        { status: 409 }
      );
    }

    const deleted = await sql`DELETE FROM clientes WHERE id = ${id} RETURNING id`;
    if (deleted.length === 0) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  await sql`UPDATE clientes SET activo = false, updated_at = now() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
