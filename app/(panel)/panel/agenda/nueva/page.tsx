import { getDb } from "../../../../../lib/panel/db";
import { NuevaVisitaForm } from "./_components/NuevaVisitaForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export const dynamic = "force-dynamic";

type ClienteConProps = {
  id: string;
  nombre: string;
  propiedades: { id: string; tipo: string; municipio: string | null; direccion: string | null }[];
};

async function getClientes(): Promise<ClienteConProps[]> {
  const sql = getDb();

  const clientes = await sql<{ id: string; nombre: string }[]>`
    SELECT id, nombre FROM clientes WHERE activo = true ORDER BY nombre
  `;

  const propiedades = await sql<{ id: string; cliente_id: string; tipo: string; municipio: string | null; direccion: string | null }[]>`
    SELECT id, cliente_id, tipo, municipio, direccion FROM propiedades WHERE activa = true ORDER BY tipo
  `;

  return clientes.map((c) => ({
    ...c,
    propiedades: propiedades.filter((p) => p.cliente_id === c.id),
  }));
}

export default async function NuevaVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente_id?: string; fecha?: string }>;
}) {
  const sp = await searchParams;
  const clientes = await getClientes();

  return (
    <div className="w-full max-w-lg p-4 sm:p-6 md:p-8">
      <Link href="/panel/agenda" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-6">
        <FiArrowLeft size={14} /> Agenda
      </Link>
      <h1 className="text-xl font-bold mb-6">Nueva visita</h1>
      <NuevaVisitaForm
        clientes={clientes}
        clienteIdInicial={sp.cliente_id}
        fechaInicial={sp.fecha ?? new Date().toISOString().slice(0, 10)}
      />
    </div>
  );
}
