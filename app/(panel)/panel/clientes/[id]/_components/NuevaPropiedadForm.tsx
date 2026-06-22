"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiX } from "react-icons/fi";

const INPUT = "w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black";

export function NuevaPropiedadForm({ clienteId }: { clienteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [tipo,           setTipo]           = useState("jardin");
  const [tamanoJardin,   setTamanoJardin]   = useState("");
  const [tamanoPiscina,  setTamanoPiscina]  = useState("");
  const [municipio,      setMunicipio]      = useState("");
  const [direccion,      setDireccion]      = useState("");
  const [precioAcordado, setPrecioAcordado] = useState("");
  const [notas,          setNotas]          = useState("");
  const [error,          setError]          = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/panel/propiedades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo,
          tamano_jardin:   ["jardin",   "combinado"].includes(tipo) && tamanoJardin  ? tamanoJardin  : null,
          tamano_piscina:  ["piscina",  "combinado"].includes(tipo) && tamanoPiscina ? tamanoPiscina : null,
          municipio:       municipio  || null,
          direccion:       direccion  || null,
          precio_acordado: precioAcordado ? parseFloat(precioAcordado) : null,
          notas:           notas      || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error.");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black border border-dashed border-neutral-300 rounded-xl px-4 py-3 w-full hover:border-black transition"
      >
        <FiPlus size={14} />
        Añadir propiedad
      </button>
    );
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold">Nueva propiedad</h3>
        <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-black">
          <FiX size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={INPUT}>
            <option value="jardin">Jardín</option>
            <option value="piscina">Piscina</option>
            <option value="combinado">Combinado (jardín + piscina)</option>
          </select>
        </div>

        {["jardin", "combinado"].includes(tipo) && (
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Tamaño jardín</label>
            <select value={tamanoJardin} onChange={(e) => setTamanoJardin(e.target.value)} className={INPUT}>
              <option value="">— Sin especificar —</option>
              <option value="pequeno">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        )}

        {["piscina", "combinado"].includes(tipo) && (
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Tamaño piscina</label>
            <select value={tamanoPiscina} onChange={(e) => setTamanoPiscina(e.target.value)} className={INPUT}>
              <option value="">— Sin especificar —</option>
              <option value="pequeno">Pequeña</option>
              <option value="mediano">Mediana</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Municipio</label>
            <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Salamanca" className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Precio/mes acordado (€)</label>
            <input type="number" min="0" step="0.01" value={precioAcordado} onChange={(e) => setPrecioAcordado(e.target.value)} placeholder="205" className={INPUT} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="C/ Mayor 12" className={INPUT} />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Notas</label>
          <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} className={INPUT} />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-neutral-300 py-2 rounded-lg text-sm hover:bg-neutral-50">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
