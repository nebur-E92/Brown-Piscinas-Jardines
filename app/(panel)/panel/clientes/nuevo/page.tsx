"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { LOCATIONS } from "../../../../../lib/seo";

export default function NuevoClientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nombre,    setNombre]    = useState(searchParams.get("nombre") ?? "");
  const [telefono,  setTelefono]  = useState(searchParams.get("telefono") ?? "");
  const [email,     setEmail]     = useState(searchParams.get("email") ?? "");
  const [municipio, setMunicipio] = useState(searchParams.get("municipio") ?? "");
  const [direccion, setDireccion] = useState("");
  const [notas,     setNotas]     = useState(searchParams.get("notas") ?? "");
  const leadId = searchParams.get("lead_id") ?? "";
  const [error,     setError]     = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/panel/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, email, municipio, direccion, notas, lead_id: leadId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear el cliente.");
        return;
      }

      router.push(`/panel/clientes/${data.id}`);
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-lg">
      <Link href="/panel/clientes" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-6">
        <FiArrowLeft size={14} /> Clientes
      </Link>

      <h1 className="text-xl font-bold mb-6">Nuevo cliente</h1>
      {leadId && (
        <p className="mb-4 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          Datos precargados desde lead. Al crear el cliente, el lead quedará marcado como convertido.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre *">
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="García López, Ana"
            className={INPUT}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Teléfono">
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono"
              className={INPUT}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com"
              className={INPUT}
            />
          </Field>
        </div>

        <Field label="Municipio">
          <select
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className={INPUT}
          >
            <option value="">— Sin especificar —</option>
            {LOCATIONS.map((l) => (
              <option key={l.slug} value={l.name}>{l.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Dirección">
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="C/ Mayor 12, bajo"
            className={INPUT}
          />
        </Field>

        <Field label="Notas">
          <textarea
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Información adicional…"
            className={INPUT}
          />
        </Field>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Link
            href="/panel/clientes"
            className="flex-1 text-center border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? "Guardando…" : "Crear cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}

const INPUT = "w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
