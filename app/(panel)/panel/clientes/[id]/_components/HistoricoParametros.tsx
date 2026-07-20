"use client";

import { useState, useEffect } from "react";

type Fila = {
  fecha: string;
  numero_temporada: number | null;
  mediciones: Array<{ codigo: string; valor: number | null; opcion: string | null }>;
};

const PARAMS = [
  { codigo: "cloro_libre", label: "Cloro libre" },
  { codigo: "cloro_combinado", label: "Cloro comb." },
  { codigo: "ph", label: "pH" },
  { codigo: "temperatura", label: "Temp. (°C)" },
  { codigo: "turbidez", label: "Turbidez" },
  { codigo: "cianurico", label: "Cianúrico" },
  { codigo: "salinidad", label: "Sal (ppm)" },
];

export function HistoricoParametros({ propiedadId }: { propiedadId: string }) {
  const [datos, setDatos] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/panel/partes/historico?propiedad_id=${propiedadId}`)
      .then((r) => r.json())
      .then((d) => { setDatos(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [propiedadId]);

  if (loading) return <p className="text-xs text-neutral-400">Cargando histórico…</p>;
  if (datos.length === 0) return null;

  function fmtDate(d: string) {
    const [y, m, dd] = d.split("T")[0].split("-");
    return `${dd}/${m}`;
  }

  function getValor(fila: Fila, codigo: string): string {
    const m = fila.mediciones?.find((x) => x.codigo === codigo);
    if (!m) return "—";
    if (m.valor != null) return String(m.valor).replace(".", ",");
    if (m.opcion) return m.opcion;
    return "—";
  }

  // Invertir para mostrar más reciente a la derecha
  const columnas = [...datos].reverse();

  return (
    <div className="bg-white border rounded-xl shadow-sm p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
        Evolución parámetros
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-2 text-neutral-500 font-medium">Parámetro</th>
              {columnas.map((f, i) => (
                <th key={i} className="text-center py-1 px-1 text-neutral-500 font-medium min-w-[50px]">
                  {fmtDate(f.fecha)}
                  {f.numero_temporada != null && (
                    <span className="block text-[10px] text-neutral-400">nº{f.numero_temporada}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARAMS.map((p) => (
              <tr key={p.codigo} className="border-b border-neutral-50">
                <td className="py-1.5 pr-2 text-neutral-600">{p.label}</td>
                {columnas.map((f, i) => (
                  <td key={i} className="text-center py-1.5 px-1 font-medium">
                    {getValor(f, p.codigo)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
