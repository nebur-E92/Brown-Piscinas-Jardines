// Tarifas v3.0 — IVA incluido
// Fuente: Tarifas-Brown-v3.0.docx.md (prevalece sobre cualquier otra fuente)

export type Frecuencia = "puntual" | "quincenal" | "semanal";
export type Altura     = "ninguna" | "2m" | "3m";
export type TallaPM    = "pequena" | "mediana" | "grande";

export const TARIFAS = {
  factores: {
    puntual:   1.00,
    quincenal: 0.88,  // −12 %
    semanal:   0.78,  // −22 %
  } satisfies Record<Frecuencia, number>,

  cesped: { base: 0.18, minimo: 45 },   // €/m²

  setos: {
    alibustre:     { base: 3.50, minimo: 55 },  // €/ml
    coniferas:     { base: 4.50, minimo: 55 },  // €/ml
    suplemento_2m: 0.60,  // €/ml — NO afectado por factor frecuencia
    suplemento_3m: 1.25,  // €/ml — NO afectado por factor frecuencia
  },

  piscina: { base: 1.20, minimo: 55 },  // €/m² de lámina (largo × ancho)

  desbroce: {
    tramos: [
      { hasta: 500,  precio: 0.55 },
      { hasta: 2000, precio: 0.35 },
    ],
    maximo: 2000,  // > 2.000 m² → presupuesto personalizado
  },

  puesta_marcha: {
    pequena: 150,
    mediana: 225,
    grande:  300,
  } satisfies Record<TallaPM, number>,
};

// ─── tipos de request ─────────────────────────────────────────────────────────

export type ServicioReq =
  | { id: "cesped";          medida: number; frecuencia: Frecuencia }
  | { id: "setos-alibustre"; medida: number; frecuencia: Frecuencia; altura?: Altura }
  | { id: "setos-coniferas"; medida: number; frecuencia: Frecuencia; altura?: Altura }
  | { id: "piscina";         medida: number; frecuencia: Frecuencia }
  | { id: "desbroce";        medida: number }
  | { id: "puesta-marcha";   talla: TallaPM };

export type Linea      = { nombre: string; precio: number; nota?: string };
export type CalcResult = { total: number; desglose: Record<string, Linea> };

// ─── helpers internos ─────────────────────────────────────────────────────────

function conFrecuencia(importe: number, f: Frecuencia): number {
  return importe * TARIFAS.factores[f];
}

function withMin(raw: number, minimo: number): { precio: number; nota?: string } {
  if (raw < minimo) return { precio: minimo, nota: `Mínimo por visita: ${minimo} €` };
  return { precio: +raw.toFixed(2) };
}

// ─── cálculos por tipo de servicio ───────────────────────────────────────────

function calcCesped(medida: number, f: Frecuencia): Linea {
  const raw = conFrecuencia(medida * TARIFAS.cesped.base, f);
  const { precio, nota } = withMin(raw, TARIFAS.cesped.minimo);
  return { nombre: "Césped", precio, nota };
}

function calcSetos(
  especie: "alibustre" | "coniferas",
  medida: number,
  f: Frecuencia,
  altura: Altura = "ninguna",
): Linea {
  const tarifa = TARIFAS.setos[especie];
  const base = conFrecuencia(medida * tarifa.base, f);
  const sup =
    altura === "2m" ? medida * TARIFAS.setos.suplemento_2m :
    altura === "3m" ? medida * TARIFAS.setos.suplemento_3m : 0;
  const { precio, nota } = withMin(base + sup, tarifa.minimo);
  const nombre = especie === "alibustre"
    ? "Setos – hoja pequeña (alibustre, boj…)"
    : "Setos – conífera (ciprés, tuya, leylandi…)";
  return { nombre, precio, nota };
}

function calcPiscina(medida: number, f: Frecuencia): Linea {
  const raw = conFrecuencia(medida * TARIFAS.piscina.base, f);
  const { precio, nota } = withMin(raw, TARIFAS.piscina.minimo);
  return { nombre: "Piscina", precio, nota };
}

function calcDesbroce(medida: number): Linea | { error: string } {
  if (medida > TARIFAS.desbroce.maximo) return { error: "desbroce_sup_2000" };
  const tramo = TARIFAS.desbroce.tramos.find((t) => medida <= t.hasta);
  if (!tramo) return { error: "desbroce_sup_2000" };
  return { nombre: "Desbroce", precio: +(medida * tramo.precio).toFixed(2) };
}

// ─── entry point ─────────────────────────────────────────────────────────────

export function calcularPrecio(
  servicios: ServicioReq[],
): CalcResult | { errores: string[] } {
  const errores: string[] = [];
  const desglose: Record<string, Linea> = {};

  for (const svc of servicios) {
    switch (svc.id) {
      case "cesped": {
        if (!(svc.medida > 0)) { errores.push("cesped_medida_invalida"); break; }
        desglose["cesped"] = calcCesped(svc.medida, svc.frecuencia);
        break;
      }
      case "setos-alibustre": {
        if (!(svc.medida > 0)) { errores.push("setos_alibustre_medida_invalida"); break; }
        desglose["setos-alibustre"] = calcSetos("alibustre", svc.medida, svc.frecuencia, svc.altura);
        break;
      }
      case "setos-coniferas": {
        if (!(svc.medida > 0)) { errores.push("setos_coniferas_medida_invalida"); break; }
        desglose["setos-coniferas"] = calcSetos("coniferas", svc.medida, svc.frecuencia, svc.altura);
        break;
      }
      case "piscina": {
        if (!(svc.medida > 0)) { errores.push("piscina_medida_invalida"); break; }
        desglose["piscina"] = calcPiscina(svc.medida, svc.frecuencia);
        break;
      }
      case "desbroce": {
        if (!(svc.medida > 0)) { errores.push("desbroce_medida_invalida"); break; }
        const r = calcDesbroce(svc.medida);
        if ("error" in r) { errores.push(r.error); break; }
        desglose["desbroce"] = r;
        break;
      }
      case "puesta-marcha": {
        const precio = TARIFAS.puesta_marcha[svc.talla];
        desglose["puesta-marcha"] = {
          nombre: "Puesta en marcha / Cierre de temporada",
          precio,
        };
        break;
      }
    }
  }

  if (errores.length) return { errores };

  const total = +Object.values(desglose)
    .reduce((sum, l) => sum + l.precio, 0)
    .toFixed(2);

  return { total, desglose };
}
