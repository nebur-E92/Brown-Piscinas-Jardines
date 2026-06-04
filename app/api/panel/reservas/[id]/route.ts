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
const TIPOS_VISITA = ["mantenimiento", "puntual", "desbroce", "setos", "puesta_marcha", "otro"];

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const sql = getDb();

  // ── Gestionar reserva: enlazar cliente + crear visita sin duplicar agenda ──
  if (body.modo === "gestionar") {
    const crearCliente = body.crear_cliente === true;
    const clienteIdInput = cleanText(body.cliente_id, 80);
    const propiedadId = cleanText(body.propiedad_id, 80);
    const tipoVisita = TIPOS_VISITA.includes(body.tipo_visita) ? body.tipo_visita : "puntual";
    const precio = body.precio != null && body.precio !== "" ? Number(body.precio) : null;
    const notas = cleanLongText(body.notas, 1000);

    if (!crearCliente && !clienteIdInput) {
      return NextResponse.json({ error: "Selecciona un cliente." }, { status: 400 });
    }
    if (precio != null && Number.isNaN(precio)) {
      return NextResponse.json({ error: "Precio no válido." }, { status: 400 });
    }

    const result = await sql.begin(async (tx) => {
      const [reserva] = await tx<{
        fecha: string;
        nombre: string;
        email: string;
        telefono: string | null;
        municipio: string | null;
        notas: string | null;
        visita_id: string | null;
      }[]>`
        SELECT fecha::text, nombre, email, telefono, municipio, notas, visita_id
        FROM reservas
        WHERE id = ${id}
        FOR UPDATE
      `;
      if (!reserva) return { error: "Reserva no encontrada.", status: 404 as const };
      if (reserva.visita_id) return { error: "Esta reserva ya está gestionada.", status: 409 as const };

      let clienteId = clienteIdInput;
      if (crearCliente) {
        const cliente = body.cliente ?? {};
        const nombre = cleanText(cliente.nombre ?? reserva.nombre, 120);
        const email = cleanText(cliente.email ?? reserva.email, 160).toLowerCase();
        const telefono = cleanText(cliente.telefono ?? reserva.telefono, 40);
        const municipio = cleanText(cliente.municipio ?? reserva.municipio, 120);
        const notasCliente = cleanLongText(cliente.notas ?? `Reserva web: ${reserva.notas ?? ""}`, 1000);
        if (!nombre) return { error: "El nombre del cliente es obligatorio.", status: 400 as const };

        const [nuevo] = await tx<{ id: string }[]>`
          INSERT INTO clientes (nombre, email, telefono, municipio, notas)
          VALUES (${nombre}, ${email || null}, ${telefono || null}, ${municipio || null}, ${notasCliente || null})
          RETURNING id
        `;
        clienteId = nuevo.id;
      } else {
        const [cliente] = await tx<{ id: string }[]>`
          SELECT id FROM clientes WHERE id = ${clienteId} AND activo = true
        `;
        if (!cliente) return { error: "Cliente no encontrado.", status: 404 as const };
      }

      if (propiedadId) {
        const [propiedad] = await tx<{ id: string }[]>`
          SELECT id FROM propiedades WHERE id = ${propiedadId} AND cliente_id = ${clienteId} AND activa = true
        `;
        if (!propiedad) return { error: "La propiedad no pertenece al cliente seleccionado.", status: 400 as const };
      }

      const [visita] = await tx<{ id: string }[]>`
        INSERT INTO visitas (cliente_id, propiedad_id, tipo, fecha, precio, notas)
        VALUES (
          ${propiedadId ? null : clienteId},
          ${propiedadId || null},
          ${tipoVisita}::tipo_visita,
          ${reserva.fecha}::date,
          ${precio},
          ${notas || reserva.notas || null}
        )
        RETURNING id
      `;

      await tx`
        UPDATE reservas SET
          cliente_id = ${clienteId},
          visita_id = ${visita.id},
          gestionada_at = now()
        WHERE id = ${id}
      `;

      return { ok: true, cliente_id: clienteId, visita_id: visita.id };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  }

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
