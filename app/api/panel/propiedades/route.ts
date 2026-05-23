import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const { cliente_id, tipo, tamano_jardin, tamano_piscina, municipio, direccion, precio_acordado, notas } = body;

  if (!cliente_id || !tipo) {
    return NextResponse.json({ error: "cliente_id y tipo son obligatorios." }, { status: 400 });
  }

  const tiposValidos = ["jardin", "piscina", "combinado"];
  if (!tiposValidos.includes(tipo)) {
    return NextResponse.json({ error: "Tipo no válido." }, { status: 400 });
  }

  const sql = getDb();
  const [row] = await sql`
    INSERT INTO propiedades
      (cliente_id, tipo, tamano_jardin, tamano_piscina, municipio, direccion, precio_acordado, notas)
    VALUES (
      ${cliente_id},
      ${tipo}::tipo_propiedad,
      ${tamano_jardin  ?? null}::tamano_prop,
      ${tamano_piscina ?? null}::tamano_prop,
      ${municipio      ?? null},
      ${direccion      ?? null},
      ${precio_acordado != null ? parseFloat(precio_acordado) : null},
      ${notas          ?? null}
    )
    RETURNING id
  `;

  return NextResponse.json({ id: row.id }, { status: 201 });
}
