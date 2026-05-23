import { NextResponse } from "next/server";
import { resetQRData } from "../../../../lib/qrStore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await resetQRData();
  // Redirige de vuelta al panel para no dejar al usuario en JSON
  const url = new URL(req.url);
  url.pathname = "/analitica-qr";
  return NextResponse.redirect(url);
}
