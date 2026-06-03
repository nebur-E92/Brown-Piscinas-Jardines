import type postgres from "postgres";
import { FRANJAS, MAX_POR_FRANJA, type Franja } from "./reservas";

export type OcupacionDia = Record<Franja, number>;
export type Ocupacion = Record<string, OcupacionDia>;

function ensureDay(ocupacion: Ocupacion, fecha: string): OcupacionDia {
  if (!ocupacion[fecha]) ocupacion[fecha] = { manana: 0, tarde: 0 };
  return ocupacion[fecha];
}

function sumar(ocupacion: Ocupacion, fecha: string, franja: Franja, total = 1) {
  const dia = ensureDay(ocupacion, fecha);
  dia[franja] = Math.min(MAX_POR_FRANJA, dia[franja] + total);
}

function bloquear(ocupacion: Ocupacion, fecha: string, franja: Franja | null) {
  const dia = ensureDay(ocupacion, fecha);
  if (franja) {
    dia[franja] = MAX_POR_FRANJA;
    return;
  }
  for (const f of FRANJAS) dia[f] = MAX_POR_FRANJA;
}

export async function getOcupacion(sql: postgres.Sql, desde: string, hasta: string): Promise<Ocupacion> {
  const ocupacion: Ocupacion = {};

  const reservas = await sql<{ fecha: string; franja: Franja; total: number }[]>`
    SELECT fecha::text, franja, COUNT(*)::int AS total
    FROM reservas
    WHERE fecha >= ${desde}::date
      AND fecha <= ${hasta}::date
      AND estado != 'cancelada'
    GROUP BY fecha, franja
  `;

  for (const r of reservas) sumar(ocupacion, r.fecha, r.franja, r.total);

  const visitas = await sql<{ fecha: string; total: number }[]>`
    SELECT fecha::text, COUNT(*)::int AS total
    FROM visitas
    WHERE fecha >= ${desde}::date
      AND fecha <= ${hasta}::date
      AND estado = 'programada'
    GROUP BY fecha
  `;

  for (const v of visitas) {
    for (const franja of FRANJAS) sumar(ocupacion, v.fecha, franja, v.total);
  }

  const bloqueos = await sql<{ fecha: string; franja: Franja | null }[]>`
    SELECT fecha::text, franja
    FROM bloqueos
    WHERE fecha >= ${desde}::date
      AND fecha <= ${hasta}::date
  `;

  for (const b of bloqueos) bloquear(ocupacion, b.fecha, b.franja);

  return ocupacion;
}
