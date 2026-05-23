import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { addQRConversion } from "../../../lib/qrStore";
import { getDb } from "../../../lib/panel/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const p = Object.fromEntries(form.entries()) as Record<string, string>;

  // ── 1. Guardar lead en Neon ───────────────────────────────────────────────
  try {
    const sql = getDb();
    await sql`
      INSERT INTO leads (nombre, email, telefono, municipio, servicio, servicios, tamano, frecuencia, precio, mensaje, qr_source)
      VALUES (
        ${p.nombre    || null},
        ${p.email     || null},
        ${p.telefono  || null},
        ${p.municipio || null},
        ${p.servicio  || null},
        ${p.servicios || null},
        ${p.tamano    || null},
        ${p.frecuencia|| null},
        ${p.precio    || null},
        ${p.mensaje   || null},
        ${p.qr_source || null}
      )
    `;
  } catch (e) {
    console.error("Error guardando lead en DB:", e);
  }

  // ── 2. Email de notificación vía Resend ───────────────────────────────────
  try {
    const lineas: string[] = [];
    if (p.nombre)    lineas.push(`<b>Nombre:</b> ${p.nombre}`);
    if (p.email)     lineas.push(`<b>Email:</b> ${p.email}`);
    if (p.telefono)  lineas.push(`<b>Teléfono:</b> ${p.telefono}`);
    if (p.municipio) lineas.push(`<b>Municipio:</b> ${p.municipio}`);
    if (p.servicio)  lineas.push(`<b>Servicio:</b> ${p.servicio}`);
    if (p.servicios) lineas.push(`<b>Servicios calculados:</b> ${p.servicios}`);
    if (p.tamano)    lineas.push(`<b>Tamaño:</b> ${p.tamano}`);
    if (p.frecuencia)lineas.push(`<b>Frecuencia:</b> ${p.frecuencia}`);
    if (p.precio)    lineas.push(`<b>Precio estimado:</b> ${p.precio}`);
    if (p.mensaje)   lineas.push(`<b>Mensaje:</b><br>${p.mensaje.replace(/\n/g, "<br>")}`);

    await resend.emails.send({
      from:    "Brown Piscinas <noreply@brownpiscinasyjardines.com>",
      to:      process.env.NOTIFY_EMAIL!,
      replyTo: p.email || undefined,
      subject: `Nuevo contacto${p.nombre ? ` de ${p.nombre}` : ""}${p.municipio ? ` — ${p.municipio}` : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#111;border-bottom:2px solid #111;padding-bottom:8px">
            🌱 Nuevo contacto — Brown Piscinas &amp; Jardines
          </h2>
          <table style="width:100%;border-collapse:collapse">
            ${lineas.map(l => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${l}</td></tr>`).join("")}
          </table>
          <p style="margin-top:24px;font-size:12px;color:#999">
            Puedes ver todos los contactos en el
            <a href="https://brownpiscinasyjardines.com/panel">panel de gestión</a>.
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Error enviando email con Resend:", e);
  }

  // ── 3. Tracking QR (existente) ────────────────────────────────────────────
  if (p.qr_source) {
    try { await addQRConversion(p.qr_source); } catch { /* ignorar */ }
  }

  return NextResponse.redirect(new URL("/contacto?enviado=1", req.url), { status: 303 });
}
