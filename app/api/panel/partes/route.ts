import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";
import { normalizeJsonArray, type Actuacion } from "../../../../lib/panel/partes";

// GET /api/panel/partes?propiedad_id=X — listar partes de una instalación
export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const propiedadId = req.nextUrl.searchParams.get("propiedad_id");
  if (!propiedadId) return NextResponse.json({ error: "propiedad_id requerido." }, { status: 400 });

  const sql = getDb();
  const partes = await sql`
    SELECT
      pv.id,
      pv.propiedad_id,
      pv.anio,
      pv.numero_temporada,
      pv.created_at,
      ver.version,
      ver.estado,
      ver.fecha,
      ver.enviada_at
    FROM partes_visita pv
    LEFT JOIN LATERAL (
      SELECT version, estado, fecha, enviada_at
      FROM partes_versiones
      WHERE parte_id = pv.id
      ORDER BY version DESC
      LIMIT 1
    ) ver ON true
    WHERE pv.propiedad_id = ${propiedadId}
    ORDER BY pv.created_at DESC
  `;

  return NextResponse.json(partes);
}

// POST /api/panel/partes — crear parte + borrador con precarga
export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const { propiedad_id, visita_id } = body;

  if (!propiedad_id) return NextResponse.json({ error: "propiedad_id requerido." }, { status: 400 });

  const sql = getDb();

  // Verificar que la propiedad existe y está activa
  const [prop] = await sql`SELECT id, tipo FROM propiedades WHERE id = ${propiedad_id} AND activa = true`;
  if (!prop) return NextResponse.json({ error: "Propiedad no encontrada." }, { status: 404 });

  // Buscar última versión enviada de esta propiedad para precarga
  const [ultimaEnviada] = await sql`
    SELECT pver.actuaciones, pver.estado_agua, pver.estado_liner, pver.estado_equipos,
           pver.estado_jardin, pver.restos_vegetales
    FROM partes_versiones pver
    JOIN partes_visita pv ON pv.id = pver.parte_id
    WHERE pv.propiedad_id = ${propiedad_id}
      AND pver.estado = 'enviada'
    ORDER BY pver.fecha DESC, pver.created_at DESC
    LIMIT 1
  `;

  // Crear parte + borrador en transacción
  const result = await sql.begin(async (tx) => {
    const actuacionesPrevias = normalizeJsonArray<Actuacion>(ultimaEnviada?.actuaciones);
    const [parte] = await tx`
      INSERT INTO partes_visita (propiedad_id, visita_id)
      VALUES (${propiedad_id}, ${visita_id ?? null})
      RETURNING id, anio
    `;

    const [version] = await tx`
      INSERT INTO partes_versiones (
        parte_id, version, estado, fecha,
        actuaciones, estado_agua, estado_liner, estado_equipos, estado_jardin, restos_vegetales
      ) VALUES (
        ${parte.id}, 1, 'borrador', CURRENT_DATE,
        ${tx.json(actuacionesPrevias)},
        ${ultimaEnviada?.estado_agua ?? null},
        ${ultimaEnviada?.estado_liner ?? null},
        ${ultimaEnviada?.estado_equipos ?? null},
        ${ultimaEnviada?.estado_jardin ?? null},
        ${ultimaEnviada?.restos_vegetales ?? null}
      )
      RETURNING id
    `;

    return { parte_id: parte.id, version_id: version.id };
  });

  return NextResponse.json(result, { status: 201 });
}
