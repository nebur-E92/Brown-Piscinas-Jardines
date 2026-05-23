import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/panel/db";

export async function GET() {
  try {
    const sql = getDb();
    // Contar reservas por fecha y franja para los próximos 90 días
    const filas = await sql<{ fecha: string; franja: string; total: number }[]>`
      SELECT fecha::text, franja, COUNT(*)::int AS total
      FROM reservas
      WHERE fecha >= CURRENT_DATE
        AND fecha <= CURRENT_DATE + INTERVAL '90 days'
        AND estado != 'cancelada'
      GROUP BY fecha, franja
    `;

    const ocupacion: Record<string, { manana: number; tarde: number }> = {};
    for (const f of filas) {
      if (!ocupacion[f.fecha]) ocupacion[f.fecha] = { manana: 0, tarde: 0 };
      ocupacion[f.fecha][f.franja as "manana" | "tarde"] = f.total;
    }

    return NextResponse.json({ ocupacion });
  } catch {
    return NextResponse.json({ ocupacion: {} });
  }
}
