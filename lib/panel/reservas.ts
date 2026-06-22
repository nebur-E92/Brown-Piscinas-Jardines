export const FRANJAS = ["manana", "tarde"] as const;
export type Franja = (typeof FRANJAS)[number];

export const RESERVA_TIPOS = ["visita_tecnica", "cesped", "piscina", "setos", "desbroce", "otro"] as const;
export type ReservaTipo = (typeof RESERVA_TIPOS)[number];

export const RESERVA_ESTADOS = ["pendiente", "confirmada", "cancelada"] as const;
export const MAX_POR_FRANJA = 3;

export const FRANJA_LABEL: Record<Franja, string> = {
  manana: "Mañana (9:00–14:00)",
  tarde: "Tarde (15:00–19:00)",
};

const DIAS_RESERVA_PERMITIDOS = new Set([1, 3, 5]); // lunes, miercoles, viernes

export const TIPO_LABEL: Record<ReservaTipo, string> = {
  visita_tecnica: "Visita técnica gratuita",
  cesped: "Mantenimiento de césped",
  piscina: "Mantenimiento de piscina",
  setos: "Recorte de setos",
  desbroce: "Desbroce de terreno",
  otro: "Otro servicio",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isFranja(value: unknown): value is Franja {
  return typeof value === "string" && FRANJAS.includes(value as Franja);
}

export function isReservaPermitida(fecha: string, franja: Franja): boolean {
  if (franja !== "manana") return false;
  const date = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return DIAS_RESERVA_PERMITIDOS.has(date.getDay());
}

export function isReservaTipo(value: unknown): value is ReservaTipo {
  return typeof value === "string" && RESERVA_TIPOS.includes(value as ReservaTipo);
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function cleanLongText(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function isValidEmail(value: string): boolean {
  return value.length <= 160 && EMAIL_RE.test(value);
}

export function isValidISODate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}
