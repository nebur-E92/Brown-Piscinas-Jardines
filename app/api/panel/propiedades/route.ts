import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const { cliente_id, tipo, tamano_jardin, tamano_piscina, municipio, direccion, precio_acordado, notas, ref_servicio, tipo_cliente, contexto_equipo } = body;

  if (!cliente_id || !tipo) {
    return NextResponse.json({ error: "cliente_id y tipo son obligatorios." }, { status: 400 });
  }

  const tiposValidos = ["jardin", "piscina", "combinado"];
  if (!tiposValidos.includes(tipo)) {
    return NextResponse.json({ error: "Tipo no válido." }, { status: 400 });
  }

  const tiposClienteValidos = ["particular", "comunidad", "casa_rural"];
  if (tipo_cliente && !tiposClienteValidos.includes(tipo_cliente)) {
    return NextResponse.json({ error: "Tipo de cliente no válido." }, { status: 400 });
  }

  const sql = getDb();
  const [row] = await sql`
    INSERT INTO propiedades
      (cliente_id, tipo, tamano_jardin, tamano_piscina, municipio, direccion, precio_acordado, notas, ref_servicio, tipo_cliente, contexto_equipo)
    VALUES (
      ${cliente_id},
      ${tipo}::tipo_propiedad,
      ${tamano_jardin  ?? null}::tamano_prop,
      ${tamano_piscina ?? null}::tamano_prop,
      ${municipio      ?? null},
      ${direccion      ?? null},
      ${precio_acordado != null ? parseFloat(precio_acordado) : null},
      ${notas          ?? null},
      ${ref_servicio   ?? null},
      ${tipo_cliente   ?? null},
      ${contexto_equipo ?? null}
    )
    RETURNING id
  `;

  return NextResponse.json({ id: row.id }, { status: 201 });
}
