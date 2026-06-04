import { getDb } from "../../../../lib/panel/db";
import Link from "next/link";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AccionesVisitaAgenda } from "./_components/AccionesVisitaAgenda";
import { BloqueosDia } from "./_components/BloqueosDia";

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

type Bloqueo = {
  id: string;
  fecha: string;
  franja: string | null;
  motivo: string;
  notas: string | null;
};

type Reserva = {
  id: string;
  fecha: string;
  franja: string;
  tipo: string;
  estado: string;
  nombre: string;
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

const RESERVA_BADGE: Record<string, string> = {
  pendiente: "bg-yellow-50 text-yellow-700",
  confirmada: "bg-green-50 text-green-700",
  cancelada: "bg-neutral-100 text-neutral-400 line-through",
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

function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
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
      v.eff_cliente_id AS cliente_id,
      v.cliente_nombre,
      v.eff_municipio AS municipio
    FROM visitas_con_cliente v
    WHERE v.fecha BETWEEN ${desde}::date AND ${hasta}::date
    ORDER BY v.fecha, v.estado
  `;
}

async function getBloqueos(desde: string, hasta: string): Promise<Bloqueo[]> {
  const sql = getDb();
  return sql<Bloqueo[]>`
    SELECT id, fecha::text, franja, motivo, notas
    FROM bloqueos
    WHERE fecha BETWEEN ${desde}::date AND ${hasta}::date
    ORDER BY fecha, franja NULLS FIRST
  `;
}

async function getReservas(desde: string, hasta: string): Promise<Reserva[]> {
  const sql = getDb();
  return sql<Reserva[]>`
    SELECT id, fecha::text, franja, tipo, estado, nombre, municipio
    FROM reservas
    WHERE fecha BETWEEN ${desde}::date AND ${hasta}::date
      AND estado != 'cancelada'
      AND visita_id IS NULL
    ORDER BY fecha, franja
  `;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string; vista?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const vista = sp.vista === "mes" ? "mes" : "semana";

  const baseSemana = sp.semana ? new Date(sp.semana + "T12:00:00") : new Date();
  const lunes = getLunes(baseSemana);
  const domingo = addDays(lunes, 6);
  const baseMes = sp.mes ? new Date(sp.mes + "-01T12:00:00") : new Date();
  const mesActual = new Date(baseMes.getFullYear(), baseMes.getMonth(), 1);
  const mesFin = new Date(baseMes.getFullYear(), baseMes.getMonth() + 1, 0);

  const desde = vista === "mes" ? toISODate(mesActual) : toISODate(lunes);
  const hasta = vista === "mes" ? toISODate(mesFin) : toISODate(domingo);

  const [visitas, bloqueos, reservas] = await Promise.all([
    getVisitas(desde, hasta),
    getBloqueos(desde, hasta),
    getReservas(desde, hasta),
  ]);

  // Navega semana anterior/siguiente
  const semanaAnterior = toISODate(addDays(lunes, -7));
  const semanaSiguiente = toISODate(addDays(lunes, 7));
  const mesAnterior = `${addMonths(mesActual, -1).getFullYear()}-${String(addMonths(mesActual, -1).getMonth() + 1).padStart(2, "0")}`;
  const mesSiguiente = `${addMonths(mesActual, 1).getFullYear()}-${String(addMonths(mesActual, 1).getMonth() + 1).padStart(2, "0")}`;
  const mesParam = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, "0")}`;

  // Agrupa por día
  const diasSemana: { fecha: string; label: string; dayLabel: string; visitas: Visita[]; bloqueos: Bloqueo[]; reservas: Reserva[] }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(lunes, i);
    const fISO = toISODate(d);
    diasSemana.push({
      fecha:    fISO,
      label:    `${DIAS_ES[i]} ${d.getDate()}`,
      dayLabel: `${d.getDate()} de ${MESES_ES[d.getMonth()]}`,
      visitas:  visitas.filter((v) => v.fecha === fISO),
      bloqueos: bloqueos.filter((b) => b.fecha === fISO),
      reservas: reservas.filter((r) => r.fecha === fISO),
    });
  }

  const offsetMes = (mesActual.getDay() + 6) % 7;
  const totalCeldas = Math.ceil((offsetMes + mesFin.getDate()) / 7) * 7;
  const diasMes = Array.from({ length: totalCeldas }).map((_, i) => {
    const dia = i - offsetMes + 1;
    if (dia < 1 || dia > mesFin.getDate()) return null;
    const d = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
    const fecha = toISODate(d);
    return {
      fecha,
      dia,
      visitas: visitas.filter((v) => v.fecha === fecha),
      reservas: reservas.filter((r) => r.fecha === fecha),
      bloqueos: bloqueos.filter((b) => b.fecha === fecha),
    };
  });

  const hoy = toISODate(new Date());
  const tituloSemana = `${lunes.getDate()} ${MESES_ES[lunes.getMonth()]} — ${domingo.getDate()} ${MESES_ES[domingo.getMonth()]} ${domingo.getFullYear()}`;
  const tituloMes = `${MESES_ES[mesActual.getMonth()]} ${mesActual.getFullYear()}`;

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
          <p className="text-sm text-neutral-500">{vista === "mes" ? tituloMes : tituloSemana}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden text-sm">
            <Link href={`/panel/agenda?semana=${toISODate(lunes)}`} className={`px-3 py-1.5 ${vista === "semana" ? "bg-black text-white" : "hover:bg-neutral-100"}`}>
              Semana
            </Link>
            <Link href={`/panel/agenda?vista=mes&mes=${mesParam}`} className={`px-3 py-1.5 border-l ${vista === "mes" ? "bg-black text-white" : "hover:bg-neutral-100"}`}>
              Mes
            </Link>
          </div>
          <Link href={vista === "mes" ? `/panel/agenda?vista=mes&mes=${mesAnterior}` : `/panel/agenda?semana=${semanaAnterior}`} className="p-2 border rounded-lg hover:bg-neutral-100 transition">
            <FiChevronLeft size={16} />
          </Link>
          <Link href={vista === "mes" ? "/panel/agenda?vista=mes" : "/panel/agenda"} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-neutral-100 transition">Hoy</Link>
          <Link href={vista === "mes" ? `/panel/agenda?vista=mes&mes=${mesSiguiente}` : `/panel/agenda?semana=${semanaSiguiente}`} className="p-2 border rounded-lg hover:bg-neutral-100 transition">
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
        <span className="text-neutral-500">{vista === "mes" ? "Programadas del mes" : "Programadas"}: <strong>{totalProgramadas}</strong></span>
        <span className="text-neutral-500">Completadas: <strong>{totalCompletadas}</strong></span>
        <span className="text-neutral-500">Reservas: <strong>{reservas.length}</strong></span>
        {facturado > 0 && <span className="text-neutral-500">Facturado: <strong>{facturado.toFixed(2)} €</strong></span>}
      </div>

      {vista === "mes" ? (
        <div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_ES.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-neutral-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {diasMes.map((dia, i) => {
              if (!dia) return <div key={i} className="min-h-[112px] rounded-lg bg-neutral-50/50" />;
              const isHoy = dia.fecha === hoy;
              const total = dia.visitas.length + dia.reservas.length + dia.bloqueos.length;
              return (
                <div key={dia.fecha} className={`min-h-[112px] rounded-lg border bg-white p-2 ${isHoy ? "border-black" : "border-neutral-200"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${isHoy ? "bg-black text-white rounded-full w-5 h-5 flex items-center justify-center" : "text-neutral-600"}`}>
                      {dia.dia}
                    </span>
                    {total > 0 && <span className="text-[10px] text-neutral-400">{total}</span>}
                  </div>
                  <div className="space-y-1">
                    {dia.bloqueos.length > 0 && (
                      <p className="truncate rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                        {dia.bloqueos.length} bloqueo{dia.bloqueos.length > 1 ? "s" : ""}
                      </p>
                    )}
                    {dia.visitas.slice(0, 2).map((v) => (
                      <Link key={v.id} href={`/panel/clientes/${v.cliente_id}`} className="block truncate rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700 hover:bg-blue-100">
                        {v.cliente_nombre}
                      </Link>
                    ))}
                    {dia.reservas.slice(0, 2).map((r) => (
                      <Link key={r.id} href="/panel/reservas" className="block truncate rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] text-yellow-700 hover:bg-yellow-100">
                        Reserva · {r.nombre}
                      </Link>
                    ))}
                    {dia.visitas.length + dia.reservas.length > 4 && (
                      <p className="text-[10px] text-neutral-400">+{dia.visitas.length + dia.reservas.length - 4} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
      <div className="space-y-3">
        {diasSemana.map(({ fecha, label, visitas: dVisitas, bloqueos: dBloqueos, reservas: dReservas }) => {
          const isHoy = fecha === hoy;
          return (
            <div key={fecha} className={`rounded-xl border shadow-sm overflow-hidden ${isHoy ? "border-black" : "border-neutral-200 bg-white"}`}>
              {/* Encabezado del día */}
              <div className={`px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${isHoy ? "bg-black text-white" : "bg-neutral-50 border-b"}`}>
                <p className={`text-sm font-semibold ${isHoy ? "text-white" : ""}`}>{label}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <BloqueosDia fecha={fecha} bloqueos={dBloqueos} invertido={isHoy} />
                  <Link
                    href={`/panel/agenda/nueva?fecha=${fecha}`}
                    className={`text-xs px-2 py-0.5 rounded ${isHoy ? "bg-white text-black hover:bg-neutral-100" : "border hover:bg-neutral-100"} transition`}
                  >
                    + Visita
                  </Link>
                </div>
              </div>

              {/* Visitas del día */}
              {dVisitas.length === 0 ? (
                dReservas.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-neutral-400">Sin visitas ni reservas</div>
                ) : null
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
              {dReservas.length > 0 && (
                <div className={`divide-y border-t ${isHoy ? "bg-white" : ""}`}>
                  {dReservas.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <Link href="/panel/reservas" className="text-sm font-medium hover:underline truncate block">
                          Reserva · {r.nombre}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-neutral-500">{r.franja === "manana" ? "Mañana" : "Tarde"}</span>
                          {r.municipio && <span className="text-xs text-neutral-400">· {r.municipio}</span>}
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${RESERVA_BADGE[r.estado] ?? RESERVA_BADGE.pendiente}`}>
                            {r.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
