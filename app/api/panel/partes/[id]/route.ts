import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";
import { normalizeJsonArray, type Actuacion, type Medicion } from "../../../../../lib/panel/partes";

type Params = Promise<{ id: string }>;

// GET /api/panel/partes/[id] — detalle con todas las versiones
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  const [parte] = await sql`
    SELECT pv.*, p.tipo AS prop_tipo, p.direccion, p.ref_servicio, p.tipo_cliente, p.contexto_equipo,
           c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
    FROM partes_visita pv
    JOIN propiedades p ON p.id = pv.propiedad_id
    JOIN clientes c ON c.id = p.cliente_id
    WHERE pv.id = ${id}
  `;

  if (!parte) return NextResponse.json({ error: "Parte no encontrado." }, { status: 404 });

  const versiones = await sql`
    SELECT * FROM partes_versiones
    WHERE parte_id = ${id}
    ORDER BY version ASC
  `;

  return NextResponse.json({
    ...parte,
    versiones: versiones.map((version) => ({
      ...version,
      mediciones: normalizeJsonArray<Medicion>(version.mediciones),
      actuaciones: normalizeJsonArray<Actuacion>(version.actuaciones),
    })),
  });
}

// PUT /api/panel/partes/[id] — reemplazar borrador completo (autosave)
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const sql = getDb();
  const mediciones = normalizeJsonArray<Medicion>(body.mediciones);
  const actuaciones = normalizeJsonArray<Actuacion>(body.actuaciones);

  const result = await sql`
    UPDATE partes_versiones SET
      fecha             = ${body.fecha ?? null},
      hora_entrada      = ${body.hora_entrada ?? null},
      hora_salida       = ${body.hora_salida ?? null},
      mediciones        = ${sql.json(mediciones)},
      actuaciones       = ${sql.json(actuaciones)},
      estado_agua       = ${body.estado_agua ?? null},
      estado_liner      = ${body.estado_liner ?? null},
      estado_equipos    = ${body.estado_equipos ?? null},
      estado_jardin     = ${body.estado_jardin ?? null},
      cierre_preventivo = ${body.cierre_preventivo ?? false},
      cierre_motivo     = ${body.cierre_motivo ?? null},
      incidencias       = ${body.incidencias ?? null},
      recomendaciones   = ${body.recomendaciones ?? null},
      stock_titular     = ${body.stock_titular ?? null},
      restos_vegetales  = ${body.restos_vegetales ?? null},
      updated_at        = now()
    WHERE parte_id = ${id} AND estado = 'borrador'
  `;

  if (result.count === 0) {
    return NextResponse.json({ error: "No hay borrador activo para este parte." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/panel/partes/[id] — eliminar parte (solo si todo es borrador)
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  // Verificar que no hay versiones no-borrador
  const [noborrador] = await sql`
    SELECT 1 FROM partes_versiones
    WHERE parte_id = ${id} AND estado != 'borrador'
    LIMIT 1
  `;

  if (noborrador) {
    return NextResponse.json({ error: "No se puede eliminar: tiene versiones finalizadas o enviadas." }, { status: 409 });
  }

  await sql`DELETE FROM partes_visita WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
