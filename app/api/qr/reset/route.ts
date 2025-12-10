import { NextResponse } from "next/server";
import { resetQRData } from "../../../../lib/qrStore";

export const runtime = "nodejs";

export async function POST() {
  await resetQRData();
  return NextResponse.json({ ok: true });
}
