import { getDb } from "../../../../../lib/panel/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { NuevaPropiedadForm } from "./_components/NuevaPropiedadForm";
import { AccionesVisita } from "./_components/AccionesVisita";
import { AccionesCliente } from "./_components/AccionesCliente";

export const dynamic = "force-dynamic";

type Cliente = { id: string; nombre: string; telefono: string | null; email: string | null; municipio: string | null; direccion: string | null; notas: string | null };
type Propiedad = { id: string; tipo: string; tamano_jardin: string | null; tamano_piscina: string | null; municipio: string | null; direccion: string | null; precio_acordado: string | null; notas: string | null };
type Visita = { id: string; fecha: string; tipo: string; estado: string; precio: string | null; notas: string | null; propiedad_id: string | null };

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
    SELECT id, tipo, tamano_jardin, tamano_piscina, municipio, direccion, precio_acordado::text, notas
    FROM propiedades WHERE cliente_id = ${id} AND activa = true ORDER BY created_at
  `;

  const visitas = await sql<Visita[]>`
    SELECT id, fecha::text, tipo, estado, precio::text, notas, propiedad_id
    FROM visitas_con_cliente
    WHERE eff_cliente_id = ${id}
    ORDER BY fecha DESC
    LIMIT 30
  `;

  return { cliente, propiedades, visitas };
}

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) return notFound();

  const { cliente, propiedades, visitas } = data;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href="/panel/clientes" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-6">
        <FiArrowLeft size={14} /> Clientes
      </Link>

      {/* Cabecera */}
      <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between">
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
              <div className="flex items-start justify-between">
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
              {p.notas && <p className="text-xs text-neutral-400 mt-2">{p.notas}</p>}
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
              <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{fmtDate(v.fecha)}</span>
                    <span className="text-xs text-neutral-500">{TIPO_V[v.tipo] ?? v.tipo}</span>
                    {!v.propiedad_id && <span className="text-xs text-neutral-400">Puntual</span>}
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${ESTADO_BADGE[v.estado]}`}>
                      {v.estado}
                    </span>
                  </div>
                  {v.notas && <p className="text-xs text-neutral-400 mt-0.5 truncate">{v.notas}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
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
