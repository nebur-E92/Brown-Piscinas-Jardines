import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../../../lib/panel/auth";
import { getDb } from "../../../../../../../lib/panel/db";

type Params = Promise<{ id: string; v: string }>;

// GET /api/panel/partes/[id]/version/[v] — datos de una versión concreta
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id, v } = await params;
  const sql = getDb();

  const [version] = await sql`
    SELECT pver.*, pv.numero_temporada, pv.anio, pv.propiedad_id
    FROM partes_versiones pver
    JOIN partes_visita pv ON pv.id = pver.parte_id
    WHERE pver.parte_id = ${id} AND pver.version = ${parseInt(v)}
  `;

  if (!version) return NextResponse.json({ error: "Versión no encontrada." }, { status: 404 });

  return NextResponse.json(version);
}
