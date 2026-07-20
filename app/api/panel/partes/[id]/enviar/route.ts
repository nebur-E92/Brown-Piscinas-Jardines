import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../../lib/panel/auth";
import { getDb } from "../../../../../../lib/panel/db";

type Params = Promise<{ id: string }>;

// POST /api/panel/partes/[id]/enviar — marcar como enviada
export async function POST(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  const result = await sql.begin(async (tx) => {
    const [version] = await tx`
      SELECT id, estado
      FROM partes_versiones
      WHERE parte_id = ${id}
      ORDER BY version DESC
      LIMIT 1
      FOR UPDATE
    `;

    if (!version) throw new Error("NOT_FOUND");
    if (version.estado !== "finalizado") throw new Error("NOT_FINALIZADO");

    await tx`
      UPDATE partes_versiones SET
        estado = 'enviada',
        enviada_at = now(),
        updated_at = now()
      WHERE id = ${version.id} AND estado = 'finalizado'
    `;
    return { ok: true };
  }).catch((err) => {
    if (err.message === "NOT_FOUND") return { error: "Parte no encontrado.", status: 404 };
    if (err.message === "NOT_FINALIZADO") {
      return { error: "El parte debe estar finalizado antes de enviar.", status: 409 };
    }
    throw err;
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
