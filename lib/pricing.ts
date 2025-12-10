import { LOCATIONS } from "./seo";
export type PricingTable = {
  servicios: {
    id: string;
    nombre: string;
    base: number;
    tamanos?: Record<string, number>;
    frecuencia?: Record<string, number>;
    municipios?: Record<string, number>;
  }[];
};

export function loadPricing(): PricingTable | null {
  try {
    const raw = process.env.PRICING_TABLE;
    return raw ? (JSON.parse(raw) as PricingTable) : null;
  } catch {
    return null;
  }
}

type ServiceItem = {
  id: string;
  cantidad: string;
};

type CalculateRequest = {
  servicios: ServiceItem[];
  municipio: string;
};

export function estimatePrice(
  pricing: PricingTable,
  req: CalculateRequest
): number | null {
  let total = 0;
  const errors: string[] = [];
  // municipio validation (must be in LOCATIONS slug list)
  if (!LOCATIONS.some(l => l.slug === req.municipio)) {
    errors.push("municipio_invalido");
  }
  // numeric bounds per service
  const bounds: Record<string, { max: number }> = {
    desbroce: { max: 5000 },
    setos: { max: 1000 },
    baldosas: { max: 2000 },
    mantenimiento: { max: 10000 },
    cesped: { max: 5000 },
    piscina: { max: 500 },
    riego: { max: 2000 }
  };
  Object.entries(req.servicios).forEach(([id, cantidad]) => {
    const servicio = pricing.servicios.find((s) => s.id === id);
    if (!servicio || servicio.id === "desplazamiento") return; // desplazamiento eliminado
    if (cantidad == null) return;
    if (typeof cantidad !== "string" || Number.isNaN(parseFloat(cantidad))) {
      errors.push(`valor_no_numerico_${id}`);
      return;
    }
    const valor = parseFloat(cantidad);
    if (valor < 0) errors.push(`valor_negativo_${id}`);
    const limit = bounds[servicio.id]?.max;
    if (limit && valor > limit) errors.push(`valor_excede_max_${id}`);
  });
  if (errors.length) {
    return {
      servicios: req.servicios,
      municipio: req.municipio,
      frecuencia: (req as any).frecuencia,
      total: 0,
      desglose: {},
      errores: errors
    } as any;
  }
  for (const item of req.servicios) {
    const servicio = pricing.servicios.find((s) => s.id === item.id);
    if (!servicio || servicio.id === "desplazamiento") continue; // desplazamiento eliminado

    let price = 0;

    // Clave directa (tamaño / opción combinada)
    if (servicio.tamanos && item.cantidad && servicio.tamanos[item.cantidad] !== undefined) {
      price = servicio.base + servicio.tamanos[item.cantidad];
    }
    // Cantidad numérica
    else if (item.cantidad && /^\d+(\.\d+)?$/.test(item.cantidad)) {
      const num = parseFloat(item.cantidad);
      // Desbroce m² por rango (precioPorM2 según rango)
       if (servicio.id === "desbroce" && servicio.tamanos) {
         let precioPorM2 = 0;
         if (num <= 250 && servicio.tamanos["hasta-250"] !== undefined) precioPorM2 = servicio.tamanos["hasta-250"];
         else if (num <= 500 && servicio.tamanos["251-500"] !== undefined) precioPorM2 = servicio.tamanos["251-500"];
         else if (num <= 1000 && servicio.tamanos["501-1000"] !== undefined) precioPorM2 = servicio.tamanos["501-1000"];
         else if (num <= 5000) {
           if (servicio.tamanos["1001+"] !== undefined) precioPorM2 = servicio.tamanos["1001+"];
           else if (servicio.tamanos["501-1000"] !== undefined) precioPorM2 = servicio.tamanos["501-1000"]; // fallback si falta 1001+
         }
         price = num * precioPorM2;
       }
      // Setos ml: base es €/ml, ajustes son deltas al €/ml
      else if (servicio.id.startsWith("setos-") && servicio.tamanos) {
        let unit = servicio.base; // €/ml base
        if (num > 30 && num <= 60 && servicio.tamanos["31-60"] !== undefined) {
          unit = servicio.base + servicio.tamanos["31-60"]; // ajuste negativo reduce precio
        } else if (num > 60 && servicio.tamanos["60+"] !== undefined) {
          unit = servicio.base + servicio.tamanos["60+"];
        }
        price = num * unit;
      }
      // Limpieza baldosas (€/m²)
      else if (servicio.id === "limpieza-baldosas") {
        price = num * servicio.base;
      }
      // Otros numéricos (si base es €/unidad)
      else {
        price = num * servicio.base;
      }
    }
    // Frecuencia/estado (limpieza piscina por estado)
    else if (servicio.frecuencia && item.cantidad && servicio.frecuencia[item.cantidad] !== undefined) {
      price = servicio.base + servicio.frecuencia[item.cantidad];
    } else {
      // Solo base (cuando no hay tamaño seleccionado todavía)
      price = servicio.base;
    }

    // Ajuste municipio si aplica
    if (servicio.municipios && servicio.municipios[req.municipio.toLowerCase()] !== undefined) {
      price += servicio.municipios[req.municipio.toLowerCase()];
    }

    total += price;
  }
  // Mantener dos decimales
  return Number(total.toFixed(2));
}
