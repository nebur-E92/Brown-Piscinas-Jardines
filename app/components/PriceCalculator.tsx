"use client";

import { useState } from "react";
import { TARIFAS } from "../../lib/pricing";
import type { Frecuencia, Altura, TallaPM } from "../../lib/pricing";

// ─── tipos de los 4 servicios UI ─────────────────────────────────────────────

type TipoSeto    = "alibustre" | "coniferas";
type TipoPiscina = "mantenimiento" | "puesta-marcha";

type EstadoCesped = { medida: string; frecuencia: Frecuencia };
type EstadoSetos  = { tipo: TipoSeto; medida: string; frecuencia: Frecuencia; altura: Altura };
type EstadoPiscina = { tipo: TipoPiscina; medida: string; frecuencia: Frecuencia; talla: TallaPM };
type EstadoDesbroce = { medida: string };

type Estado = {
  cesped:   EstadoCesped;
  setos:    EstadoSetos;
  piscina:  EstadoPiscina;
  desbroce: EstadoDesbroce;
};

type ServicioId = keyof Estado;

type Linea = { nombre: string; precio: number; nota?: string };
type ResultadoCalculo = { total: number; desglose: Record<string, Linea> };

// ─── constantes ───────────────────────────────────────────────────────────────

const TARJETAS: { id: ServicioId; nombre: string; icono: string; desde: string }[] = [
  { id: "cesped",   nombre: "Césped",   icono: "🌿", desde: "0,18 €/m²" },
  { id: "setos",    nombre: "Setos",    icono: "✂️", desde: "3,50 €/ml" },
  { id: "piscina",  nombre: "Piscina",  icono: "💧", desde: "1,20 €/m²" },
  { id: "desbroce", nombre: "Desbroce", icono: "🏗️", desde: "0,35 €/m²" },
];

const ESTADO_INICIAL: Estado = {
  cesped:   { medida: "", frecuencia: "puntual" },
  setos:    { tipo: "alibustre", medida: "", frecuencia: "puntual", altura: "ninguna" },
  piscina:  { tipo: "mantenimiento", medida: "", frecuencia: "puntual", talla: "pequena" },
  desbroce: { medida: "" },
};

const FREC_LABELS: Record<Frecuencia, { label: string; desc: string }> = {
  puntual:   { label: "Puntual",   desc: "Una visita" },
  quincenal: { label: "Quincenal", desc: "2/mes · −12 %" },
  semanal:   { label: "Semanal",   desc: "4/mes · −22 %" },
};

const ALTURA_LABELS: Record<Altura, string> = {
  ninguna: "Hasta 2 m",
  "2m":    "> 2 m  (+0,60 €/ml)",
  "3m":    "> 3 m  (+1,25 €/ml)",
};

const TALLA_LABELS: Record<TallaPM, string> = {
  pequena: `Pequeña — ${TARIFAS.puesta_marcha.pequena} €`,
  mediana: `Mediana — ${TARIFAS.puesta_marcha.mediana} €`,
  grande:  `Grande — ${TARIFAS.puesta_marcha.grande} €`,
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function FrecuenciaSelector({ value, onChange }: { value: Frecuencia; onChange: (f: Frecuencia) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">Frecuencia</label>
      <div className="grid grid-cols-3 gap-1.5">
        {(["puntual", "quincenal", "semanal"] as Frecuencia[]).map((f) => (
          <button
            key={f} type="button" onClick={() => onChange(f)}
            className={`py-2 px-1 rounded-lg text-xs font-medium border transition-all text-center ${
              value === f
                ? "bg-black text-white border-black"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
            }`}
          >
            <span className="block">{FREC_LABELS[f].label}</span>
            <span className={`block text-[10px] mt-0.5 ${value === f ? "text-neutral-300" : "text-neutral-400"}`}>
              {FREC_LABELS[f].desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MedidaInput({ label, placeholder, value, onChange, error, hint }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">{label}</label>
      <input
        type="number" min="0.1" step="0.5" placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 ${
          error ? "border-red-400 bg-red-50" : "border-neutral-200"
        }`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────

export default function PriceCalculator() {
  const [seleccionados, setSeleccionados] = useState<ServicioId[]>([]);
  const [estado, setEstado]               = useState<Estado>({ ...ESTADO_INICIAL });
  const [resultado, setResultado]         = useState<ResultadoCalculo | null>(null);
  const [errores, setErrores]             = useState<Record<string, string>>({});
  const [errorGlobal, setErrorGlobal]     = useState<string | null>(null);
  const [cargando, setCargando]           = useState(false);

  function toggle(id: ServicioId) {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setResultado(null);
    setErrores({});
    setErrorGlobal(null);
  }

  function update<K extends ServicioId>(id: K, patch: Partial<Estado[K]>) {
    setEstado((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setResultado(null);
  }

  function buildItems() {
    const items: Record<string, unknown>[] = [];
    for (const id of seleccionados) {
      if (id === "cesped") {
        const e = estado.cesped;
        items.push({ id: "cesped", medida: parseFloat(e.medida) || 0, frecuencia: e.frecuencia });
      } else if (id === "setos") {
        const e = estado.setos;
        items.push({
          id:        e.tipo === "alibustre" ? "setos-alibustre" : "setos-coniferas",
          medida:    parseFloat(e.medida) || 0,
          frecuencia: e.frecuencia,
          altura:    e.altura,
        });
      } else if (id === "piscina") {
        const e = estado.piscina;
        if (e.tipo === "puesta-marcha") {
          items.push({ id: "puesta-marcha", talla: e.talla });
        } else {
          items.push({ id: "piscina", medida: parseFloat(e.medida) || 0, frecuencia: e.frecuencia });
        }
      } else if (id === "desbroce") {
        const e = estado.desbroce;
        items.push({ id: "desbroce", medida: parseFloat(e.medida) || 0 });
      }
    }
    return items;
  }

  async function calcular() {
    if (!seleccionados.length) return;
    setCargando(true);
    setErrores({});
    setErrorGlobal(null);
    setResultado(null);

    try {
      const res = await fetch("/api/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicios: buildItems() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const nuevosErrores: Record<string, string> = {};
        (data.detalles ?? []).forEach((code: string) => {
          if (code === "desbroce_sup_2000") {
            nuevosErrores["desbroce"] = "Más de 2.000 m²: contacta para presupuesto personalizado.";
          } else if (code.includes("setos")) {
            nuevosErrores["setos"] = "Introduce un valor válido.";
          } else if (code.includes("piscina") || code.includes("puesta")) {
            nuevosErrores["piscina"] = "Introduce un valor válido.";
          } else {
            const sid = code.replace(/_medida_invalida$/, "").replace(/_/g, "-");
            nuevosErrores[sid] = "Introduce un valor válido.";
          }
        });
        if (!Object.keys(nuevosErrores).length) setErrorGlobal("No se pudo calcular. Revisa los datos.");
        setErrores(nuevosErrores);
      } else {
        setResultado(data);
        setTimeout(() => document.getElementById("resultado-calc")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
      }
    } catch {
      setErrorGlobal("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  const haySeleccionados = seleccionados.length > 0;

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── paso 1: tarjetas ── */}
      <p className="text-sm font-semibold text-neutral-700 mb-3">
        1. ¿Qué necesitas?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {TARJETAS.map(({ id, nombre, icono, desde }) => {
          const activo = seleccionados.includes(id);
          return (
            <button
              key={id} type="button" onClick={() => toggle(id)}
              className={`relative flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 text-left transition-all ${
                activo
                  ? "border-black bg-black text-white shadow-md"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:shadow-sm"
              }`}
            >
              {activo && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <span className="text-2xl">{icono}</span>
              <span className="text-sm font-semibold">{nombre}</span>
              <span className={`text-[11px] ${activo ? "text-neutral-300" : "text-neutral-400"}`}>{desde}</span>
            </button>
          );
        })}
      </div>

      {/* ── paso 2: detalles ── */}
      {haySeleccionados && (
        <>
          <p className="text-sm font-semibold text-neutral-700 mb-3">2. Introduce los detalles</p>
          <div className="space-y-3 mb-6">

            {/* CÉSPED */}
            {seleccionados.includes("cesped") && (
              <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                  <span>🌿</span>
                  <span className="text-sm font-semibold">Césped</span>
                  <button type="button" onClick={() => toggle("cesped")} className="ml-auto text-xs text-neutral-400 hover:text-black transition">Quitar ×</button>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <MedidaInput
                    label="Superficie (m²)"
                    placeholder="Ej: 150"
                    value={estado.cesped.medida}
                    onChange={(v) => update("cesped", { medida: v })}
                    error={errores["cesped"]}
                    hint="Mínimo por visita: 45 €"
                  />
                  <FrecuenciaSelector
                    value={estado.cesped.frecuencia}
                    onChange={(f) => update("cesped", { frecuencia: f })}
                  />
                </div>
              </div>
            )}

            {/* SETOS */}
            {seleccionados.includes("setos") && (
              <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                  <span>✂️</span>
                  <span className="text-sm font-semibold">Setos</span>
                  <button type="button" onClick={() => toggle("setos")} className="ml-auto text-xs text-neutral-400 hover:text-black transition">Quitar ×</button>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {/* tipo */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Tipo de seto</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([["alibustre", "Hoja pequeña", "3,50 €/ml"], ["coniferas", "Conífera", "4,50 €/ml"]] as [TipoSeto, string, string][]).map(([val, label, precio]) => (
                        <button
                          key={val} type="button"
                          onClick={() => update("setos", { tipo: val })}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-medium text-left transition-all ${
                            estado.setos.tipo === val
                              ? "bg-black text-white border-black"
                              : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400"
                          }`}
                        >
                          <span className="block">{label}</span>
                          <span className={`text-[10px] ${estado.setos.tipo === val ? "text-neutral-300" : "text-neutral-400"}`}>{precio}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <MedidaInput
                    label="Metros lineales (ml)"
                    placeholder="Ej: 25"
                    value={estado.setos.medida}
                    onChange={(v) => update("setos", { medida: v })}
                    error={errores["setos"]}
                    hint="Mínimo por visita: 55 €"
                  />
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Altura del seto</label>
                    <select
                      value={estado.setos.altura}
                      onChange={(e) => update("setos", { altura: e.target.value as Altura })}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                    >
                      {(["ninguna", "2m", "3m"] as Altura[]).map((a) => (
                        <option key={a} value={a}>{ALTURA_LABELS[a]}</option>
                      ))}
                    </select>
                  </div>
                  <FrecuenciaSelector
                    value={estado.setos.frecuencia}
                    onChange={(f) => update("setos", { frecuencia: f })}
                  />
                </div>
              </div>
            )}

            {/* PISCINA */}
            {seleccionados.includes("piscina") && (
              <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                  <span>💧</span>
                  <span className="text-sm font-semibold">Piscina</span>
                  <button type="button" onClick={() => toggle("piscina")} className="ml-auto text-xs text-neutral-400 hover:text-black transition">Quitar ×</button>
                </div>
                <div className="px-4 py-4 space-y-3">
                  {/* tipo */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Tipo de servicio</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([["mantenimiento", "Mantenimiento", "1,20 €/m²"], ["puesta-marcha", "Puesta en marcha / Cierre", "precio fijo"]] as [TipoPiscina, string, string][]).map(([val, label, precio]) => (
                        <button
                          key={val} type="button"
                          onClick={() => update("piscina", { tipo: val })}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-medium text-left transition-all ${
                            estado.piscina.tipo === val
                              ? "bg-black text-white border-black"
                              : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400"
                          }`}
                        >
                          <span className="block">{label}</span>
                          <span className={`text-[10px] ${estado.piscina.tipo === val ? "text-neutral-300" : "text-neutral-400"}`}>{precio}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {estado.piscina.tipo === "mantenimiento" ? (
                    <>
                      <MedidaInput
                        label="Superficie de lámina de agua (m²)"
                        placeholder="Ej: 32"
                        value={estado.piscina.medida}
                        onChange={(v) => update("piscina", { medida: v })}
                        error={errores["piscina"]}
                        hint="Largo × ancho · Mínimo: 55 €"
                      />
                      <FrecuenciaSelector
                        value={estado.piscina.frecuencia}
                        onChange={(f) => update("piscina", { frecuencia: f })}
                      />
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1.5">Tamaño de la piscina</label>
                      <select
                        value={estado.piscina.talla}
                        onChange={(e) => update("piscina", { talla: e.target.value as TallaPM })}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                      >
                        {(["pequena", "mediana", "grande"] as TallaPM[]).map((t) => (
                          <option key={t} value={t}>{TALLA_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DESBROCE */}
            {seleccionados.includes("desbroce") && (
              <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                  <span>🏗️</span>
                  <span className="text-sm font-semibold">Desbroce</span>
                  <button type="button" onClick={() => toggle("desbroce")} className="ml-auto text-xs text-neutral-400 hover:text-black transition">Quitar ×</button>
                </div>
                <div className="px-4 py-4 space-y-2">
                  <MedidaInput
                    label="Superficie del terreno (m²)"
                    placeholder="Ej: 350"
                    value={estado.desbroce.medida}
                    onChange={(v) => update("desbroce", { medida: v })}
                    error={errores["desbroce"]}
                    hint="≤ 500 m²: 0,55 €/m²  ·  501–2.000 m²: 0,35 €/m²"
                  />
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* error global */}
      {errorGlobal && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorGlobal}</div>
      )}

      {/* botón calcular */}
      <button
        type="button" onClick={calcular}
        disabled={!haySeleccionados || cargando}
        className="w-full bg-black text-white font-semibold py-3.5 rounded-xl mb-5 disabled:opacity-40 hover:bg-neutral-800 active:scale-[0.99] transition-all"
      >
        {cargando ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Calculando…
          </span>
        ) : haySeleccionados ? "Calcular precio orientativo" : "Selecciona al menos un servicio"}
      </button>

      {/* resultado */}
      {resultado && (
        <div id="resultado-calc" className="rounded-2xl border-2 border-black bg-white overflow-hidden mb-5 shadow-lg">
          {Object.keys(resultado.desglose).length > 1 && (
            <div className="px-5 py-4 border-b border-neutral-100">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Desglose</p>
              <div className="space-y-2">
                {Object.entries(resultado.desglose).map(([id, l]) => (
                  <div key={id} className="flex justify-between items-start text-sm">
                    <span className="text-neutral-700 flex-1 pr-4">
                      {l.nombre}
                      {l.nota && <span className="text-xs text-neutral-400 ml-1">({l.nota})</span>}
                    </span>
                    <span className="font-semibold tabular-nums shrink-0">{l.precio.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="px-5 py-4 bg-black text-white">
            {Object.keys(resultado.desglose).length === 1 && (() => {
              const [l] = Object.values(resultado.desglose);
              return l.nota ? <p className="text-xs text-neutral-400 mb-1">{l.nota}</p> : null;
            })()}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-400">Precio orientativo</p>
                <p className="text-3xl font-bold mt-0.5">{resultado.total.toFixed(2)} €</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">IVA incluido</p>
                <p className="text-xs text-neutral-400 mt-0.5">Sujeto a confirmación</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultado && (
        <a
          href={`/reservar?servicios=${seleccionados.join(",")}&precio=${resultado.total.toFixed(2)}`}
          className="flex items-center justify-center gap-2 w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-neutral-800 transition-all active:scale-[0.99] text-center"
        >
          Reservar visita técnica →
        </a>
      )}

      <p className="text-center text-xs text-neutral-400 mt-4">
        IVA incluido · Estimación orientativa sujeta a visita técnica
      </p>
    </div>
  );
}
