// Tipos y constantes para el módulo de partes de visita

export type EstadoParte = "borrador" | "finalizado" | "enviada" | "archivada";

export type Medicion = {
  codigo: string;       // cloro_libre, cloro_combinado, ph, temperatura, turbidez, cianurico, salinidad
  valor: number | null;
  opcion: string | null; // para turbidez: clara/ligeramente_turbia/turbia; cianurico: medido/no_medido
  obs: string | null;
};

export type Actuacion = {
  nombre: string;
  ambito: "piscina" | "jardin";
  estado: "si" | "no" | "na";
  detalle: string | null;
};

export type SnapshotDatosFijos = {
  direccion: string | null;
  ref_servicio: string | null;
  tipo_cliente: string | null;
  tipo_propiedad: string;
  tecnico_nombre: string | null;
  firma_base64: string | null;
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
};

export const PARAMETROS_AGUA = [
  { codigo: "cloro_libre", label: "Cloro libre (mg/l)", min: 0.5, max: 2.0 },
  { codigo: "cloro_combinado", label: "Cloro combinado (mg/l)", min: 0, max: 0.6 },
  { codigo: "ph", label: "pH", min: 7.2, max: 7.8 },
  { codigo: "temperatura", label: "Temperatura (°C)", min: null, max: null },
  { codigo: "turbidez", label: "Turbidez", min: null, max: null },
  { codigo: "cianurico", label: "Ác. cianúrico (mg/l)", min: null, max: 75 },
  { codigo: "salinidad", label: "Sal (ppm)", min: 3000, max: 5000 },
] as const;

export const ESTADOS_AGUA = ["optimo", "aceptable", "deficiente", "critico"] as const;
export const ESTADOS_LINER = ["sin_incidencias", "con_incidencias"] as const;
export const ESTADOS_EQUIPOS = ["correcto", "averia", "comunicada"] as const;
export const ESTADOS_JARDIN = ["optimo", "aceptable", "deficiente"] as const;
export const RESTOS_VEGETALES = ["hasta_150l", "mas_150l"] as const;

export function normalizeJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string") return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
}
