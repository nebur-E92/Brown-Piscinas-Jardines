import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";
import { normalizeJsonArray, type Medicion } from "../../../../../lib/panel/partes";

// GET /api/panel/partes/historico?propiedad_id=X — histórico de parámetros
export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const propiedadId = req.nextUrl.searchParams.get("propiedad_id");
  if (!propiedadId) return NextResponse.json({ error: "propiedad_id requerido." }, { status: 400 });

  const sql = getDb();

  const rows = await sql`
    SELECT pver.fecha, pver.mediciones, pver.version, pv.numero_temporada
    FROM partes_versiones pver
    JOIN partes_visita pv ON pv.id = pver.parte_id
    WHERE pv.propiedad_id = ${propiedadId}
      AND pver.estado = 'enviada'
    ORDER BY pver.fecha DESC
    LIMIT 10
  `;

  return NextResponse.json(rows.map((row) => ({
    ...row,
    mediciones: normalizeJsonArray<Medicion>(row.mediciones),
  })));
}
