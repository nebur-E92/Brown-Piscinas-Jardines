"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Bloqueo = {
  id: string;
  franja: string | null;
  motivo: string;
  notas: string | null;
};

export function BloqueosDia({ fecha, bloqueos, invertido = false }: { fecha: string; bloqueos: Bloqueo[]; invertido?: boolean }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [franja, setFranja] = useState("");
  const [motivo, setMotivo] = useState("No disponible");

  async function crear() {
    setLoading(true);
    await fetch("/api/panel/bloqueos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha, franja: franja || null, motivo }),
    });
    setAbierto(false);
    setLoading(false);
    router.refresh();
  }

  async function borrar(id: string) {
    setLoading(true);
    await fetch(`/api/panel/bloqueos/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {bloqueos.map((b) => (
        <button
          key={b.id}
          onClick={() => borrar(b.id)}
          disabled={loading}
          title="Borrar bloqueo"
          className="text-[11px] px-2 py-0.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          {b.franja === "manana" ? "Mañana" : b.franja === "tarde" ? "Tarde" : "Día"} bloqueado
        </button>
      ))}
      <button
        onClick={() => setAbierto((v) => !v)}
        className={`text-xs px-2 py-0.5 rounded transition ${invertido ? "bg-white text-black hover:bg-neutral-100" : "border hover:bg-neutral-100"}`}
      >
        {abierto ? "Cerrar" : "+ Bloqueo"}
      </button>
      {abierto && (
        <div className="basis-full flex flex-col sm:flex-row gap-2 pt-2">
          <select
            value={franja}
            onChange={(e) => setFranja(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white text-black"
          >
            <option value="">Día completo</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
          </select>
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white text-black"
            placeholder="Motivo"
          />
          <button
            onClick={crear}
            disabled={loading}
            className="text-xs px-3 py-1 rounded bg-black text-white disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}
