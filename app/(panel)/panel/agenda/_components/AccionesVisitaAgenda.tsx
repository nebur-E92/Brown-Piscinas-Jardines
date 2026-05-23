"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX } from "react-icons/fi";

export function AccionesVisitaAgenda({ visitaId }: { visitaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cambiar(estado: "completada" | "cancelada") {
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
        onClick={() => cambiar("completada")}
        disabled={loading}
        title="Completada"
        className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-40 transition"
      >
        <FiCheck size={14} />
      </button>
      <button
        onClick={() => cambiar("cancelada")}
        disabled={loading}
        title="Cancelar"
        className="p-1.5 rounded text-neutral-400 hover:bg-neutral-100 disabled:opacity-40 transition"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}
