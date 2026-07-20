import { getDb } from "../../../../../lib/panel/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiFileText } from "react-icons/fi";
import { NuevaPropiedadForm } from "./_components/NuevaPropiedadForm";
import { EditarPropiedadForm } from "./_components/EditarPropiedadForm";
import { AccionesVisita } from "./_components/AccionesVisita";
import { AccionesCliente } from "./_components/AccionesCliente";
import { HistoricoParametros } from "./_components/HistoricoParametros";

export const dynamic = "force-dynamic";

type Cliente = { id: string; nombre: string; telefono: string | null; email: string | null; municipio: string | null; direccion: string | null; notas: string | null };
type Propiedad = { id: string; tipo: string; tamano_jardin: string | null; tamano_piscina: string | null; municipio: string | null; direccion: string | null; precio_acordado: string | null; notas: string | null; ref_servicio: string | null; tipo_cliente: string | null; contexto_equipo: string | null };
type Visita = { id: string; fecha: string; tipo: string; estado: string; precio: string | null; notas: string | null; propiedad_id: string | null };
type ParteResumen = { id: string; propiedad_id: string; numero_temporada: number | null; estado: string; fecha: string };

const TIPO_PROP: Record<string, string> = { jardin: "Jardín", piscina: "Piscina", combinado: "Combinado" };
const TAMANO: Record<string, string>    = { pequeno: "Pequeño", mediano: "Mediano", grande: "Grande" };
const TIPO_V: Record<string, string>    = { mantenimiento: "Mant.", puntual: "Puntual", desbroce: "Desbroce", setos: "Setos", puesta_marcha: "P. Marcha", otro: "Otro" };
const ESTADO_BADGE: Record<string, string> = {
  programada:  "bg-blue-50 text-blue-700",
  completada:  "bg-green-50 text-green-700",
  cancelada:   "bg-neutral-100 text-neutral-500",
};

function fmtDate(d: string) {
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

async function getData(id: string) {
  const sql = getDb();
  const [cliente] = await sql<Cliente[]>`SELECT * FROM clientes WHERE id = ${id} AND activo = true`;
  if (!cliente) return null;

  const propiedades = await sql<Propiedad[]>`
    SELECT id, tipo, tamano_jardin, tamano_piscina, municipio, direccion, precio_acordado::text, notas, ref_servicio, tipo_cliente, contexto_equipo
    FROM propiedades WHERE cliente_id = ${id} AND activa = true ORDER BY created_at
  `;

  const visitas = await sql<Visita[]>`
    SELECT id, fecha::text, tipo, estado, precio::text, notas, propiedad_id
    FROM visitas_con_cliente
    WHERE eff_cliente_id = ${id}
    ORDER BY fecha DESC
    LIMIT 30
  `;

  const partes = await sql<ParteResumen[]>`
    SELECT pv.id, pv.propiedad_id, pv.numero_temporada,
           ver.estado, ver.fecha::text AS fecha
    FROM partes_visita pv
    LEFT JOIN LATERAL (
      SELECT estado, fecha FROM partes_versiones
      WHERE parte_id = pv.id ORDER BY version DESC LIMIT 1
    ) ver ON true
    WHERE pv.propiedad_id = ANY(${propiedades.map((p) => p.id)})
    ORDER BY pv.created_at DESC
  `;

  return { cliente, propiedades, visitas, partes };
}

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) return notFound();

  const { cliente, propiedades, visitas, partes } = data;

  return (
    <div className="w-full max-w-3xl p-4 sm:p-6 md:p-8">
      <Link href="/panel/clientes" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-6">
        <FiArrowLeft size={14} /> Clientes
      </Link>

      {/* Cabecera */}
      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">{cliente.nombre}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-neutral-500">
              {cliente.telefono  && <a href={`tel:${cliente.telefono}`} className="hover:text-black">{cliente.telefono}</a>}
              {cliente.email     && <a href={`mailto:${cliente.email}`} className="hover:text-black">{cliente.email}</a>}
              {cliente.municipio && <span>{cliente.municipio}</span>}
            </div>
            {cliente.direccion && <p className="text-xs text-neutral-400 mt-0.5">{cliente.direccion}</p>}
          </div>
          <Link
            href={`/panel/agenda/nueva?cliente_id=${id}`}
            className="flex items-center gap-1.5 border border-black text-black px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black hover:text-white transition"
          >
            <FiPlus size={12} /> Visita
          </Link>
        </div>
        {cliente.notas && (
          <p className="mt-3 text-xs text-neutral-500 bg-neutral-50 rounded p-2 border">{cliente.notas}</p>
        )}
        <AccionesCliente clienteId={id} canHardDelete={propiedades.length === 0 && visitas.length === 0} />
      </div>

      {/* Propiedades */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Propiedades</h2>
        </div>

        <div className="space-y-3">
          {propiedades.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl shadow-sm p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-sm">{TIPO_PROP[p.tipo] ?? p.tipo}</p>
                  <div className="flex flex-wrap gap-x-3 text-xs text-neutral-500 mt-0.5">
                    {p.tamano_jardin  && <span>Jardín {TAMANO[p.tamano_jardin]}</span>}
                    {p.tamano_piscina && <span>Piscina {TAMANO[p.tamano_piscina]}</span>}
                    {p.municipio      && <span>{p.municipio}</span>}
                    {p.direccion      && <span>{p.direccion}</span>}
                  </div>
                </div>
                {p.precio_acordado && (
                  <span className="text-sm font-semibold">{p.precio_acordado} €/mes</span>
                )}
              </div>
              {p.ref_servicio && (
                <p className="text-xs text-neutral-500 mt-1">Ref: <span className="font-mono">{p.ref_servicio}</span></p>
              )}
              {p.notas && <p className="text-xs text-neutral-400 mt-1">{p.notas}</p>}
              <EditarPropiedadForm propiedad={p} />

              {/* Botón Nuevo Parte + listado de partes */}
              <div className="mt-3 pt-3 border-t">
                {p.ref_servicio ? (
                  <Link
                    href={`/panel/partes/nuevo?propiedad_id=${p.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-black hover:bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-1.5 transition"
                  >
                    <FiFileText size={12} /> Nuevo parte
                  </Link>
                ) : (
                  <p className="text-[11px] text-neutral-400">Configura la referencia de servicio para crear partes.</p>
                )}

                {partes.filter((pt) => pt.propiedad_id === p.id).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {partes.filter((pt) => pt.propiedad_id === p.id).slice(0, 5).map((pt) => (
                      <Link key={pt.id} href={`/panel/partes/${pt.id}`} className="flex items-center justify-between text-xs py-1 hover:bg-neutral-50 rounded px-1">
                        <span>{pt.fecha ? fmtDate(pt.fecha) : "—"} {pt.numero_temporada != null && `· nº ${pt.numero_temporada}`}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                          pt.estado === "enviada" ? "bg-green-50 text-green-700" :
                          pt.estado === "finalizado" ? "bg-blue-50 text-blue-700" :
                          pt.estado === "borrador" ? "bg-yellow-50 text-yellow-700" :
                          "bg-neutral-100 text-neutral-500"
                        }`}>{pt.estado}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Histórico de parámetros (solo si incluye piscina) */}
              {(p.tipo === "piscina" || p.tipo === "combinado") && (
                <div className="mt-3 pt-3 border-t">
                  <HistoricoParametros propiedadId={p.id} />
                </div>
              )}
            </div>
          ))}

          {/* Formulario para añadir propiedad */}
          <NuevaPropiedadForm clienteId={id} />
        </div>
      </div>

      {/* Historial de visitas */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-3">
          Historial de visitas
        </h2>

        {visitas.length === 0 ? (
          <p className="text-sm text-neutral-400">Sin visitas registradas.</p>
        ) : (
          <div className="bg-white border rounded-xl shadow-sm divide-y">
            {visitas.map((v) => (
              <div key={v.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{fmtDate(v.fecha)}</span>
                    <span className="text-xs text-neutral-500">{TIPO_V[v.tipo] ?? v.tipo}</span>
                    {!v.propiedad_id && <span className="text-xs text-neutral-400">Puntual</span>}
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${ESTADO_BADGE[v.estado]}`}>
                      {v.estado}
                    </span>
                  </div>
                  {v.notas && <p className="text-xs text-neutral-400 mt-0.5 truncate">{v.notas}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {v.precio && <span className="text-sm font-semibold">{v.precio} €</span>}
                  {v.estado === "programada" && (
                    <AccionesVisita visitaId={v.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
