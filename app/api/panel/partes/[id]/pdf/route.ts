import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSession } from "../../../../../../lib/panel/auth";
import { getDb } from "../../../../../../lib/panel/db";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { PartePDF } from "../../../../../../lib/panel/pdf/PartePDF";
import type { PartePDFData } from "../../../../../../lib/panel/pdf/PartePDF";
import { normalizeJsonArray, type Actuacion, type Medicion } from "../../../../../../lib/panel/partes";

type Params = Promise<{ id: string }>;

let logoSrcPromise: Promise<string> | null = null;

function getLogoSrc(): Promise<string> {
  logoSrcPromise ??= readFile(join(process.cwd(), "public", "icons", "logo.svg"))
    .then((contents) => `data:image/svg+xml;base64,${contents.toString("base64")}`);
  return logoSrcPromise;
}

function serializeDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const versionParam = req.nextUrl.searchParams.get("version");
  const sql = getDb();

  // Buscar la versión solicitada o la última finalizada/enviada
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let version: any;
  if (versionParam) {
    [version] = await sql`
      SELECT pver.*, pv.numero_temporada, pv.anio
      FROM partes_versiones pver
      JOIN partes_visita pv ON pv.id = pver.parte_id
      WHERE pver.parte_id = ${id} AND pver.version = ${parseInt(versionParam)}
    `;
  } else {
    [version] = await sql`
      SELECT pver.*, pv.numero_temporada, pv.anio
      FROM partes_versiones pver
      JOIN partes_visita pv ON pv.id = pver.parte_id
      WHERE pver.parte_id = ${id} AND pver.estado IN ('finalizado', 'enviada')
      ORDER BY pver.version DESC LIMIT 1
    `;
  }

  if (!version) {
    return NextResponse.json({ error: "No hay versión disponible para generar PDF." }, { status: 404 });
  }

  if (version.estado === "borrador") {
    return NextResponse.json({ error: "No se puede generar PDF de un borrador." }, { status: 409 });
  }

  if (!version.snapshot_datos_fijos) {
    return NextResponse.json({ error: "La versión no tiene snapshot de datos fijos." }, { status: 500 });
  }

  // Construir datos para el componente PDF
  const logoSrc = await getLogoSrc();
  const data: PartePDFData = {
    logo_src: logoSrc,
    numero_temporada: version.numero_temporada,
    anio: version.anio,
    version: version.version,
    fecha: serializeDate(version.fecha) ?? "",
    hora_entrada: serializeDate(version.hora_entrada),
    hora_salida: serializeDate(version.hora_salida),
    mediciones: normalizeJsonArray<Medicion>(version.mediciones),
    actuaciones: normalizeJsonArray<Actuacion>(version.actuaciones),
    estado_agua: version.estado_agua,
    estado_liner: version.estado_liner,
    estado_equipos: version.estado_equipos,
    estado_jardin: version.estado_jardin,
    cierre_preventivo: version.cierre_preventivo,
    cierre_motivo: version.cierre_motivo,
    incidencias: version.incidencias,
    recomendaciones: version.recomendaciones,
    stock_titular: version.stock_titular,
    restos_vegetales: version.restos_vegetales,
    enviada_at: serializeDate(version.enviada_at),
    snapshot: version.snapshot_datos_fijos,
  };

  // Generar PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(PartePDF, { data }) as any;
  const buffer = await renderToBuffer(element);

  // Nombre de archivo
  const ref = data.snapshot.ref_servicio ?? "SIN-REF";
  const fechaStr = data.fecha?.split("T")[0]?.replace(/-/g, "") ?? "00000000";
  const filename = `BROWN-PARTE-${ref}-${fechaStr}-v${data.version}.pdf`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
