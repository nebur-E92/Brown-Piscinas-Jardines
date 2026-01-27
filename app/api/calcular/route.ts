import { NextRequest, NextResponse } from "next/server";
import { estimatePrice, loadPricing } from "../../../lib/pricing";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pricing = loadPricing();
  if (!pricing) return NextResponse.json({ error: 'PRICING_TABLE not set' }, { status: 500 });
  const result = estimatePrice(pricing, body);
  if (!result) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  if ('errores' in result) {
    return NextResponse.json({ error: "invalid_request", detalles: result.errores }, { status: 400 });
  }
  return NextResponse.json(result);
}
