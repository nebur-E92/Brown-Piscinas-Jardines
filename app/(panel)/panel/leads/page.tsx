import { getDb } from "../../../../lib/panel/db";
import { getSession } from "../../../../lib/panel/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AccionesLead } from "./_components/AccionesLead";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  municipio: string | null;
  servicio: string | null;
  servicios: string | null;
  precio: string | null;
  mensaje: string | null;
  estado: string;
  created_at: string;
};

const ESTADO_BADGE: Record<string, string> = {
  nuevo:      "bg-blue-50 text-blue-700",
  contactado: "bg-yellow-50 text-yellow-700",
  convertido: "bg-green-50 text-green-700",
  descartado: "bg-neutral-100 text-neutral-400",
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function clienteHref(lead: Lead) {
  const params = new URLSearchParams();
  params.set("lead_id", lead.id);
  if (lead.nombre) params.set("nombre", lead.nombre);
  if (lead.email) params.set("email", lead.email);
  if (lead.telefono) params.set("telefono", lead.telefono);
  if (lead.municipio) params.set("municipio", lead.municipio);

  const pistas = [
    lead.servicio || lead.servicios ? `Servicio: ${lead.servicios || lead.servicio}` : "",
    lead.precio ? `Estimación: ${lead.precio}` : "",
    lead.mensaje ? `Mensaje: ${lead.mensaje}` : "",
  ].filter(Boolean);
  if (pistas.length > 0) params.set("notas", pistas.join("\n"));

  return `/panel/clientes/nuevo?${params.toString()}`;
}

export default async function LeadsPage() {
  if (!(await getSession())) redirect("/panel-login");

  const sql = getDb();
  const leads = await sql<Lead[]>`
    SELECT id, nombre, email, telefono, municipio, servicio, servicios, precio, mensaje, estado, created_at::text
    FROM leads
    ORDER BY created_at DESC
    LIMIT 200
  `;

  const nuevos     = leads.filter(l => l.estado === "nuevo").length;
  const convertidos = leads.filter(l => l.estado === "convertido").length;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Leads / Contactos</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {nuevos} nuevos · {convertidos} convertidos · {leads.length} total
          </p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p className="text-lg">Todavía no hay contactos</p>
          <p className="text-sm mt-1">Aparecerán aquí cuando alguien use el formulario o la calculadora</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white border border-neutral-200 rounded-xl shadow-sm p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{lead.nombre || "Sin nombre"}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[lead.estado] ?? ESTADO_BADGE.nuevo}`}>
                      {lead.estado}
                    </span>
                    <span className="text-xs text-neutral-400">{formatFecha(lead.created_at)}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {lead.email    && <span className="text-xs text-neutral-600">{lead.email}</span>}
                    {lead.telefono && <span className="text-xs text-neutral-600">{lead.telefono}</span>}
                    {lead.municipio && <span className="text-xs text-neutral-500">📍 {lead.municipio}</span>}
                  </div>

                  {(lead.servicio || lead.servicios) && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {lead.servicios || lead.servicio}
                      {lead.precio && <span className="ml-2 font-semibold text-black">{lead.precio}</span>}
                    </p>
                  )}

                  {lead.mensaje && (
                    <p className="text-xs text-neutral-600 mt-1 italic line-clamp-2">"{lead.mensaje}"</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0">
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs px-3 py-1.5 border rounded-lg hover:bg-neutral-50 transition"
                    >
                      Responder
                    </a>
                  )}
                  {lead.telefono && (
                    <a
                      href={`https://wa.me/34${lead.telefono.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 border rounded-lg hover:bg-neutral-50 transition"
                    >
                      WhatsApp
                    </a>
                  )}
                  <Link
                    href={clienteHref(lead)}
                    className="text-xs px-3 py-1.5 border border-black text-black rounded-lg hover:bg-black hover:text-white transition"
                  >
                    Crear cliente
                  </Link>
                  <AccionesLead leadId={lead.id} estadoActual={lead.estado} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
