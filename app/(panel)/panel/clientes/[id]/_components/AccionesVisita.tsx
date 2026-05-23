"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX } from "react-icons/fi";

export function AccionesVisita({ visitaId }: { visitaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cambiarEstado(estado: "completada" | "cancelada") {
    setLoading(true);
    await fetch(`/api/panel/visitas/${visitaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => cambiarEstado("completada")}
        disabled={loading}
        title="Marcar como completada"
        className="p-1.5 rounded text-green-600 hover:bg-green-50 transition disabled:opacity-40"
      >
        <FiCheck size={14} />
      </button>
      <button
        onClick={() => cambiarEstado("cancelada")}
        disabled={loading}
        title="Cancelar visita"
        className="p-1.5 rounded text-neutral-400 hover:bg-neutral-100 transition disabled:opacity-40"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}
