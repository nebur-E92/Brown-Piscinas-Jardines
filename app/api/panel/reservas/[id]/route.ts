import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/panel/auth";
import { getDb } from "../../../../../lib/panel/db";
import { Resend } from "resend";
import {
  cleanLongText,
  cleanText,
  escapeHtml,
  isFranja,
  isReservaTipo,
  isValidEmail,
  isValidISODate,
} from "../../../../../lib/panel/reservas";

type Params = Promise<{ id: string }>;

const ESTADOS = ["pendiente", "confirmada", "cancelada"];

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const sql = getDb();

  // ── Edición completa de la reserva ────────────────────────────────────────
  if (body.modo === "editar") {
    const fecha = body.fecha;
    const franja = body.franja;
    const tipo = body.tipo;
    const nombre = cleanText(body.nombre, 120);
    const email = cleanText(body.email, 160).toLowerCase();
    const telefono = cleanText(body.telefono, 40);
    const municipio = cleanText(body.municipio, 120);
    const notas = cleanLongText(body.notas, 1000);

    if (!isValidISODate(fecha) || !isFranja(franja) || !isReservaTipo(tipo) || !nombre || !isValidEmail(email)) {
      return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
    }
    await sql`
      UPDATE reservas SET
        fecha     = ${fecha}::date,
        franja    = ${franja},
        tipo      = ${tipo},
        nombre    = ${nombre},
        email     = ${email},
        telefono  = ${telefono  || null},
        municipio = ${municipio || null},
        notas     = ${notas     || null}
      WHERE id = ${id}
    `;
    return NextResponse.json({ ok: true });
  }

  // ── Cambio de estado (confirmar / cancelar) ───────────────────────────────
  const { estado } = body;
  const mensajeCliente = cleanLongText(body.mensaje_cliente, 1000);
  if (!ESTADOS.includes(estado)) return NextResponse.json({ error: "Estado no válido." }, { status: 400 });

  const [reserva] = await sql<{ nombre: string; email: string; fecha: string; franja: string }[]>`
    SELECT nombre, email, fecha::text, franja FROM reservas WHERE id = ${id}
  `;

  await sql`
    UPDATE reservas SET
      estado = ${estado},
      mensaje_cliente = ${mensajeCliente || null},
      mensaje_cliente_updated_at = CASE WHEN ${mensajeCliente || null}::text IS NULL THEN mensaje_cliente_updated_at ELSE now() END
    WHERE id = ${id}
  `;

  if (reserva?.email && (estado === "confirmada" || estado === "cancelada")) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY no configurado; se omite el email de estado de reserva.");
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(resendApiKey);
    const fechaLabel  = new Date(reserva.fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const franjaLabel = reserva.franja === "manana" ? "Mañana (9:00–14:00)" : "Tarde (15:00–19:00)";
    const safeNombre = escapeHtml(reserva.nombre);
    const safeFecha = escapeHtml(fechaLabel);
    const safeFranja = escapeHtml(franjaLabel);
    const safeMensaje = escapeHtml(mensajeCliente);
    const mensajeHtml = safeMensaje
      ? `<div style="margin:16px 0;padding:12px;background:#f5f5f5;border-radius:8px"><p style="margin:0;color:#444">${safeMensaje}</p></div>`
      : "";
    try {
      await resend.emails.send({
        from: "Brown Piscinas <noreply@brownpiscinasyjardines.com>",
        to:   reserva.email,
        subject: estado === "confirmada" ? `✅ Cita confirmada — ${fechaLabel}` : `Cita cancelada — Brown Piscinas & Jardines`,
        html: estado === "confirmada"
          ? `<div style="font-family:sans-serif;max-width:560px"><h2 style="color:#111">✅ Tu cita está confirmada</h2><p>Hola <strong>${safeNombre}</strong>,</p><p>Tu cita ha sido confirmada para el <strong style="text-transform:capitalize">${safeFecha}</strong>, ${safeFranja}.</p>${mensajeHtml}<p>Si necesitas cambiarla escríbenos a <a href="mailto:brownpiscinasyjardines@gmail.com">brownpiscinasyjardines@gmail.com</a> o por <a href="https://wa.me/34625199394">WhatsApp</a>.</p></div>`
          : `<div style="font-family:sans-serif;max-width:560px"><h2 style="color:#111">Tu cita ha sido cancelada</h2><p>Hola <strong>${safeNombre}</strong>,</p><p>Hemos tenido que cancelar tu cita del <strong>${safeFecha}</strong>.</p>${mensajeHtml}<p>Contáctanos para buscar otra fecha.</p><p><a href="https://wa.me/34625199394">WhatsApp: 625 199 394</a></p></div>`,
      });
    } catch (e) { console.error("Error email:", e); }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM reservas WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
