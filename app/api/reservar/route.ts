import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "../../../lib/panel/db";

const resend = new Resend(process.env.RESEND_API_KEY);

const FRANJA_LABEL: Record<string, string> = {
  manana: "Mañana (9:00–14:00)",
  tarde:  "Tarde (15:00–19:00)",
};

const TIPO_LABEL: Record<string, string> = {
  visita_tecnica: "Visita técnica gratuita",
  cesped:         "Mantenimiento de césped",
  piscina:        "Mantenimiento de piscina",
  setos:          "Recorte de setos",
  desbroce:       "Desbroce de terreno",
  otro:           "Otro servicio",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tipo, servicio, fecha, franja, nombre, email, telefono, municipio, notas, precio } = body;

  if (!fecha || !franja || !nombre || !email) {
    return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
  }

  const tipoLabel   = TIPO_LABEL[tipo] ?? tipo;
  const franjaLabel = FRANJA_LABEL[franja] ?? franja;
  const fechaLabel  = new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ── 1. Guardar en DB ──────────────────────────────────────────────────────
  try {
    const sql = getDb();
    await sql`
      INSERT INTO reservas (tipo, servicio, fecha, franja, nombre, email, telefono, municipio, notas)
      VALUES (
        ${tipo       ?? "visita_tecnica"},
        ${servicio   ?? null},
        ${fecha}::date,
        ${franja},
        ${nombre},
        ${email},
        ${telefono   ?? null},
        ${municipio  ?? null},
        ${notas      ?? null}
      )
    `;
  } catch (e) {
    console.error("Error guardando reserva:", e);
    return NextResponse.json({ error: "Error al guardar la reserva." }, { status: 500 });
  }

  // ── 2. Email a Rubén ──────────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from:    "Brown Piscinas <noreply@brownpiscinasyjardines.com>",
      to:      process.env.NOTIFY_EMAIL!,
      replyTo: email,
      subject: `Nueva reserva: ${tipoLabel} — ${nombre} (${fechaLabel})`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#111;border-bottom:2px solid #111;padding-bottom:8px">
            📅 Nueva reserva — Brown Piscinas &amp; Jardines
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666;width:120px">Servicio</td><td style="padding:6px 0;border-bottom:1px solid #eee"><strong>${tipoLabel}</strong></td></tr>
            <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Fecha</td><td style="padding:6px 0;border-bottom:1px solid #eee"><strong style="text-transform:capitalize">${fechaLabel}</strong></td></tr>
            <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Franja</td><td style="padding:6px 0;border-bottom:1px solid #eee">${franjaLabel}</td></tr>
            <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Nombre</td><td style="padding:6px 0;border-bottom:1px solid #eee">${nombre}</td></tr>
            <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Email</td><td style="padding:6px 0;border-bottom:1px solid #eee"><a href="mailto:${email}">${email}</a></td></tr>
            ${telefono ? `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Teléfono</td><td style="padding:6px 0;border-bottom:1px solid #eee"><a href="tel:${telefono}">${telefono}</a></td></tr>` : ""}
            ${municipio ? `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Municipio</td><td style="padding:6px 0;border-bottom:1px solid #eee">${municipio}</td></tr>` : ""}
            ${precio ? `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Estimación</td><td style="padding:6px 0;border-bottom:1px solid #eee">${precio} €</td></tr>` : ""}
            ${notas ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top">Notas</td><td style="padding:6px 0">${notas}</td></tr>` : ""}
          </table>
          <p style="margin-top:24px;font-size:12px;color:#999">
            Ver todas las reservas en el <a href="https://brownpiscinasyjardines.com/panel/reservas">panel de gestión</a>.
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Error email Rubén:", e);
  }

  // ── 3. Email de confirmación al cliente ───────────────────────────────────
  try {
    await resend.emails.send({
      from:    "Brown Piscinas <noreply@brownpiscinasyjardines.com>",
      to:      email,
      subject: `Reserva recibida — ${tipoLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#111;border-bottom:2px solid #111;padding-bottom:8px">
            ✅ Hemos recibido tu reserva
          </h2>
          <p style="color:#444;font-size:14px">Hola <strong>${nombre}</strong>,</p>
          <p style="color:#444;font-size:14px">
            Hemos recibido tu solicitud de cita. Nos pondremos en contacto contigo en menos de 24 h para confirmarla.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0">
            <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666;width:120px">Servicio</td><td style="padding:6px 0;border-bottom:1px solid #eee"><strong>${tipoLabel}</strong></td></tr>
            <tr><td style="padding:6px 0;border-bottom:1px solid #eee;color:#666">Fecha solicitada</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-transform:capitalize"><strong>${fechaLabel}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Franja</td><td style="padding:6px 0">${franjaLabel}</td></tr>
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
  } catch (e) {
    console.error("Error email cliente:", e);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
