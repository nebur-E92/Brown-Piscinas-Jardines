import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";
import { cleanLongText, cleanText } from "../../../../lib/panel/reservas";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const sql = getDb();
  const clientes = await sql`
    SELECT id, nombre, telefono, email, municipio, direccion, notas, created_at
    FROM clientes WHERE activo = true ORDER BY nombre
  `;
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const nombre = cleanText(body.nombre, 120);
  const telefono = cleanText(body.telefono, 40);
  const email = cleanText(body.email, 160).toLowerCase();
  const municipio = cleanText(body.municipio, 120);
  const direccion = cleanText(body.direccion, 200);
  const notas = cleanLongText(body.notas, 1000);
  const leadId = cleanText(body.lead_id, 80);

  if (!nombre) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }

  const sql = getDb();
  const [row] = await sql`
    INSERT INTO clientes (nombre, telefono, email, municipio, direccion, notas)
    VALUES (
      ${nombre},
      ${telefono || null},
      ${email || null},
      ${municipio || null},
      ${direccion || null},
      ${notas || null}
    )
    RETURNING id
  `;

  if (leadId) {
    await sql`UPDATE leads SET estado = 'convertido' WHERE id = ${leadId}`;
  }

  return NextResponse.json({ id: row.id }, { status: 201 });
}
