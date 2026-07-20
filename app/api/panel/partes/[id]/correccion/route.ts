import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../../lib/panel/auth";
import { getDb } from "../../../../../../lib/panel/db";
import { normalizeJsonArray, type Actuacion, type Medicion } from "../../../../../../lib/panel/partes";

type Params = Promise<{ id: string }>;

// POST /api/panel/partes/[id]/correccion — crear versión correctora
export async function POST(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  // Buscar la última versión enviada
  const [enviada] = await sql`
    SELECT * FROM partes_versiones
    WHERE parte_id = ${id} AND estado = 'enviada'
    ORDER BY version DESC LIMIT 1
  `;

  if (!enviada) {
    return NextResponse.json({ error: "No hay versión enviada para corregir." }, { status: 409 });
  }

  // Verificar que no hay ya un borrador activo
  const [borradorExistente] = await sql`
    SELECT 1 FROM partes_versiones
    WHERE parte_id = ${id} AND estado = 'borrador'
  `;

  if (borradorExistente) {
    return NextResponse.json({ error: "Ya existe un borrador de corrección." }, { status: 409 });
  }

  const mediciones = normalizeJsonArray<Medicion>(enviada.mediciones);
  const actuaciones = normalizeJsonArray<Actuacion>(enviada.actuaciones);

  // Crear nueva versión como borrador, copiando datos de la enviada
  const [nueva] = await sql`
    INSERT INTO partes_versiones (
      parte_id, version, estado, fecha,
      hora_entrada, hora_salida,
      mediciones, actuaciones,
      estado_agua, estado_liner, estado_equipos, estado_jardin,
      cierre_preventivo, cierre_motivo,
      incidencias, recomendaciones, stock_titular, restos_vegetales,
      corrige_version_id
    ) VALUES (
      ${id}, ${enviada.version + 1}, 'borrador', ${enviada.fecha},
      ${enviada.hora_entrada}, ${enviada.hora_salida},
      ${sql.json(mediciones)}, ${sql.json(actuaciones)},
      ${enviada.estado_agua}, ${enviada.estado_liner}, ${enviada.estado_equipos}, ${enviada.estado_jardin},
      ${enviada.cierre_preventivo}, ${enviada.cierre_motivo},
      ${enviada.incidencias}, ${enviada.recomendaciones}, ${enviada.stock_titular}, ${enviada.restos_vegetales},
      ${enviada.id}
    )
    RETURNING id, version
  `;

  return NextResponse.json({ version_id: nueva.id, version: nueva.version }, { status: 201 });
}
