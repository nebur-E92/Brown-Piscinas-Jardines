"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (loading) return;
    const confirmed = window.confirm("¿Seguro que quieres resetear contadores y logs?");
    if (!confirmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/qr/reset", { method: "POST" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error al resetear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleReset}
        className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Reseteando..." : "Resetear contadores"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
