"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiFileText, FiShare2, FiEdit2 } from "react-icons/fi";

type Parte = {
  id: string;
  propiedad_id: string;
  anio: number;
  numero_temporada: number | null;
  prop_tipo: string;
  direccion: string | null;
  ref_servicio: string | null;
  cliente_nombre: string;
  cliente_id: string;
};

type Version = {
  id: string;
  version: number;
  estado: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  mediciones: Array<{ codigo: string; valor: number | null; opcion: string | null; obs: string | null }>;
  actuaciones: Array<{ nombre: string; ambito: string; estado: string; detalle: string | null }>;
  estado_agua: string | null;
  estado_liner: string | null;
  estado_equipos: string | null;
  estado_jardin: string | null;
  cierre_preventivo: boolean;
  cierre_motivo: string | null;
  incidencias: string | null;
  recomendaciones: string | null;
  stock_titular: string | null;
  restos_vegetales: string | null;
  enviada_at: string | null;
  corrige_version_id: string | null;
  snapshot_datos_fijos: {
    direccion: string | null;
    ref_servicio: string | null;
    tipo_cliente: string | null;
    tipo_propiedad: string;
    tecnico_nombre: string | null;
    cliente_nombre: string;
  } | null;
};

const ESTADO_BADGE: Record<string, string> = {
  borrador:   "bg-yellow-50 text-yellow-700",
  finalizado: "bg-blue-50 text-blue-700",
  enviada:    "bg-green-50 text-green-700",
  archivada:  "bg-neutral-100 text-neutral-500",
};

export function ParteDetail({ parte, versiones }: { parte: Parte; versiones: Version[]; catalogo: unknown }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ultima = versiones[0];
  if (!ultima) return <p className="text-sm text-neutral-400">Sin versiones.</p>;

  async function handleEnviar() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/panel/partes/${parte.id}/enviar`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error.");
    }
    setLoading(false);
  }

  async function handleRevertir() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/panel/partes/${parte.id}/finalizar`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error.");
    }
    setLoading(false);
  }

  async function handleSharePDF() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/panel/partes/${parte.id}/pdf`);
      if (!res.ok) { setError("Error al generar PDF."); setLoading(false); return; }
      const blob = await res.blob();
      const ref = refServicio ?? "parte";
      const file = new File([blob], `BROWN-${ref}.pdf`, { type: "application/pdf" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Parte ${ref}` });
      } else {
        // Fallback: descargar
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // El usuario canceló el share — no es error
    }
    setLoading(false);
  }

  async function handleCorreccion() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/panel/partes/${parte.id}/correccion`, { method: "POST" });
    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error.");
    }
    setLoading(false);
  }

  function fmtDate(d: string) {
    if (!d) return "—";
    const [y, m, dd] = d.split("T")[0].split("-");
    return `${dd}/${m}/${y}`;
  }

  function fmtTime(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }

  const actPiscina = ultima.actuaciones?.filter((a) => a.ambito === "piscina") ?? [];
  const actJardin = ultima.actuaciones?.filter((a) => a.ambito === "jardin") ?? [];

  // Usar snapshot si la versión es enviada/finalizado (datos inmutables)
  const snap = ultima.snapshot_datos_fijos;
  const tipoProp = snap?.tipo_propiedad ?? parte.prop_tipo;
  const direccion = snap?.direccion ?? parte.direccion;
  const refServicio = snap?.ref_servicio ?? parte.ref_servicio;
  const clienteNombre = snap?.cliente_nombre ?? parte.cliente_nombre;

  const incluyePiscina = tipoProp === "piscina" || tipoProp === "combinado";
  const incluyeJardin = tipoProp === "jardin" || tipoProp === "combinado";

  return (
    <div>
      <Link href={`/panel/clientes/${parte.cliente_id}`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-4">
        <FiArrowLeft size={14} /> {clienteNombre}
      </Link>

      {/* Cabecera */}
      <div className="bg-white border rounded-xl shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">
              Parte {refServicio && <span className="font-mono text-base">{refServicio}</span>}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {direccion ?? "Sin dirección"} · {fmtDate(ultima.fecha)}
              {parte.numero_temporada != null && <> · Visita nº {parte.numero_temporada}</>}
            </p>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[ultima.estado]}`}>
            {ultima.estado}
          </span>
        </div>

        <div className="flex gap-x-4 text-xs text-neutral-500 mt-2">
          <span>Entrada: {fmtTime(ultima.hora_entrada)}</span>
          <span>Salida: {fmtTime(ultima.hora_salida)}</span>
          <span>Versión: {ultima.version}</span>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mb-4 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

      {/* Parámetros del agua */}
      {incluyePiscina && ultima.mediciones?.length > 0 && (
        <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-semibold mb-3">Parámetros del agua</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {ultima.mediciones.map((m) => (
              <div key={m.codigo} className="flex justify-between border-b border-neutral-100 pb-1">
                <span className="text-neutral-500 text-xs">{m.codigo.replace("_", " ")}</span>
                <span className="font-medium text-xs">{m.valor ?? m.opcion ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actuaciones */}
      {incluyePiscina && actPiscina.length > 0 && (
        <ActuacionesCard title="Actuaciones piscina" items={actPiscina} />
      )}
      {incluyeJardin && actJardin.length > 0 && (
        <ActuacionesCard title="Actuaciones jardín" items={actJardin} />
      )}

      {/* Estado general */}
      <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Estado general</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {incluyePiscina && <><Field label="Agua" value={ultima.estado_agua} /><Field label="Liner" value={ultima.estado_liner} /><Field label="Equipos" value={ultima.estado_equipos} /></>}
          {incluyeJardin && <Field label="Jardín" value={ultima.estado_jardin} />}
        </div>
        {ultima.cierre_preventivo && (
          <p className="text-xs text-red-600 mt-2">Cierre preventivo: {ultima.cierre_motivo ?? "Sin motivo"}</p>
        )}
        {ultima.restos_vegetales && (
          <p className="text-xs text-neutral-500 mt-1">Restos vegetales: {ultima.restos_vegetales === "mas_150l" ? "> 150 L (+60 €)" : "≤ 150 L"}</p>
        )}
      </div>

      {/* Incidencias */}
      {(ultima.incidencias || ultima.recomendaciones || ultima.stock_titular) && (
        <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-semibold mb-3">Incidencias y recomendaciones</h2>
          {ultima.incidencias && <TextBlock label="Incidencias" text={ultima.incidencias} />}
          {ultima.recomendaciones && <TextBlock label="Recomendaciones" text={ultima.recomendaciones} />}
          {ultima.stock_titular && <TextBlock label="Stock titular" text={ultima.stock_titular} />}
        </div>
      )}

      {/* Versiones anteriores */}
      {versiones.length > 1 && (
        <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-sm font-semibold mb-2">Versiones</h2>
          <div className="space-y-1">
            {versiones.map((v) => (
              <div key={v.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50">
                <span>v{v.version} — {v.estado} — {fmtDate(v.fecha)}</span>
                {v.corrige_version_id && <span className="text-neutral-400">Corrección</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {ultima.estado === "borrador" && (
          <Link href={`/panel/partes/nuevo?propiedad_id=${parte.propiedad_id}&parte_id=${parte.id}`} className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50">
            <FiEdit2 size={14} /> Editar borrador
          </Link>
        )}

        {ultima.estado === "finalizado" && (
          <>
            <a href={`/api/panel/partes/${parte.id}/pdf`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50">
              <FiFileText size={14} /> Ver PDF
            </a>
            <button onClick={() => handleSharePDF()} disabled={loading} className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50 disabled:opacity-50">
              <FiShare2 size={14} /> Compartir PDF
            </button>
            <button onClick={handleEnviar} disabled={loading} className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
              Marcar como enviado
            </button>
            <button onClick={handleRevertir} disabled={loading} className="text-xs text-neutral-400 hover:text-black py-2">
              Volver a borrador
            </button>
          </>
        )}

        {ultima.estado === "enviada" && (
          <>
            <a href={`/api/panel/partes/${parte.id}/pdf`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50">
              <FiFileText size={14} /> Ver PDF
            </a>
            <button onClick={() => handleSharePDF()} disabled={loading} className="flex-1 flex items-center justify-center gap-1.5 border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50 disabled:opacity-50">
              <FiShare2 size={14} /> Compartir PDF
            </button>
            <button onClick={handleCorreccion} disabled={loading} className="flex-1 border border-neutral-300 py-2.5 rounded-lg text-sm hover:bg-neutral-50 disabled:opacity-50">
              Crear corrección
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ActuacionesCard({ title, items }: { title: string; items: Array<{ nombre: string; estado: string; detalle: string | null }> }) {
  const ST: Record<string, string> = { si: "text-green-700", no: "text-neutral-400", na: "text-neutral-300" };
  const LBL: Record<string, string> = { si: "✓", no: "—", na: "N/A" };
  return (
    <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <div className="space-y-1">
        {items.map((a) => (
          <div key={a.nombre} className="flex items-center gap-2 text-xs py-0.5">
            <span className={`w-8 text-center font-semibold ${ST[a.estado]}`}>{LBL[a.estado]}</span>
            <span className="text-neutral-700">{a.nombre}</span>
            {a.detalle && <span className="text-neutral-400 ml-auto truncate max-w-[40%]">{a.detalle}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between border-b border-neutral-50 pb-1">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}

function TextBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm text-neutral-700 whitespace-pre-wrap">{text}</p>
    </div>
  );
}
