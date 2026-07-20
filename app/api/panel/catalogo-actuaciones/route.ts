import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const sql = getDb();
  const rows = await sql`
    SELECT id, ambito, nombre, orden
    FROM catalogo_actuaciones
    WHERE activo = true
    ORDER BY ambito, orden
  `;

  const agrupado = {
    piscina: rows.filter((r) => r.ambito === "piscina"),
    jardin:  rows.filter((r) => r.ambito === "jardin"),
  };

  return NextResponse.json(agrupado);
}
