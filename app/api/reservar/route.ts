import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "../../../lib/panel/db";
import { checkRateLimit } from "../../../lib/panel/rateLimit";
import {
  cleanLongText,
  cleanText,
  escapeHtml,
  FRANJA_LABEL,
  isFranja,
  isReservaTipo,
  isValidEmail,
  isValidISODate,
  TIPO_LABEL,
} from "../../../lib/panel/reservas";

function getClientKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const clientKey = getClientKey(req);
  if (!(await checkRateLimit(`reservar:${clientKey}`, 8, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Demasiados intentos. Inténtalo más tarde." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  if (cleanText(body.website, 100)) {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
  }

  const tipo = isReservaTipo(body.tipo) ? body.tipo : "visita_tecnica";
  const fecha = body.fecha;
  const franja = body.franja;
  const nombre = cleanText(body.nombre, 120);
  const email = cleanText(body.email, 160).toLowerCase();
  const telefono = cleanText(body.telefono, 40);
  const municipio = cleanText(body.municipio, 120);
  const notas = cleanLongText(body.notas, 1000);
  const servicio = cleanText(body.servicio, 200);
  const precio = cleanText(body.precio, 40);

  if (!isValidISODate(fecha) || !isFranja(franja) || !nombre || !isValidEmail(email)) {
    return NextResponse.json({ error: "Datos de reserva no válidos." }, { status: 400 });
  }

  const tipoLabel   = TIPO_LABEL[tipo];
  const franjaLabel = FRANJA_LABEL[franja];
  const fechaLabel  = new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const safe = {
    tipoLabel: escapeHtml(tipoLabel),
    franjaLabel: escapeHtml(franjaLabel),
    fechaLabel: escapeHtml(fechaLabel),
    nombre: escapeHtml(nombre),
    email: escapeHtml(email),
    telefono: escapeHtml(telefono),
    municipio: escapeHtml(municipio),
    notas: escapeHtml(notas),
    precio: escapeHtml(precio),
  };
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  // ── 1. Guardar en DB ──────────────────────────────────────────────────────
  try {
    const sql = getDb();
    await sql`
      INSERT INTO reservas (tipo, servicio, fecha, franja, nombre, email, telefono, municipio, notas)
      VALUES (
        ${tipo},
        ${servicio   || null},
        ${fecha}::date,
        ${franja},
        ${nombre},
        ${email},
        ${telefono   || null},
        ${municipio  || null},
        ${notas      || null}
      )
    `;
  } catch (e) {
    console.error("Error guardando reserva:", e);
    return NextResponse.json({ error: "Error al guardar la reserva." }, { status: 500 });
  }

  // ── 2. Email a Rubén ──────────────────────────────────────────────────────
  try {
    if (!resendApiKey || !notifyEmail) {
      console.warn("RESEND_API_KEY o NOTIFY_EMAIL no configurados; se omite el email interno de reserva.");
    } else {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from:    "Brown Piscinas <noreply@brownpiscinasyjardines.com>",
        to:      notifyEmail,
        replyTo: email,
        subject: `Nueva reserva: ${tipoLabel} — ${nombre} (${fechaLabel})`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#111;border-bottom:2px solid #111;padding-bottom:8px">
              📅 Nueva reserva — Brown Piscinas &amp; Jardines
            </h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666;width:120px">Servicio</td><td style="padding:6px 0;border-bottom:1px solid #eee"><strong>${safe.tipoLabel}</strong></td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Fecha</td><td style="padding:6px 0;border-bottom:1px solid #eee"><strong style="text-transform:capitalize">${safe.fechaLabel}</strong></td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Franja</td><td style="padding:6px 0;border-bottom:1px solid #eee">${safe.franjaLabel}</td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Nombre</td><td style="padding:6px 0;border-bottom:1px solid #eee">${safe.nombre}</td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:6px 0;border-bottom:1px solid #eee"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
              ${telefono ? `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Teléfono</td><td style="padding:6px 0;border-bottom:1px solid #eee"><a href="tel:${safe.telefono}">${safe.telefono}</a></td></tr>` : ""}
              ${municipio ? `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Municipio</td><td style="padding:6px 0;border-bottom:1px solid #eee">${safe.municipio}</td></tr>` : ""}
              ${precio ? `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Estimación</td><td style="padding:6px 0;border-bottom:1px solid #eee">${safe.precio} €</td></tr>` : ""}
              ${notas ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top">Notas</td><td style="padding:6px 0">${safe.notas}</td></tr>` : ""}
            </table>
            <p style="margin-top:24px;font-size:12px;color:#999">
              Ver todas las reservas en el <a href="https://brownpiscinasyjardines.com/panel/reservas">panel de gestión</a>.
            </p>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error("Error email Rubén:", e);
  }

  // ── 3. Email de confirmación al cliente ───────────────────────────────────
  try {
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY no configurado; se omite el email de confirmación al cliente.");
    } else {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from:    "Brown Piscinas <noreply@brownpiscinasyjardines.com>",
        to:      email,
        subject: `Reserva recibida — ${tipoLabel}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#111;border-bottom:2px solid #111;padding-bottom:8px">
              ✅ Hemos recibido tu reserva
            </h2>
            <p style="color:#444;font-size:14px">Hola <strong>${safe.nombre}</strong>,</p>
            <p style="color:#444;font-size:14px">
              Hemos recibido tu solicitud de cita. Nos pondremos en contacto contigo en menos de 24 h para confirmarla.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0">
              <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666;width:120px">Servicio</td><td style="padding:6px 0;border-bottom:1px solid #eee"><strong>${safe.tipoLabel}</strong></td></tr>
              <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Fecha solicitada</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-transform:capitalize"><strong>${safe.fechaLabel}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#666">Franja</td><td style="padding:6px 0">${safe.franjaLabel}</td></tr>
            </table>
            <p style="color:#444;font-size:14px">
              Si necesitas cambiar algo, escríbenos a
              <a href="mailto:brownpiscinasyjardines@gmail.com">brownpiscinasyjardines@gmail.com</a>
              o por <a href="https://wa.me/34625199394">WhatsApp</a>.
            </p>
            <p style="color:#999;font-size:12px;margin-top:24px">
              Brown Piscinas &amp; Jardines · Salamanca
            </p>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error("Error email cliente:", e);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
