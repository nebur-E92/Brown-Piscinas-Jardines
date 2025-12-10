import { NextRequest, NextResponse } from "next/server";
import { estimatePrice, loadPricing } from "../../../lib/pricing";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pricing = loadPricing();
  if (!pricing) return NextResponse.json({ error: 'PRICING_TABLE not set' }, { status: 500 });
  const total = estimatePrice(pricing, body);
  if (total && typeof total === "object" && (total as any).errores) {
    return NextResponse.json({ error: "invalid_request", detalles: (total as any).errores }, { status: 400 });
  }
  if (total === null) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  return NextResponse.json({ total });
}
