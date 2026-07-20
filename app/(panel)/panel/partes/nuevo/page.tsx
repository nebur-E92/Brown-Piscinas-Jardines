import { getDb } from "../../../../../lib/panel/db";
import { getSession } from "../../../../../lib/panel/auth";
import { redirect, notFound } from "next/navigation";
import { ParteForm } from "./_components/ParteForm";

export const dynamic = "force-dynamic";

export default async function NuevoPartePage({ searchParams }: { searchParams: Promise<{ propiedad_id?: string; visita_id?: string; parte_id?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/panel-login");

  const sp = await searchParams;
  const propiedadId = sp.propiedad_id;
  if (!propiedadId) return notFound();

  const sql = getDb();

  type PropRow = { id: string; tipo: string; direccion: string | null; ref_servicio: string | null; tipo_cliente: string | null; contexto_equipo: string | null; cliente_nombre: string; cliente_telefono: string | null; cliente_email: string | null };
  type CatRow = { id: string; ambito: string; nombre: string; orden: number };

  const [prop] = await sql<PropRow[]>`
    SELECT p.id, p.tipo, p.direccion, p.ref_servicio, p.tipo_cliente, p.contexto_equipo,
           c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
    FROM propiedades p
    JOIN clientes c ON c.id = p.cliente_id
    WHERE p.id = ${propiedadId} AND p.activa = true
  `;
  if (!prop) return notFound();

  const catalogo = await sql<CatRow[]>`
    SELECT id, ambito, nombre, orden
    FROM catalogo_actuaciones
    WHERE activo = true
    ORDER BY ambito, orden
  `;

  return (
    <div className="w-full max-w-3xl p-4 sm:p-6 md:p-8">
      <ParteForm
        propiedad={prop}
        catalogo={catalogo}
        visitaId={sp.visita_id ?? null}
        existingParteId={sp.parte_id ?? null}
      />
    </div>
  );
}
