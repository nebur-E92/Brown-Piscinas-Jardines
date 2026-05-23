import { getDb } from "../../../../lib/panel/db";
import Link from "next/link";
import { FiPlus, FiUser } from "react-icons/fi";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  nombre: string;
  telefono: string | null;
  municipio: string | null;
  propiedades: number;
  ultima_visita: string | null;
  proxima_visita: string | null;
};

async function getClientes(): Promise<Row[]> {
  const sql = getDb();
  return sql<Row[]>`
    SELECT
      c.id,
      c.nombre,
      c.telefono,
      c.municipio,
      count(DISTINCT p.id)::int                     AS propiedades,
      max(v.fecha) FILTER (WHERE v.estado = 'completada')::text  AS ultima_visita,
      min(v.fecha) FILTER (WHERE v.estado = 'programada' AND v.fecha >= current_date)::text AS proxima_visita
    FROM clientes c
    LEFT JOIN propiedades p ON p.cliente_id = c.id AND p.activa = true
    LEFT JOIN visitas v     ON v.propiedad_id = p.id
    WHERE c.activo = true
    GROUP BY c.id
    ORDER BY c.nombre
  `;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Clientes</h1>
          <p className="text-sm text-neutral-500">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""} activo{clientes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/panel/clientes/nuevo"
          className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
        >
          <FiPlus size={14} />
          Nuevo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <FiUser size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Todavía no hay clientes. Añade el primero.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Municipio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Propiedades</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Última visita</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Próxima</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/panel/clientes/${c.id}`} className="font-medium hover:underline">
                      {c.nombre}
                    </Link>
                    {c.telefono && (
                      <p className="text-xs text-neutral-400 mt-0.5">{c.telefono}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">{c.municipio ?? "—"}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="bg-neutral-100 text-neutral-700 rounded-full px-2 py-0.5 text-xs">
                      {c.propiedades}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">{fmtDate(c.ultima_visita)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {c.proxima_visita ? (
                      <span className="text-black font-medium">{fmtDate(c.proxima_visita)}</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
