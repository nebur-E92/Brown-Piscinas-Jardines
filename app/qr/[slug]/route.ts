import { NextRequest, NextResponse } from "next/server";
import { addQRLog } from "../../../lib/qrStore";
import { LOCATIONS } from "../../../lib/seo";

const EXTRA_WHITELIST = ["flyer-enero", "flyer-verano", "web-home", "cartel-piscina", "cartel-jardin"];

const normalizeSlug = (value: string) =>
  value
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-]/gi, '')
    .toLowerCase();

function getAllowedSlugs(): string[] {
  const base = [...LOCATIONS.map((l) => l.slug), ...EXTRA_WHITELIST];
  return base.map(normalizeSlug);
}

export async function GET(req: NextRequest, context: { params: { slug: string } }) {
  const raw = context.params.slug || "unknown";
  const zone = normalizeSlug(raw);
  const allowed = getAllowedSlugs();
  if (!allowed.includes(zone)) {
    // Skip logging invalid slug to avoid métricas basura
    return NextResponse.redirect(new URL(process.env.QR_REDIRECT_PATH || "/", req.url));
  }
  
  await addQRLog(zone, req.headers);

  const webhook = process.env.N8N_QR_WEBHOOK_URL;
  if (webhook) {
    const payload = {
      ts: new Date().toISOString(),
      zone,
      ua: req.headers.get('user-agent') || '',
      ip: req.headers.get('x-forwarded-for') || '',
      ref: req.headers.get('referer') || '',
    };
    // fire-and-forget
    fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
  }

  const target = process.env.QR_REDIRECT_PATH || "/";
  const response = NextResponse.redirect(new URL(target, req.url));
  
  // Set cookie to track QR source for conversion attribution
  response.cookies.set('qr_source', zone, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  });
  
  return response;
}
