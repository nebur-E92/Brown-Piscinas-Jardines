"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MunicipioInput } from "../../../../components/MunicipioInput";

const TIPOS = [
  { id: "visita_tecnica", label: "Visita técnica" },
  { id: "cesped",         label: "Césped" },
  { id: "piscina",        label: "Piscina" },
  { id: "setos",          label: "Setos" },
  { id: "desbroce",       label: "Desbroce" },
  { id: "otro",           label: "Otro" },
];

type Props = {
  reserva: {
    id: string; fecha: string; franja: string; tipo: string;
    nombre: string; email: string; telefono: string | null;
    municipio: string | null; notas: string | null;
  };
};

export function EditarReserva({ reserva }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fecha:     reserva.fecha,
    franja:    reserva.franja,
    tipo:      reserva.tipo,
    nombre:    reserva.nombre,
    email:     reserva.email,
    telefono:  reserva.telefono  ?? "",
    municipio: reserva.municipio ?? "",
    notas:     reserva.notas     ?? "",
  });

  const inputCls = "w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black transition";

  async function guardar() {
    setLoading(true);
    await fetch(`/api/panel/reservas/${reserva.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modo: "editar", ...form }),
    });
    router.refresh();
    setAbierto(false);
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={() => setAbierto(!abierto)}
        className="text-xs px-3 py-1.5 border rounded-lg hover:bg-neutral-50 transition"
      >
        {abierto ? "Cerrar" : "Editar"}
      </button>

      {abierto && (
        <div className="mt-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Franja</label>
              <select
                value={form.franja}
                onChange={(e) => setForm({ ...form, franja: e.target.value })}
                className={inputCls + " bg-white"}
              >
                <option value="manana">Mañana (9–14 h)</option>
                <option value="tarde">Tarde (15–19 h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Tipo de servicio</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className={inputCls + " bg-white"}
            >
              {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre</label>
              <input
                type="text" value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Teléfono</label>
              <input
                type="tel" value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
              <input
                type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Municipio o localidad</label>
              <MunicipioInput
                value={form.municipio}
                onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                placeholder="Escribe para buscar"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Notas</label>
            <textarea
              rows={2}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="flex flex-col justify-end gap-2 pt-1 sm:flex-row">
            <button
              onClick={() => setAbierto(false)}
              className="text-xs px-4 py-2 border rounded-lg hover:bg-white transition"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={loading}
              className="text-xs px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition"
            >
              {loading ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
