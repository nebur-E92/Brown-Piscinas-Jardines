import { NextRequest, NextResponse } from "next/server";
import { calcularPrecio, ServicioReq } from "../../../lib/pricing";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as { servicios?: unknown }).servicios)
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const servicios = (body as { servicios: ServicioReq[] }).servicios;
  const result = calcularPrecio(servicios);

  if ("errores" in result) {
    return NextResponse.json(
      { error: "invalid_request", detalles: result.errores },
      { status: 400 },
    );
  }

  return NextResponse.json(result);
}
