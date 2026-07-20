"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit2, FiX } from "react-icons/fi";
import { MunicipioInput } from "../../../../../components/MunicipioInput";

const INPUT = "w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black";

type Propiedad = {
  id: string;
  tipo: string;
  tamano_jardin: string | null;
  tamano_piscina: string | null;
  municipio: string | null;
  direccion: string | null;
  precio_acordado: string | null;
  notas: string | null;
  ref_servicio: string | null;
  tipo_cliente: string | null;
  contexto_equipo: string | null;
};

export function EditarPropiedadForm({ propiedad }: { propiedad: Propiedad }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [tipo,           setTipo]           = useState(propiedad.tipo);
  const [tamanoJardin,   setTamanoJardin]   = useState(propiedad.tamano_jardin ?? "");
  const [tamanoPiscina,  setTamanoPiscina]  = useState(propiedad.tamano_piscina ?? "");
  const [municipio,      setMunicipio]      = useState(propiedad.municipio ?? "");
  const [direccion,      setDireccion]      = useState(propiedad.direccion ?? "");
  const [precioAcordado, setPrecioAcordado] = useState(propiedad.precio_acordado ?? "");
  const [notas,          setNotas]          = useState(propiedad.notas ?? "");
  const [refServicio,    setRefServicio]    = useState(propiedad.ref_servicio ?? "");
  const [tipoCliente,    setTipoCliente]    = useState(propiedad.tipo_cliente ?? "");
  const [contextoEquipo, setContextoEquipo] = useState(propiedad.contexto_equipo ?? "");
  const [error,          setError]          = useState<string | null>(null);
  const [loading,        setLoading]        = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/panel/propiedades/${propiedad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          tamano_jardin:   ["jardin", "combinado"].includes(tipo) && tamanoJardin  ? tamanoJardin  : null,
          tamano_piscina:  ["piscina", "combinado"].includes(tipo) && tamanoPiscina ? tamanoPiscina : null,
          municipio:       municipio       || null,
          direccion:       direccion       || null,
          precio_acordado: precioAcordado  ? parseFloat(precioAcordado) : null,
          notas:           notas           || null,
          ref_servicio:    refServicio     || null,
          tipo_cliente:    tipoCliente     || null,
          contexto_equipo: contextoEquipo  || null,
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
        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-black mt-2 transition"
      >
        <FiEdit2 size={12} /> Editar
      </button>
    );
  }

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-xs font-semibold text-neutral-500">Editar propiedad</h4>
        <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-black">
          <FiX size={14} />
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
            <label className="block text-xs font-medium text-neutral-600 mb-1">Municipio o localidad</label>
            <MunicipioInput value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Escribe para buscar" className={INPUT} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Precio/mes (€)</label>
            <input type="number" min="0" step="0.01" value={precioAcordado} onChange={(e) => setPrecioAcordado(e.target.value)} placeholder="205" className={INPUT} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="C/ Mayor 12" className={INPUT} />
        </div>

        <div className="border-t pt-3 mt-3">
          <p className="text-xs font-semibold text-neutral-500 mb-2">Datos para partes de visita</p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Referencia de servicio</label>
              <input value={refServicio} onChange={(e) => setRefServicio(e.target.value)} placeholder="260527-JD" className={INPUT} />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Tipo de cliente</label>
              <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} className={INPUT}>
                <option value="">— Sin especificar —</option>
                <option value="particular">Particular</option>
                <option value="comunidad">Comunidad</option>
                <option value="casa_rural">Casa rural</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Contexto de equipo</label>
              <textarea
                rows={2}
                value={contextoEquipo}
                onChange={(e) => setContextoEquipo(e.target.value)}
                placeholder="Clorador salino, dosificadora pH, liner azul…"
                className={INPUT}
              />
              <p className="text-[11px] text-neutral-400 mt-0.5">No se imprime en el parte. Referencia del técnico.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Notas</label>
          <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} className={INPUT} />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-neutral-300 py-2 rounded-lg text-sm hover:bg-neutral-50">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
