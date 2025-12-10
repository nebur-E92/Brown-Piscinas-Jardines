import { NextResponse } from "next/server";
import { getQRLogs } from "../../../../lib/qrStore";

export const runtime = "nodejs";

export async function GET() {
  const logs = await getQRLogs();
  const headers = ["ts","zone","device","ua","ip","ref","conv"];
  const rows = logs.slice().reverse().map(l => [
    l.ts,
    l.zone,
    l.device,
    (l.ua || "").replace(/\n/g, " "),
    l.ip || "",
    l.ref || "",
    l.conv ? "1" : "0"
  ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=qr-logs.csv",
    },
  });
}
