"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MunicipioInput } from "../../../../components/MunicipioInput";

const INPUT = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white";

const TIPOS = [
  { id: "puntual", label: "Servicio puntual" },
  { id: "mantenimiento", label: "Mantenimiento" },
  { id: "desbroce", label: "Desbroce" },
  { id: "setos", label: "Setos" },
  { id: "puesta_marcha", label: "Puesta en marcha" },
  { id: "otro", label: "Otro" },
];

type Cliente = {
  id: string;
  nombre: string;
  propiedades: { id: string; tipo: string; municipio: string | null; direccion: string | null }[];
};

type Reserva = {
  id: string;
  fecha: string;
  tipo: string;
  nombre: string;
  email: string;
  telefono: string | null;
  municipio: string | null;
  notas: string | null;
};

const PROP_LABEL: Record<string, string> = {
  jardin: "Jardín",
  piscina: "Piscina",
  combinado: "Combinado",
};

function tipoInicial(tipoReserva: string) {
  if (tipoReserva === "desbroce") return "desbroce";
  if (tipoReserva === "setos") return "setos";
  return "puntual";
}

export function GestionarReserva({ reserva, clientes }: { reserva: Reserva; clientes: Cliente[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modo, setModo] = useState<"existente" | "nuevo">("existente");
  const [clienteId, setClienteId] = useState("");
  const [propiedadId, setPropiedadId] = useState("");
  const [tipoVisita, setTipoVisita] = useState(tipoInicial(reserva.tipo));
  const [precio, setPrecio] = useState("");
  const [notas, setNotas] = useState(reserva.notas ?? "");
  const [nuevo, setNuevo] = useState({
    nombre: reserva.nombre,
    email: reserva.email,
    telefono: reserva.telefono ?? "",
    municipio: reserva.municipio ?? "",
  });

  const propiedades = useMemo(
    () => clientes.find((c) => c.id === clienteId)?.propiedades ?? [],
    [clientes, clienteId],
  );

  async function gestionar() {
    setError("");
    if (modo === "existente" && !clienteId) {
      setError("Selecciona un cliente.");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/panel/reservas/${reserva.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modo: "gestionar",
        crear_cliente: modo === "nuevo",
        cliente_id: modo === "existente" ? clienteId : null,
        cliente: nuevo,
        propiedad_id: modo === "existente" ? propiedadId || null : null,
        tipo_visita: tipoVisita,
        precio: precio || null,
        notas,
      }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "No se pudo gestionar la reserva.");
      return;
    }

    setAbierto(false);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="text-xs px-3 py-1.5 border border-black text-black rounded-lg hover:bg-black hover:text-white transition"
      >
        {abierto ? "Cerrar" : "Gestionar"}
      </button>

      {abierto && (
        <div className="mt-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setModo("existente")}
              className={`px-3 py-1.5 rounded-lg border ${modo === "existente" ? "bg-black text-white border-black" : "bg-white"}`}
            >
              Cliente existente
            </button>
            <button
              onClick={() => setModo("nuevo")}
              className={`px-3 py-1.5 rounded-lg border ${modo === "nuevo" ? "bg-black text-white border-black" : "bg-white"}`}
            >
              Crear cliente
            </button>
          </div>

          {modo === "existente" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Cliente</label>
                <select
                  value={clienteId}
                  onChange={(e) => {
                    setClienteId(e.target.value);
                    setPropiedadId("");
                  }}
                  className={INPUT}
                >
                  <option value="">Selecciona cliente...</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              {clienteId && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Propiedad</label>
                  <select value={propiedadId} onChange={(e) => setPropiedadId(e.target.value)} className={INPUT}>
                    <option value="">Trabajo puntual sin propiedad</option>
                    {propiedades.map((p) => (
                      <option key={p.id} value={p.id}>
                        {PROP_LABEL[p.tipo] ?? p.tipo}
                        {p.municipio ? ` · ${p.municipio}` : ""}
                        {p.direccion ? ` (${p.direccion})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre</label>
                <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Teléfono</label>
                <input value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
                <input value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Municipio o localidad</label>
                <MunicipioInput value={nuevo.municipio} onChange={(e) => setNuevo({ ...nuevo, municipio: e.target.value })} placeholder="Escribe para buscar" className={INPUT} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Tipo de visita</label>
              <select value={tipoVisita} onChange={(e) => setTipoVisita(e.target.value)} className={INPUT}>
                {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Precio (€)</label>
              <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} className={INPUT} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Notas de la visita</label>
            <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} className={`${INPUT} resize-none`} />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            <button onClick={() => setAbierto(false)} className="text-xs px-4 py-2 border rounded-lg hover:bg-white transition">
              Cancelar
            </button>
            <button onClick={gestionar} disabled={loading} className="text-xs px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition">
              {loading ? "Gestionando..." : "Crear visita enlazada"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
