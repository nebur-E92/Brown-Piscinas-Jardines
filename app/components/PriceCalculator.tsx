"use client";

import { useEffect, useMemo, useState } from "react";
import { LOCATIONS } from "../../lib/seo";

type Servicio = {
  id: string;
  nombre: string;
  base: number;
  tamanos?: Record<string, number>;
  frecuencia?: Record<string, number>;
  municipios?: Record<string, number>;
};

// Información de lo que incluye cada servicio
const SERVICE_INFO: Record<string, string> = {
  "mantenimiento-piscina-mensual": "Incluye: Control químico (pH, cloro), limpieza de superficie, limpieza de fondos, revisión de filtros, revisión de sistema de filtrado y depuradora, retirada de residuos.",
  "mantenimiento-jardin-mensual": "Incluye: Corte de césped, recorte de setos, eliminación de malas hierbas, abonado según temporada, limpieza de hojas y restos vegetales, revisión de sistema de riego.",
  "mantenimiento-combinado-mensual": "Incluye TODO lo del mantenimiento de piscina + TODO lo del mantenimiento de jardín. Ahorro al contratar ambos servicios juntos.",
  "servicio-puntual-jardin": "Servicio único sin compromiso. Incluye: Corte de césped, recorte básico de setos, limpieza de hojas y restos vegetales.",
  "servicio-puntual-piscina": "Servicio único sin compromiso. Incluye: Limpieza completa de superficie y fondos, ajuste químico del agua (pH, cloro), revisión básica del sistema de filtrado.",
  "servicio-puntual-combinado": "Servicio único sin compromiso que incluye limpieza puntual de piscina + jardín (todo lo anterior combinado).",
  "desbroce": "Limpieza de terrenos con vegetación salvaje, maleza alta, zarzas. Incluye corte con desbrozadora, retirada opcional de restos (consultar).",
  "setos-hoja-pequena": "Recorte de setos ornamentales de hoja pequeña (aligustre, boj, mirto). Incluye: Recorte con forma, limpieza de restos cortados.",
  "setos-coniferas": "Recorte de setos de coníferas (ciprés, tuya, tejo). Incluye: Recorte con forma, limpieza de restos cortados.",
  "limpieza-piscina-estado": "Limpieza puntual según el estado del agua. Vacía (sin agua), Sucia (agua turbia/hojas), Muy sucia (agua verde/abandonada). Incluye productos químicos necesarios.",
  "limpieza-baldosas": "Limpieza a presión de baldosas, terrazas, porches exteriores. Elimina suciedad, musgo, verdín.",
  "desplazamiento": "Coste adicional para servicios fuera de Salamanca capital (más de 10 km). Se calcula por km adicional."
};

export default function PriceCalculator() {
  const [infoVisible, setInfoVisible] = useState<string | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cantidad, setCantidad] = useState<Record<string, string>>({});
  const [municipio, setMunicipio] = useState(LOCATIONS[0]?.slug || "salamanca");
  const [precio, setPrecio] = useState<number | null>(null);
  const [desglose, setDesglose] = useState<Record<string, { nombre: string; precio: number }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/calcular/servicios")
      .then((r) => r.json())
      .then((data) => setServicios(data.servicios || []))
      .catch(() => {});
  }, []);

  // Preselección desde query string, ej: ?servicio=setos o ?servicios=setos
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramServicio = (params.get("servicio") || params.get("servicios") || "").toLowerCase();
    if (!paramServicio) return;
    if (servicios.length === 0) return;
    // Si servicio=setos, selecciona todos los que incluyan "setos"
    const matched = servicios
      .filter((s) => {
        if (paramServicio === "setos") return s.id.includes("setos");
        return s.id === paramServicio;
      })
      .map((s) => s.id);
    if (matched.length > 0) {
      setSelectedIds((prev) => (prev.length ? prev : matched));
    }
  }, [servicios]);

  const toggleServicio = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const calcular = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setFieldErrors({});
    setGeneralErrors([]);
    try {
      const items = selectedIds.map((id) => ({
        id,
        cantidad: cantidad[id] || "",
      }));
      const res = await fetch("/api/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicios: items, municipio }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (Array.isArray(data?.detalles)) {
          const fErrors: Record<string, string> = {};
          const gErrors: string[] = [];
          data.detalles.forEach((code: string) => {
            const mapped = mapError(code);
            if (mapped.field && mapped.field !== "municipio") {
              fErrors[mapped.field] = mapped.message;
            } else {
              gErrors.push(mapped.message);
            }
          });
          setFieldErrors(fErrors);
          setGeneralErrors(gErrors);
        } else {
          setGeneralErrors(["No hemos podido calcular el precio. Vuelve a intentarlo o revisa los datos."]); 
        }
        setPrecio(null);
        setDesglose(null);
      } else {
        // API now returns { total, desglose }
        setPrecio(typeof data.total === "number" ? data.total : null);
        setDesglose(data.desglose || null);
      }
    } catch {
      setPrecio(null);
      setDesglose(null);
      setGeneralErrors(["Ha ocurrido un problema de conexión. Inténtalo de nuevo en unos segundos."]); 
    } finally {
      setLoading(false);
    }
  };

  const mapError = (code: string): { field?: string; message: string } => {
    if (code === "municipio_invalido") return { message: "Municipio no válido. Revisa la zona seleccionada.", field: "municipio" };
    const parts = code.split("_");
    const type = parts.slice(0, parts.length - 1).join("_");
    const field = parts[parts.length - 1];
    switch (type) {
      case "valor_excede_max":
        return { field, message: "El valor supera el máximo permitido. Revisa el tamaño introducido." };
      case "valor_negativo":
        return { field, message: "El valor no puede ser negativo. Revisa el tamaño introducido." };
      case "valor_no_numerico":
        return { field, message: "Introduce un número válido en el tamaño." };
      default:
        return { field, message: "Revisa el tamaño introducido." };
    }
  };

  const hrefForm = useMemo(() => {
    const params = new URLSearchParams();
    
    // Servicios seleccionados
    params.set("servicios", selectedIds.join(","));
    params.set("municipio", municipio);
    if (precio) params.set("precio", precio.toFixed(2));
    
    // Añadir detalles de cada servicio (tamaño/cantidad/frecuencia)
    selectedIds.forEach((id) => {
      const servicio = servicios.find(s => s.id === id);
      if (!servicio) return;
      
      const val = cantidad[id];
      if (!val) return;
      
      // Determinar el tipo de campo según el servicio
      if (servicio.id === "desbroce" || servicio.id === "limpieza-baldosas") {
        params.set(`${id}_m2`, val);
      } else if (servicio.id.includes("setos")) {
        params.set(`${id}_ml`, val);
      } else if (servicio.tamanos && Object.keys(servicio.tamanos).length > 0) {
        params.set(`${id}_tamano`, val);
      } else if (servicio.frecuencia && Object.keys(servicio.frecuencia).length > 0) {
        params.set(`${id}_frecuencia`, val);
      }
    });
    
    return `/contacto?${params.toString()}`;
  }, [selectedIds, municipio, precio, cantidad, servicios]);

  const renderField = (s: Servicio) => {
    // Servicios por m²
    if (s.id === "desbroce") {
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Superficie del terreno (m²)</label>
          <input
            type="number"
            placeholder="Ejemplo: 300"
            min="1"
            step="1"
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400 focus:ring-red-300' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          />
          {fieldErrors[s.id] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors[s.id]}</p>
          )}
          <p className="text-xs text-neutral-600 mt-1 bg-gray-50 p-2 rounded border border-gray-200">
            💰 <strong>Tarifas por tramos:</strong><br/>
            • Hasta 250 m²: <strong>0,55 €/m²</strong><br/>
            • 251-500 m²: <strong>0,45 €/m²</strong><br/>
            • 501-1000 m²: <strong>0,30 €/m²</strong><br/>
            • Más de 1000 m²: <strong>Consultar</strong>
          </p>
        </div>
      );
    }
    
    if (s.id.includes("setos")) {
      const precioBase = s.base.toFixed(2);
      const precioMedio = s.tamanos?.["31-60"] ? (s.base + s.tamanos["31-60"]).toFixed(2) : precioBase;
      const precioGrande = s.tamanos?.["60+"] ? (s.base + s.tamanos["60+"]).toFixed(2) : precioBase;
      
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Metros lineales (ml) de seto</label>
          <input
            type="number"
            placeholder="Ejemplo: 45"
            min="1"
            step="0.5"
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400 focus:ring-red-300' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          />
          {fieldErrors[s.id] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors[s.id]}</p>
          )}
          <p className="text-xs text-neutral-600 mt-1 bg-gray-50 p-2 rounded border border-gray-200">
            💰 <strong>Tarifas por tramos:</strong><br/>
            • Hasta 30 ml: <strong>{precioBase} €/ml</strong><br/>
            • 31-60 ml: <strong>{precioMedio} €/ml</strong><br/>
            • Más de 60 ml: <strong>{precioGrande} €/ml</strong>
          </p>
        </div>
      );
    }

    if (s.id === "limpieza-baldosas") {
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Superficie (m²)</label>
          <input
            type="number"
            placeholder="Ej: 50"
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400 focus:ring-red-300' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          />
          {fieldErrors[s.id] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors[s.id]}</p>
          )}
          <p className="text-xs text-neutral-500">Tarifa: {s.base.toFixed(2)}€/m²</p>
        </div>
      );
    }

    // Eliminado servicio desplazamiento

    // Limpieza por estado
    if (s.id === "limpieza-piscina-estado" && s.frecuencia) {
      const estadosLabels: Record<string, string> = {
        "vacía": "Vacía (sin agua)",
        "sucia": "Sucia (agua turbia, hojas)",
        "muy-sucia": "Muy sucia (agua verde, abandonada)"
      };
      
      const estados = Object.keys(s.frecuencia);
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Estado actual de la piscina</label>
          <select
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          >
            <option value="">-- Selecciona el estado --</option>
            {estados.map((e) => (
              <option key={e} value={e}>
                {estadosLabels[e] || e}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Servicios con tamanos (pequeña/mediana/grande para piscinas y jardines)
    if (s.tamanos && Object.keys(s.tamanos).length > 0) {
      let opts = Object.keys(s.tamanos);
      const hasPequena = opts.some(o => o.startsWith('pequena'));
      const hasMediana = opts.some(o => o.startsWith('mediana') || o.startsWith('mediano'));
      const hasGrande = opts.some(o => o.startsWith('grande'));
      if (!hasPequena && (hasMediana || hasGrande)) {
        opts = ['pequena', ...opts];
      }

      // Tamaños reales para piscinas (superficie de agua)
      const piscinaRanges: Record<string,string> = {
        pequena: 'hasta 25 m²',
        mediana: '26-40 m²',
        grande: 'más de 40 m²'
      };
      
      // Tamaños reales para jardines (superficie total)
      const jardinRanges: Record<string,string> = {
        pequena: 'hasta 150 m²',
        mediana: '151-400 m²',
        mediano: '151-400 m²',
        grande: 'más de 400 m²'
      };

      const labelFor = (key: string): string => {
        // Servicios combinados piscina-jardín
        if (key.includes('-')) {
          const parts = key.split('-');
          if (parts.length === 2) {
            const [pisc, jard] = parts;
            const piscLabel = piscinaRanges[pisc] ? `Piscina ${piscinaRanges[pisc]}` : capitalize(pisc);
            const jardLabel = jardinRanges[jard] ? `Jardín ${jardinRanges[jard]}` : capitalize(jard);
            return `${piscLabel} + ${jardLabel}`;
          }
        }
        // Solo piscina
        if (piscinaRanges[key]) {
          return `Piscina ${piscinaRanges[key]}`;
        }
        // Solo jardín  
        if (jardinRanges[key]) {
          return `Jardín ${jardinRanges[key]}`;
        }
        return capitalize(key);
      };

      const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1).replace('mediano','Mediano').replace('mediana','Mediana');
      
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Selecciona el tamaño</label>
          <select
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          >
            <option value="">-- Selecciona un tamaño --</option>
            {opts.map((opt) => {
              const display = labelFor(opt);
              return (
                <option key={opt} value={opt}>{display}</option>
              );
            })}
          </select>
          <p className="text-xs text-neutral-500 mt-1">
            💡 Mide tu piscina/jardín para seleccionar el tamaño correcto
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="page-title mb-4">Calcular precio orientativo</h1>
      {generalErrors.length > 0 && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <ul className="list-disc list-inside space-y-1">
            {generalErrors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
      
      {servicios.length === 0 && (
        <p className="text-sm text-neutral-600 mb-4">
          Cargando servicios disponibles...
        </p>
      )}

      {servicios.length > 0 && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Selecciona uno o varios servicios:
            </label>
            <div className="space-y-1 max-h-72 overflow-y-auto border rounded p-3">
              {servicios.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleServicio(s.id)}
                    className="mt-1 cursor-pointer"
                    id={`service-${s.id}`}
                  />
                  <label htmlFor={`service-${s.id}`} className="text-sm flex-1 cursor-pointer">{s.nombre}</label>
                  <button
                    type="button"
                    onClick={() => setInfoVisible(infoVisible === s.id ? null : s.id)}
                    className="text-gray-600 hover:text-black font-bold text-lg leading-none"
                    title="Ver qué incluye"
                  >
                    ℹ️
                  </button>
                  {infoVisible === s.id && SERVICE_INFO[s.id] && (
                    <div className="absolute z-10 mt-8 ml-4 w-72 sm:w-80 max-w-[calc(100vw-2rem)] p-3 bg-white border-2 border-gray-300 rounded-lg shadow-lg text-xs text-gray-700">
                      <button
                        type="button"
                        onClick={() => setInfoVisible(null)}
                        className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 font-bold"
                      >
                        ✕
                      </button>
                      <p className="pr-4">{SERVICE_INFO[s.id]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedIds.map((id) => {
            const s = servicios.find((x) => x.id === id);
            if (!s) return null;

            return (
              <div key={id} className="mb-3 p-3 border rounded bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold">{s.nombre}</p>
                  <button
                    type="button"
                    onClick={() => setInfoVisible(infoVisible === s.id ? null : s.id)}
                    className="bg-black text-white hover:bg-gray-800 text-xs px-3 py-1 rounded"
                    title="Ver qué incluye"
                  >
                    ¿Qué incluye?
                  </button>
                </div>
                {infoVisible === s.id && SERVICE_INFO[s.id] && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                    <p>{SERVICE_INFO[s.id]}</p>
                  </div>
                )}
                {renderField(s)}
              </div>
            );
          })}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Municipio</label>
            <select
              className={`w-full p-2 border rounded ${generalErrors.length && generalErrors.some(e => e.toLowerCase().includes("municipio")) ? "border-red-400" : ""}`}
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
            >
              {LOCATIONS.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </select>
            {generalErrors.length && generalErrors.some(e => e.toLowerCase().includes("municipio")) ? (
              <p className="mt-1 text-xs text-red-600">Municipio no válido. Revisa la zona seleccionada.</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={calcular}
            disabled={selectedIds.length === 0 || loading}
            className="bg-black text-white px-6 py-3 rounded w-full mb-4 disabled:opacity-50 font-semibold hover:bg-gray-800 transition"
          >
            {loading ? "Calculando..." : "Calcular precio"}
          </button>

          {precio !== null && (
            <div className="mb-4 p-4 bg-gray-50 border-2 border-gray-300 rounded">
              {desglose && Object.keys(desglose).length > 1 && (
                <div className="mb-4 pb-4 border-b-2 border-gray-400">
                  <p className="text-sm font-semibold text-black mb-3">💰 Desglose por servicio:</p>
                  <div className="space-y-2">
                    {Object.entries(desglose).map(([id, item]: [string, any]) => (
                      <div key={id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.nombre}</span>
                        <span className="font-semibold text-black">{item.precio.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-black">
                  {desglose && Object.keys(desglose).length > 1 ? 'Total:' : 'Precio orientativo:'}
                </p>
                <p className="text-2xl font-bold text-black">
                  {precio.toFixed(2)} €
                </p>
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Estimación basada en tarifas reales. Sujeto a confirmación tras visita técnica.
              </p>
            </div>
          )}

          <a
            href={hrefForm}
            className="bg-black text-white px-6 py-3 rounded w-full inline-block text-center font-semibold hover:bg-neutral-800 transition"
          >
            Solicitar visita técnica
          </a>
        </>
      )}
    </div>
  );
}

// no extra helper at bottom
