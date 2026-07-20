import { getDb } from "../../../../../lib/panel/db";
import { getSession } from "../../../../../lib/panel/auth";
import { redirect, notFound } from "next/navigation";
import { ParteDetail } from "./_components/ParteDetail";
import { normalizeJsonArray, type Actuacion, type Medicion } from "../../../../../lib/panel/partes";

export const dynamic = "force-dynamic";

function serializeDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

export default async function ParteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/panel-login");

  const { id } = await params;
  const sql = getDb();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [parte] = await sql<any[]>`
    SELECT pv.*, p.tipo AS prop_tipo, p.direccion, p.ref_servicio, p.tipo_cliente, p.contexto_equipo,
           c.nombre AS cliente_nombre, c.id AS cliente_id
    FROM partes_visita pv
    JOIN propiedades p ON p.id = pv.propiedad_id
    JOIN clientes c ON c.id = p.cliente_id
    WHERE pv.id = ${id}
  `;

  if (!parte) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const versiones = await sql<any[]>`
    SELECT * FROM partes_versiones
    WHERE parte_id = ${id}
    ORDER BY version DESC
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const catalogo = await sql<any[]>`
    SELECT id, ambito, nombre, orden
    FROM catalogo_actuaciones WHERE activo = true ORDER BY ambito, orden
  `;

  return (
    <div className="w-full max-w-3xl p-4 sm:p-6 md:p-8">
      <ParteDetail
        parte={parte}
        versiones={versiones.map((version) => ({
          ...version,
          fecha: serializeDate(version.fecha) ?? "",
          hora_entrada: serializeDate(version.hora_entrada),
          hora_salida: serializeDate(version.hora_salida),
          enviada_at: serializeDate(version.enviada_at),
          mediciones: normalizeJsonArray<Medicion>(version.mediciones),
          actuaciones: normalizeJsonArray<Actuacion>(version.actuaciones),
        }))}
        catalogo={catalogo}
      />
    </div>
  );
}
