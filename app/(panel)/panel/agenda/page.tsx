import { getDb } from "../../../../lib/panel/db";
import Link from "next/link";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AccionesVisitaAgenda } from "./_components/AccionesVisitaAgenda";

export const dynamic = "force-dynamic";

type Visita = {
  id: string;
  fecha: string;
  tipo: string;
  estado: string;
  precio: string | null;
  notas: string | null;
  cliente_nombre: string;
  cliente_id: string;
  municipio: string | null;
};

const TIPO_LABEL: Record<string, string> = {
  mantenimiento: "Mantenimiento",
  puntual:       "Puntual",
  desbroce:      "Desbroce",
  setos:         "Setos",
  puesta_marcha: "Puesta en marcha",
  otro:          "Otro",
};

const ESTADO_BADGE: Record<string, string> = {
  programada: "bg-blue-50 text-blue-700",
  completada: "bg-green-50 text-green-700",
  cancelada:  "bg-neutral-100 text-neutral-400 line-through",
};

const DIAS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Lunes de la semana que contiene `date` */
function getLunes(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getVisitas(desde: string, hasta: string): Promise<Visita[]> {
  const sql = getDb();
  return sql<Visita[]>`
    SELECT
      v.id, v.fecha::text, v.tipo, v.estado, v.precio::text, v.notas,
      c.id AS cliente_id,
      c.nombre AS cliente_nombre,
      p.municipio
    FROM visitas v
    JOIN propiedades p ON p.id = v.propiedad_id
    JOIN clientes c    ON c.id = p.cliente_id
    WHERE v.fecha BETWEEN ${desde}::date AND ${hasta}::date
    ORDER BY v.fecha, v.estado
  `;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const sp = await searchParams;

  // Determina el lunes de la semana a mostrar
  const base = sp.semana ? new Date(sp.semana + "T12:00:00") : new Date();
  const lunes = getLunes(base);
  const domingo = addDays(lunes, 6);

  const desde = toISODate(lunes);
  const hasta = toISODate(domingo);

  const visitas = await getVisitas(desde, hasta);

  // Navega semana anterior/siguiente
  const semanaAnterior = toISODate(addDays(lunes, -7));
  const semanaSiguiente = toISODate(addDays(lunes, 7));

  // Agrupa por día
  const dias: { fecha: string; label: string; dayLabel: string; visitas: Visita[] }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(lunes, i);
    const fISO = toISODate(d);
    dias.push({
      fecha:    fISO,
      label:    `${DIAS_ES[i]} ${d.getDate()}`,
      dayLabel: `${d.getDate()} de ${MESES_ES[d.getMonth()]}`,
      visitas:  visitas.filter((v) => v.fecha === fISO),
    });
  }

  const hoy = toISODate(new Date());
  const tituloSemana = `${lunes.getDate()} ${MESES_ES[lunes.getMonth()]} — ${domingo.getDate()} ${MESES_ES[domingo.getMonth()]} ${domingo.getFullYear()}`;

  // Totales de la semana
  const totalProgramadas = visitas.filter((v) => v.estado === "programada").length;
  const totalCompletadas = visitas.filter((v) => v.estado === "completada").length;
  const facturado = visitas
    .filter((v) => v.estado === "completada" && v.precio)
    .reduce((s, v) => s + parseFloat(v.precio!), 0);

  return (
    <div className="p-6 md:p-8">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold">Agenda</h1>
          <p className="text-sm text-neutral-500">{tituloSemana}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/panel/agenda?semana=${semanaAnterior}`} className="p-2 border rounded-lg hover:bg-neutral-100 transition">
            <FiChevronLeft size={16} />
          </Link>
          <Link href="/panel/agenda" className="px-3 py-1.5 border rounded-lg text-sm hover:bg-neutral-100 transition">Hoy</Link>
          <Link href={`/panel/agenda?semana=${semanaSiguiente}`} className="p-2 border rounded-lg hover:bg-neutral-100 transition">
            <FiChevronRight size={16} />
          </Link>
          <Link
            href="/panel/agenda/nueva"
            className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition ml-2"
          >
            <FiPlus size={14} /> Nueva visita
          </Link>
        </div>
      </div>

      {/* KPIs semana */}
      <div className="flex gap-4 mb-6 text-sm">
        <span className="text-neutral-500">Programadas: <strong>{totalProgramadas}</strong></span>
        <span className="text-neutral-500">Completadas: <strong>{totalCompletadas}</strong></span>
        {facturado > 0 && <span className="text-neutral-500">Facturado: <strong>{facturado.toFixed(2)} €</strong></span>}
      </div>

      {/* Grid de días */}
      <div className="space-y-3">
        {dias.map(({ fecha, label, visitas: dVisitas }) => {
          const isHoy = fecha === hoy;
          return (
            <div key={fecha} className={`rounded-xl border shadow-sm overflow-hidden ${isHoy ? "border-black" : "border-neutral-200 bg-white"}`}>
              {/* Encabezado del día */}
              <div className={`px-4 py-2 flex items-center justify-between ${isHoy ? "bg-black text-white" : "bg-neutral-50 border-b"}`}>
                <p className={`text-sm font-semibold ${isHoy ? "text-white" : ""}`}>{label}</p>
                <Link
                  href={`/panel/agenda/nueva?fecha=${fecha}`}
                  className={`text-xs px-2 py-0.5 rounded ${isHoy ? "bg-white text-black hover:bg-neutral-100" : "border hover:bg-neutral-100"} transition`}
                >
                  + Visita
                </Link>
              </div>

              {/* Visitas del día */}
              {dVisitas.length === 0 ? (
                <div className="px-4 py-3 text-xs text-neutral-400">Sin visitas</div>
              ) : (
                <div className={`divide-y ${isHoy ? "bg-white" : ""}`}>
                  {dVisitas.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/panel/clientes/${v.cliente_id}`} className="text-sm font-medium hover:underline truncate block">
                          {v.cliente_nombre}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-neutral-500">{TIPO_LABEL[v.tipo] ?? v.tipo}</span>
                          {v.municipio && <span className="text-xs text-neutral-400">· {v.municipio}</span>}
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${ESTADO_BADGE[v.estado]}`}>
                            {v.estado}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {v.precio && <span className="text-sm font-semibold">{v.precio} €</span>}
                        {v.estado === "programada" && <AccionesVisitaAgenda visitaId={v.id} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
