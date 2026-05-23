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
      c.id AS cliente_id, c.nombre AS cliente_nombre,
      p.tipo AS prop_tipo, p.municipio
    FROM visitas v
    JOIN propiedades p ON p.id = v.propiedad_id
    JOIN clientes c    ON c.id = p.cliente_id
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
  const { propiedad_id, tipo, fecha, precio, notas } = body;

  if (!propiedad_id || !fecha) {
    return NextResponse.json({ error: "propiedad_id y fecha son obligatorios." }, { status: 400 });
  }

  const tiposValidos = ["mantenimiento", "puntual", "desbroce", "setos", "puesta_marcha", "otro"];
  const tipoFinal = tiposValidos.includes(tipo) ? tipo : "mantenimiento";

  const sql = getDb();
  const [row] = await sql`
    INSERT INTO visitas (propiedad_id, tipo, fecha, precio, notas)
    VALUES (
      ${propiedad_id},
      ${tipoFinal}::tipo_visita,
      ${fecha}::date,
      ${precio != null ? parseFloat(precio) : null},
      ${notas ?? null}
    )
    RETURNING id
  `;

  return NextResponse.json({ id: row.id }, { status: 201 });
}
