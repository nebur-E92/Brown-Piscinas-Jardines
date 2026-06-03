import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { addQRConversion } from "../../../lib/qrStore";
import { getDb } from "../../../lib/panel/db";
import { checkRateLimit } from "../../../lib/panel/rateLimit";
import { cleanLongText, cleanText, escapeHtml, isValidEmail } from "../../../lib/panel/reservas";

function getClientKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const clientKey = getClientKey(req);
  if (!(await checkRateLimit(`contact:${clientKey}`, 8, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Demasiados intentos. Inténtalo más tarde." }, { status: 429 });
  }

  const form = await req.formData();
  const raw = Object.fromEntries(form.entries()) as Record<string, string>;

  if (cleanText(raw.website, 100)) {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const p = {
    nombre: cleanText(raw.nombre, 120),
    email: cleanText(raw.email, 160).toLowerCase(),
    telefono: cleanText(raw.telefono, 40),
    municipio: cleanText(raw.municipio, 120),
    servicio: cleanText(raw.servicio, 120),
    servicios: cleanText(raw.servicios, 300),
    tamano: cleanText(raw.tamano, 80),
    frecuencia: cleanText(raw.frecuencia, 80),
    precio: cleanText(raw.precio, 40),
    mensaje: cleanLongText(raw.mensaje, 1500),
    qr_source: cleanText(raw.qr_source, 120),
  };

  if (!isValidEmail(p.email) || !p.mensaje) {
    return NextResponse.json({ error: "Datos de contacto no válidos." }, { status: 400 });
  }

  // ── 1. Guardar lead en Neon ───────────────────────────────────────────────
  try {
    const sql = getDb();
    await sql`
      INSERT INTO leads (nombre, email, telefono, municipio, servicio, servicios, tamano, frecuencia, precio, mensaje, qr_source)
      VALUES (
        ${p.nombre || null},
        ${p.email},
        ${p.telefono || null},
        ${p.municipio || null},
        ${p.servicio || null},
        ${p.servicios || null},
        ${p.tamano || null},
        ${p.frecuencia || null},
        ${p.precio || null},
        ${p.mensaje},
        ${p.qr_source || null}
      )
    `;
  } catch (e) {
    console.error("Error guardando lead en DB:", e);
  }

  // ── 2. Email de notificación vía Resend ───────────────────────────────────
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;
    if (!resendApiKey || !notifyEmail) {
      console.warn("RESEND_API_KEY o NOTIFY_EMAIL no configurados; se omite el envío de email.");
    } else {
      const resend = new Resend(resendApiKey);

    const lineas: string[] = [];
    if (p.nombre) lineas.push(`<b>Nombre:</b> ${escapeHtml(p.nombre)}`);
    lineas.push(`<b>Email:</b> ${escapeHtml(p.email)}`);
    if (p.telefono) lineas.push(`<b>Teléfono:</b> ${escapeHtml(p.telefono)}`);
    if (p.municipio) lineas.push(`<b>Municipio:</b> ${escapeHtml(p.municipio)}`);
    if (p.servicio) lineas.push(`<b>Servicio:</b> ${escapeHtml(p.servicio)}`);
    if (p.servicios) lineas.push(`<b>Servicios calculados:</b> ${escapeHtml(p.servicios)}`);
    if (p.tamano) lineas.push(`<b>Tamaño:</b> ${escapeHtml(p.tamano)}`);
    if (p.frecuencia) lineas.push(`<b>Frecuencia:</b> ${escapeHtml(p.frecuencia)}`);
    if (p.precio) lineas.push(`<b>Precio estimado:</b> ${escapeHtml(p.precio)}`);
    lineas.push(`<b>Mensaje:</b><br>${escapeHtml(p.mensaje).replace(/\n/g, "<br>")}`);

      await resend.emails.send({
        from:    "Brown Piscinas <noreply@brownpiscinasyjardines.com>",
        to:      notifyEmail,
        replyTo: p.email,
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
    }
  } catch (e) {
    console.error("Error enviando email con Resend:", e);
  }

  // ── 3. Tracking QR (existente) ────────────────────────────────────────────
  if (p.qr_source) {
    try { await addQRConversion(p.qr_source); } catch { /* ignorar */ }
  }

  return NextResponse.redirect(new URL("/contacto?enviado=1", req.url), { status: 303 });
}
