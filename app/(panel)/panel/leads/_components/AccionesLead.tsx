"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ESTADOS = ["nuevo", "contactado", "convertido", "descartado"] as const;

export function AccionesLead({ leadId, estadoActual }: { leadId: string; estadoActual: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cambiarEstado(estado: string) {
    if (estado === estadoActual) return;
    setLoading(true);
    await fetch(`/api/panel/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <select
      value={estadoActual}
      onChange={(e) => cambiarEstado(e.target.value)}
      disabled={loading}
      className="text-xs border rounded-lg px-2 py-1.5 bg-white disabled:opacity-50 cursor-pointer"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>{e}</option>
      ))}
    </select>
  );
}
