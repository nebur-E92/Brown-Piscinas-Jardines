import { NextResponse } from "next/server";
import { TARIFAS } from "../../../../lib/pricing";

export async function GET() {
  return NextResponse.json({
    servicios: [
      {
        id: "cesped",
        nombre: "Césped",
        descripcion:
          "Corte, perfilado de bordes, soplado y retirada de restos hasta 150 L. Restos > 150 L: suplemento de 60 €.",
        unidad: "m²",
        frecuencia: true,
        altura: false,
        base: TARIFAS.cesped.base,
        minimo: TARIFAS.cesped.minimo,
      },
      {
        id: "setos-alibustre",
        nombre: "Setos – hoja pequeña (alibustre, boj…)",
        descripcion:
          "Recorte en altura y ancho, perfilado limpio y retirada de restos. Alibustre, boj, mirto y similares.",
        unidad: "ml",
        frecuencia: true,
        altura: true,
        base: TARIFAS.setos.alibustre.base,
        minimo: TARIFAS.setos.alibustre.minimo,
      },
      {
        id: "setos-coniferas",
        nombre: "Setos – conífera (ciprés, tuya, leylandi…)",
        descripcion:
          "Poda más lenta y precisa por densidad y altura. Incluye recorte y retirada de restos.",
        unidad: "ml",
        frecuencia: true,
        altura: true,
        base: TARIFAS.setos.coniferas.base,
        minimo: TARIFAS.setos.coniferas.minimo,
      },
      {
        id: "piscina",
        nombre: "Piscina",
        descripcion:
          "Análisis y ajuste de pH y cloro, limpieza de skimmers, aspirado de fondo y revisión visual de equipos. Productos químicos no incluidos.",
        unidad: "m² de lámina (largo × ancho)",
        frecuencia: true,
        altura: false,
        base: TARIFAS.piscina.base,
        minimo: TARIFAS.piscina.minimo,
      },
      {
        id: "desbroce",
        nombre: "Desbroce de terrenos",
        descripcion:
          "Corte de vegetación con desbrozadora. Hasta 500 m²: 1,10 €/m² · 501–2.000 m²: 0,70 €/m² · > 2.000 m²: presupuesto personalizado. No requiere frecuencia.",
        unidad: "m²",
        frecuencia: false,
        altura: false,
      },
      {
        id: "puesta-marcha",
        nombre: "Puesta en marcha / Cierre de temporada",
        descripcion:
          "Preparación de bomba y filtros, instalación o retirada de cobertor y limpieza de piscina. Pequeña 300 €, mediana 450 €, grande 600 €.",
        unidad: "talla",
        frecuencia: false,
        altura: false,
      },
    ],
  });
}
