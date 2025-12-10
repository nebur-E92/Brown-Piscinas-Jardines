import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    const raw = process.env.PRICING_TABLE;
    if (!raw) {
      return NextResponse.json({ servicios: [] });
    }
    const table = JSON.parse(raw);
    const servicios = (table.servicios || []).filter((s: any) => s.id !== 'desplazamiento');
    return NextResponse.json({ servicios });
  } catch {
    return NextResponse.json({ servicios: [] });
  }
}
