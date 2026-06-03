import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/panel/db";
import { getOcupacion } from "../../../../lib/panel/disponibilidad";

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const sql = getDb();
    const desde = toISODate(new Date());
    const hastaDate = new Date();
    hastaDate.setDate(hastaDate.getDate() + 90);
    const hasta = toISODate(hastaDate);
    const ocupacion = await getOcupacion(sql, desde, hasta);

    return NextResponse.json({ ocupacion });
  } catch {
    return NextResponse.json({ ocupacion: {} });
  }
}
