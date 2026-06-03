"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccionesCliente({
  clienteId,
  canHardDelete,
}: {
  clienteId: string;
  canHardDelete: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"soft" | "hard" | null>(null);
  const [error, setError] = useState("");

  async function desactivar() {
    if (!window.confirm("¿Desactivar este cliente? Dejará de aparecer en la lista activa.")) return;
    setError("");
    setLoading("soft");
    const res = await fetch(`/api/panel/clientes/${clienteId}`, { method: "DELETE" });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo desactivar el cliente.");
      return;
    }
    router.push("/panel/clientes");
    router.refresh();
  }

  async function eliminarDefinitivamente() {
    if (!window.confirm("¿Eliminar definitivamente este cliente? Esta acción no se puede deshacer.")) return;
    setError("");
    setLoading("hard");
    const res = await fetch(`/api/panel/clientes/${clienteId}?hard=1`, { method: "DELETE" });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo eliminar definitivamente el cliente.");
      return;
    }
    router.push("/panel/clientes");
    router.refresh();
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={desactivar}
          disabled={loading !== null}
          className="px-3 py-1.5 text-xs font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 disabled:opacity-50 transition"
        >
          {loading === "soft" ? "Desactivando..." : "Desactivar"}
        </button>
        <button
          type="button"
          onClick={eliminarDefinitivamente}
          disabled={loading !== null || !canHardDelete}
          title={!canHardDelete ? "El cliente tiene propiedades o visitas asociadas." : undefined}
          className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading === "hard" ? "Eliminando..." : "Eliminar definitivamente"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
