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

export default function PriceCalculator() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cantidad, setCantidad] = useState<Record<string, string>>({});
  const [municipio, setMunicipio] = useState(LOCATIONS[0]?.slug || "salamanca");
  const [precio, setPrecio] = useState<number | null>(null);
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
      } else {
        // API now returns { total }
        setPrecio(typeof data.total === "number" ? data.total : null);
      }
    } catch {
      setPrecio(null);
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
    const params = new URLSearchParams({
      servicios: selectedIds.join(","),
      municipio,
      precio: precio?.toString() || "",
    });
    return `/contacto?${params.toString()}`;
  }, [selectedIds, municipio, precio]);

  const renderField = (s: Servicio) => {
    // Servicios por m²
    if (s.id === "desbroce") {
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Superficie (m²)</label>
          <input
            type="number"
            placeholder="Ej: 300"
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400 focus:ring-red-300' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          />
          {fieldErrors[s.id] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors[s.id]}</p>
          )}
          <p className="text-xs text-neutral-500">
            Tarifas: hasta 250m²: 0.55€/m² | 251-500m²: 0.45€/m² | 501-1000m²: 0.30€/m²
          </p>
        </div>
      );
    }
    
    if (s.id.includes("setos")) {
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Metros lineales (ml)</label>
          <input
            type="number"
            placeholder="Ej: 45"
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400 focus:ring-red-300' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          />
          {fieldErrors[s.id] && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors[s.id]}</p>
          )}
          <p className="text-xs text-neutral-500">
            Base: {s.base.toFixed(2)}€/ml (≤30ml) | 31-60ml: ajuste | 60+ml: ajuste
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
      const estados = Object.keys(s.frecuencia);
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Estado de la piscina</label>
          <select
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          >
            <option value="">Selecciona</option>
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Servicios con tamanos (pequeña/mediana/grande, etc.)
    if (s.tamanos && Object.keys(s.tamanos).length > 0) {
      let opts = Object.keys(s.tamanos);
      const hasPequena = opts.some(o => o.startsWith('pequena'));
      const hasMediana = opts.some(o => o.startsWith('mediana') || o.startsWith('mediano'));
      const hasGrande = opts.some(o => o.startsWith('grande'));
      if (!hasPequena && (hasMediana || hasGrande)) {
        opts = ['pequena', ...opts];
      }

      // Rango estimado m² por tipo (puedes ajustar después)
      const piscinaRanges: Record<string,string> = {
        pequena: '≤25 m²',
        mediana: '26–40 m²',
        grande: '41+ m²'
      };
      const jardinRanges: Record<string,string> = {
        pequena: '≤150 m²',
        mediana: '151–400 m²',
        mediano: '151–400 m²',
        grande: '401+ m²'
      };

      const labelFor = (key: string): string => {
        // Combinados tipo piscina-jardin
        if (key.includes('-')) {
          const parts = key.split('-');
          if (parts.length === 2) {
            const [pisc, jard] = parts;
            const piscLabel = piscinaRanges[pisc] ? `${pisc === 'pequena' ? 'Pequeña' : capitalize(pisc)} (${piscinaRanges[pisc]})` : capitalize(pisc);
            const jardLabel = jardinRanges[jard] ? `${jard === 'pequena' ? 'Pequeña' : capitalize(jard)} (${jardinRanges[jard]})` : capitalize(jard);
            return `${piscLabel} piscina + ${jardLabel} jardín`;
          }
        }
        // Singular piscina/jardín
        if (piscinaRanges[key]) {
          return `${key === 'pequena' ? 'Pequeña' : capitalize(key)} (${piscinaRanges[key]})`;
        }
        if (jardinRanges[key]) {
          return `${key === 'pequena' ? 'Pequeña' : capitalize(key)} (${jardinRanges[key]})`;
        }
        return capitalize(key === 'pequena' ? 'pequeña' : key);
      };

      const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1).replace('mediano','Mediano').replace('mediana','Mediana');
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium">Tamaño / Opción</label>
          <select
            className={`w-full p-2 border rounded text-sm ${fieldErrors[s.id] ? 'border-red-400' : ''}`}
            value={cantidad[s.id] || ""}
            onChange={(e) =>
              setCantidad((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
          >
            <option value="">Selecciona</option>
            {opts.map((opt) => {
              const display = labelFor(opt);
              return (
                <option key={opt} value={opt}>{display}</option>
              );
            })}
          </select>
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
                <label
                  key={s.id}
                  className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleServicio(s.id)}
                    className="mt-1"
                  />
                  <span className="text-sm flex-1">{s.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedIds.map((id) => {
            const s = servicios.find((x) => x.id === id);
            if (!s) return null;

            return (
              <div key={id} className="mb-3 p-3 border rounded bg-gray-50">
                <p className="text-sm font-semibold mb-2">{s.nombre}</p>
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
            className="bg-green-600 text-white px-6 py-3 rounded w-full mb-4 disabled:opacity-50 font-semibold hover:bg-green-700 transition"
          >
            {loading ? "Calculando..." : "Calcular precio"}
          </button>

          {precio !== null && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded">
              <p className="text-xl font-bold text-green-800">
                Precio orientativo: {precio.toFixed(2)} €
              </p>
              <p className="text-xs text-neutral-600 mt-1">
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
