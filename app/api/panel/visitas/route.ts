import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/panel/auth";
import { getDb } from "../../../../lib/panel/db";

export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  const sql = getDb();

  const rows = await sql`
    SELECT
      v.id, v.fecha::text, v.tipo, v.estado, v.precio::text, v.notas,
      v.eff_cliente_id AS cliente_id, v.cliente_nombre,
      p.tipo AS prop_tipo, v.eff_municipio AS municipio
    FROM visitas_con_cliente v
    LEFT JOIN propiedades p ON p.id = v.propiedad_id
    WHERE
      (${desde}::date IS NULL OR v.fecha >= ${desde}::date)
      AND (${hasta}::date IS NULL OR v.fecha <= ${hasta}::date)
    ORDER BY v.fecha
  `;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const body = await req.json();
  const { cliente_id, propiedad_id, tipo, fecha, precio, notas } = body;

  if (!fecha || Boolean(cliente_id) === Boolean(propiedad_id)) {
    return NextResponse.json({ error: "Indica cliente o propiedad, pero no ambos." }, { status: 400 });
  }

  const tiposValidos = ["mantenimiento", "puntual", "desbroce", "setos", "puesta_marcha", "otro"];
  const tipoFinal = tiposValidos.includes(tipo) ? tipo : "mantenimiento";

  const sql = getDb();
  const [row] = await sql`
    INSERT INTO visitas (cliente_id, propiedad_id, tipo, fecha, precio, notas)
    VALUES (
      ${cliente_id || null},
      ${propiedad_id || null},
      ${tipoFinal}::tipo_visita,
      ${fecha}::date,
      ${precio != null ? parseFloat(precio) : null},
      ${notas ?? null}
    )
    RETURNING id
  `;

  return NextResponse.json({ id: row.id }, { status: 201 });
}
