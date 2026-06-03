"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccionesReserva({ reservaId, estadoActual }: { reservaId: string; estadoActual: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function cambiar(estado: string) {
    setLoading(true);
    await fetch(`/api/panel/reservas/${reservaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, mensaje_cliente: mensaje }),
    });
    router.refresh();
    setLoading(false);
  }

  if (estadoActual === "pendiente") {
    return (
      <div className="flex flex-col gap-2 min-w-[220px]">
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Mensaje opcional para el cliente"
          className="w-full text-xs border border-neutral-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:border-black"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => cambiar("confirmada")}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            Confirmar
          </button>
          <button
            onClick={() => cambiar("cancelada")}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium border border-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <select
      value={estadoActual}
      onChange={(e) => cambiar(e.target.value)}
      disabled={loading}
      className="text-xs border rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
    >
      {["pendiente", "confirmada", "cancelada"].map((e) => (
        <option key={e} value={e}>{e}</option>
      ))}
    </select>
  );
}
