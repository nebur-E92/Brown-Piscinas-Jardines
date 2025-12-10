import { NextRequest, NextResponse } from "next/server";
import { addQRConversion } from "../../../lib/qrStore";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload = Object.fromEntries(form.entries());

  // Envío a Formspree (email)
  const formspree = process.env.FORMSPREE_ENDPOINT;
  if (formspree) {
    try {
      // Formspree funciona mejor con application/x-www-form-urlencoded
      const params = new URLSearchParams();
      Object.entries(payload).forEach(([k, v]) => params.append(k, String(v)));
      // Compatibilidad: _replyto para responder al remitente
      if (!payload["_replyto"] && payload["email"]) {
        params.append("_replyto", String(payload["email"]));
      }
      await fetch(formspree, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: params.toString()
      });
    } catch (e) {
      console.error('Formspree error:', e);
    }
  }

  // Webhook n8n (opcional, V2.1+)
  const webhook = process.env.N8N_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (e) {
      // Ignorar error de reenvío pero continuar
    }
  }

  // Track QR conversion if qr_source is present
  const qrSource = payload.qr_source as string;
  if (qrSource) {
    try {
      await addQRConversion(qrSource);
    } catch (e) {
      console.error('QR conversion tracking error:', e);
    }
  }

  const thanks = new URL('/contacto?enviado=1', req.url);
  return NextResponse.redirect(thanks, { status: 303 });
}
