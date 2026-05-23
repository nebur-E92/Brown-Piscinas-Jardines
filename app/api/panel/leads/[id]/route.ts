import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";

type Params = Promise<{ id: string }>;

const ESTADOS_VALIDOS = ["nuevo", "contactado", "convertido", "descartado"];

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const { estado } = await req.json();

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }

  const sql = getDb();
  await sql`UPDATE leads SET estado = ${estado} WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
