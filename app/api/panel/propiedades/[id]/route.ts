import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";

type Params = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const sql = getDb();

  const tiposClienteValidos = ["particular", "comunidad", "casa_rural"];
  if (body.tipo_cliente && !tiposClienteValidos.includes(body.tipo_cliente)) {
    return NextResponse.json({ error: "Tipo de cliente no válido." }, { status: 400 });
  }

  await sql`
    UPDATE propiedades SET
      tipo            = COALESCE(${body.tipo            ?? null}::tipo_propiedad, tipo),
      tamano_jardin   = COALESCE(${body.tamano_jardin   ?? null}::tamano_prop,    tamano_jardin),
      tamano_piscina  = COALESCE(${body.tamano_piscina  ?? null}::tamano_prop,    tamano_piscina),
      municipio       = COALESCE(${body.municipio       ?? null}, municipio),
      direccion       = COALESCE(${body.direccion       ?? null}, direccion),
      precio_acordado = COALESCE(${body.precio_acordado != null ? parseFloat(body.precio_acordado) : null}, precio_acordado),
      notas           = COALESCE(${body.notas           ?? null}, notas),
      ref_servicio    = COALESCE(${body.ref_servicio    ?? null}, ref_servicio),
      tipo_cliente    = COALESCE(${body.tipo_cliente    ?? null}, tipo_cliente),
      contexto_equipo = COALESCE(${body.contexto_equipo ?? null}, contexto_equipo),
      updated_at = now()
    WHERE id = ${id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();
  await sql`UPDATE propiedades SET activa = false, updated_at = now() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
