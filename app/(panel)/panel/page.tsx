import { getDb } from "../../../lib/panel/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type KPI = { clientes: number; visitas_mes: number; facturado_mes: number; proximas: number };
type Proxima = { id: string; fecha: string; tipo: string; cliente_nombre: string; propiedad_municipio: string | null; precio: string | null };

async function getData() {
  const sql = getDb();

  const [kpi] = await sql<KPI[]>`
    SELECT
      (SELECT count(*)::int FROM clientes WHERE activo = true)                          AS clientes,
      (SELECT count(*)::int FROM visitas
         WHERE date_trunc('month', fecha) = date_trunc('month', current_date))          AS visitas_mes,
      (SELECT coalesce(sum(precio), 0)::int FROM visitas
         WHERE date_trunc('month', fecha) = date_trunc('month', current_date)
           AND estado = 'completada')                                                   AS facturado_mes,
      (SELECT count(*)::int FROM visitas
         WHERE estado = 'programada' AND fecha >= current_date)                         AS proximas
  `;

  const proximas = await sql<Proxima[]>`
    SELECT
      v.id,
      v.fecha::text,
      v.tipo,
      v.precio::text,
      c.nombre AS cliente_nombre,
      p.municipio AS propiedad_municipio
    FROM visitas v
    JOIN propiedades p ON p.id = v.propiedad_id
    JOIN clientes c    ON c.id = p.cliente_id
    WHERE v.estado = 'programada' AND v.fecha >= current_date
    ORDER BY v.fecha
    LIMIT 8
  `;

  const manana = await sql<Proxima[]>`
    SELECT
      v.id,
      v.fecha::text,
      v.tipo,
      v.precio::text,
      c.nombre AS cliente_nombre,
      p.municipio AS propiedad_municipio
    FROM visitas v
    JOIN propiedades p ON p.id = v.propiedad_id
    JOIN clientes c    ON c.id = p.cliente_id
    WHERE v.estado = 'programada' AND v.fecha = current_date + 1
    ORDER BY c.nombre
  `;

  return { kpi, proximas, manana };
}

function fmt(date: string) {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

const TIPO_LABEL: Record<string, string> = {
  mantenimiento: "Mantenimiento",
  puntual:       "Puntual",
  desbroce:      "Desbroce",
  setos:         "Setos",
  puesta_marcha: "Puesta en marcha",
  otro:          "Otro",
};

export default async function DashboardPage() {
  const { kpi, proximas, manana } = await getData();

  const hoy = new Date().toISOString().slice(0, 10);
  const visitasHoy = proximas.filter((v) => v.fecha === hoy);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <h1 className="text-xl font-bold mb-1">Inicio</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Clientes activos",     value: kpi.clientes,      unit: "" },
          { label: "Visitas este mes",      value: kpi.visitas_mes,   unit: "" },
          { label: "Facturado este mes",    value: kpi.facturado_mes, unit: " €" },
          { label: "Visitas pendientes",    value: kpi.proximas,      unit: "" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-neutral-500 mb-1">{label}</p>
            <p className="text-2xl font-bold">{value}{unit}</p>
          </div>
        ))}
      </div>

      {/* Visitas de hoy */}
      {visitasHoy.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-3">
            Hoy
          </h2>
          <div className="bg-white border rounded-xl shadow-sm divide-y">
            {visitasHoy.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{v.cliente_nombre}</p>
                  <p className="text-xs text-neutral-500">
                    {TIPO_LABEL[v.tipo] ?? v.tipo}
                    {v.propiedad_municipio ? ` · ${v.propiedad_municipio}` : ""}
                  </p>
                </div>
                {v.precio && (
                  <p className="text-sm font-semibold">{v.precio} €</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visitas de mañana */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Mañana
          </h2>
          <Link href="/panel/agenda" className="text-xs text-black underline">
            Ver agenda
          </Link>
        </div>
        {manana.length === 0 ? (
          <div className="bg-white border rounded-xl shadow-sm px-4 py-3 text-sm text-neutral-400">
            Sin visitas programadas para mañana.
          </div>
        ) : (
          <div className="bg-white border rounded-xl shadow-sm divide-y">
            {manana.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{v.cliente_nombre}</p>
                  <p className="text-xs text-neutral-500">
                    {TIPO_LABEL[v.tipo] ?? v.tipo}
                    {v.propiedad_municipio ? ` · ${v.propiedad_municipio}` : ""}
                  </p>
                </div>
                {v.precio && (
                  <p className="text-sm font-semibold">{v.precio} €</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximas visitas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Próximas visitas
          </h2>
          <Link href="/panel/agenda/nueva" className="text-xs text-black underline">
            + Nueva visita
          </Link>
        </div>

        {proximas.length === 0 ? (
          <p className="text-sm text-neutral-400">No hay visitas programadas.</p>
        ) : (
          <div className="bg-white border rounded-xl shadow-sm divide-y">
            {proximas.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{v.cliente_nombre}</p>
                  <p className="text-xs text-neutral-500">
                    {TIPO_LABEL[v.tipo] ?? v.tipo}
                    {v.propiedad_municipio ? ` · ${v.propiedad_municipio}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold">{fmt(v.fecha)}</p>
                  {v.precio && <p className="text-xs text-neutral-500">{v.precio} €</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
