import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";
import { cleanLongText, cleanText, isFranja, isValidISODate } from "../../../../lib/panel/reservas";

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const fecha = body.fecha;
  const franja = body.franja || null;
  const motivo = cleanText(body.motivo, 120) || "Bloqueado";
  const notas = cleanLongText(body.notas, 500);

  if (!isValidISODate(fecha) || (franja !== null && !isFranja(franja))) {
    return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  }

  const sql = getDb();
  const [row] = await sql<{ id: string }[]>`
    INSERT INTO bloqueos (fecha, franja, motivo, notas)
    VALUES (${fecha}::date, ${franja}, ${motivo}, ${notas || null})
    RETURNING id
  `;

  return NextResponse.json({ id: row.id }, { status: 201 });
}

