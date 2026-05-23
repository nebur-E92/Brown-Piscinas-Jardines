import { getDb } from "../../../../lib/panel/db";
import { getSession } from "../../../../lib/panel/auth";
import { redirect } from "next/navigation";
import { AccionesReserva } from "./_components/AccionesReserva";
import { EditarReserva } from "./_components/EditarReserva";

export const dynamic = "force-dynamic";

type Reserva = {
  id: string; fecha: string; franja: string; tipo: string;
  nombre: string; email: string; telefono: string | null;
  municipio: string | null; notas: string | null;
  estado: string; created_at: string;
};

const TIPO_LABEL: Record<string, string> = {
  visita_tecnica: "Visita técnica",
  cesped: "Césped", piscina: "Piscina",
  setos: "Setos", desbroce: "Desbroce", otro: "Otro",
};

const ESTADO_BADGE: Record<string, string> = {
  pendiente:  "bg-yellow-50 text-yellow-700",
  confirmada: "bg-green-50 text-green-700",
  cancelada:  "bg-neutral-100 text-neutral-400",
};

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default async function ReservasPage() {
  if (!(await getSession())) redirect("/panel-login");

  const sql = getDb();
  const reservas = await sql<Reserva[]>`
    SELECT id, fecha::text, franja, tipo, nombre, email, telefono, municipio, notas, estado, created_at::text
    FROM reservas
    ORDER BY fecha ASC, franja ASC
    LIMIT 300
  `;

  const pendientes  = reservas.filter((r) => r.estado === "pendiente").length;
  const confirmadas = reservas.filter((r) => r.estado === "confirmada").length;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Reservas</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {pendientes} pendientes · {confirmadas} confirmadas · {reservas.length} total
          </p>
        </div>
      </div>

      {reservas.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-lg">Todavía no hay reservas</p>
          <p className="text-sm mt-1">Aparecerán aquí cuando un cliente reserve desde la web</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservas.map((r) => (
            <div key={r.id} className={`bg-white border rounded-xl shadow-sm p-4 ${r.estado === "cancelada" ? "opacity-50" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.nombre}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[r.estado]}`}>
                      {r.estado}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    <span className="text-xs font-medium text-black capitalize">{formatFecha(r.fecha)}</span>
                    <span className="text-xs text-neutral-500">{r.franja === "manana" ? "Mañana 9–14h" : "Tarde 15–19h"}</span>
                    <span className="text-xs text-neutral-400">{TIPO_LABEL[r.tipo] ?? r.tipo}</span>
                    {r.municipio && <span className="text-xs text-neutral-400">📍 {r.municipio}</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-3 mt-1">
                    {r.email    && <span className="text-xs text-neutral-500">{r.email}</span>}
                    {r.telefono && <span className="text-xs text-neutral-500">{r.telefono}</span>}
                  </div>
                  {r.notas && (
                    <p className="text-xs text-neutral-500 mt-1 italic line-clamp-1">"{r.notas}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {r.telefono && (
                    <a
                      href={`https://wa.me/34${r.telefono.replace(/\D/g,"")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 border rounded-lg hover:bg-neutral-50 transition"
                    >
                      WhatsApp
                    </a>
                  )}
                  <EditarReserva reserva={r} />
                  <AccionesReserva reservaId={r.id} estadoActual={r.estado} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
