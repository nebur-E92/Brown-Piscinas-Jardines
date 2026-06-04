"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const INPUT  = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black";
const TIPOS  = ["mantenimiento", "puntual", "desbroce", "setos", "puesta_marcha", "otro"] as const;
const TLABEL: Record<string, string> = {
  mantenimiento: "Mantenimiento mensual",
  puntual:       "Servicio puntual",
  desbroce:      "Desbroce",
  setos:         "Setos / arbustos",
  puesta_marcha: "Puesta en marcha / cierre",
  otro:          "Otro",
};
const PTIPO: Record<string, string> = {
  jardin:    "Jardín",
  piscina:   "Piscina",
  combinado: "Combinado",
};

type Propiedad = { id: string; tipo: string; municipio: string | null; direccion: string | null };
type Cliente   = { id: string; nombre: string; propiedades: Propiedad[] };

export function NuevaVisitaForm({
  clientes,
  clienteIdInicial,
  fechaInicial,
}: {
  clientes: Cliente[];
  clienteIdInicial?: string;
  fechaInicial: string;
}) {
  const router = useRouter();

  const [clienteId,   setClienteId]   = useState(clienteIdInicial ?? "");
  const [propiedadId, setPropiedadId] = useState("");
  const [fecha,       setFecha]       = useState(fechaInicial);
  const [tipo,        setTipo]        = useState<string>("mantenimiento");
  const [precio,      setPrecio]      = useState("");
  const [notas,       setNotas]       = useState("");
  const [error,       setError]       = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  const propiedades = useMemo(
    () => clientes.find((c) => c.id === clienteId)?.propiedades ?? [],
    [clientes, clienteId],
  );

  // Pre-fill precio si el cliente sólo tiene una propiedad
  function onClienteChange(id: string) {
    setClienteId(id);
    setPropiedadId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) { setError("Selecciona un cliente."); return; }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/panel/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: propiedadId ? null : clienteId,
          propiedad_id: propiedadId || null,
          tipo,
          fecha,
          precio: precio ? parseFloat(precio) : null,
          notas:  notas || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al crear la visita.");
        return;
      }

      router.push("/panel/agenda");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Cliente */}
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Cliente *</label>
        <select
          required
          value={clienteId}
          onChange={(e) => onClienteChange(e.target.value)}
          className={INPUT}
        >
          <option value="">— Selecciona un cliente —</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Propiedad */}
      {clienteId && (
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Propiedad</label>
          <select
            value={propiedadId}
            onChange={(e) => setPropiedadId(e.target.value)}
            className={INPUT}
          >
            <option value="">Trabajo puntual sin propiedad</option>
            {propiedades.map((p) => (
              <option key={p.id} value={p.id}>
                {PTIPO[p.tipo] ?? p.tipo}
                {p.municipio ? ` · ${p.municipio}` : ""}
                {p.direccion ? ` (${p.direccion})` : ""}
              </option>
            ))}
          </select>
          {propiedades.length === 0 && (
            <p className="mt-1 text-xs text-neutral-400">Puedes crear una visita puntual sin añadir propiedad.</p>
          )}
        </div>
      )}

      {/* Fecha y tipo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Fecha *</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Tipo de servicio</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={INPUT}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{TLABEL[t]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Precio (€)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="205"
          className={INPUT}
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Notas</label>
        <textarea
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Observaciones de la visita…"
          className={INPUT}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
        >
          {loading ? "Guardando…" : "Crear visita"}
        </button>
      </div>
    </form>
  );
}
