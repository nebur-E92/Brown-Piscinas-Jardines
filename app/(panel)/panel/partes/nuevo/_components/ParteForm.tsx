"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiClock, FiCheck, FiWifiOff, FiLoader } from "react-icons/fi";
import Link from "next/link";
import { normalizeJsonArray, PARAMETROS_AGUA } from "../../../../../../lib/panel/partes";

type Propiedad = {
  id: string;
  tipo: string;
  direccion: string | null;
  ref_servicio: string | null;
  tipo_cliente: string | null;
  contexto_equipo: string | null;
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
};

type CatalogoItem = { id: string; ambito: "piscina" | "jardin"; nombre: string; orden: number };

type Medicion = { codigo: string; valor: number | null; opcion: string | null; obs: string | null };
type Actuacion = { nombre: string; ambito: string; estado: "si" | "no" | "na"; detalle: string | null };
type DraftPayload = {
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  mediciones: Medicion[];
  actuaciones: Actuacion[];
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
};

const INPUT = "w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black";
const emptyMediciones = (): Medicion[] =>
  PARAMETROS_AGUA.map((p) => ({ codigo: p.codigo, valor: null, opcion: null, obs: null }));

function mergeMediciones(guardadas: Medicion[]): Medicion[] {
  const porCodigo = new Map(guardadas.map((medicion) => [medicion.codigo, medicion]));
  const codigosActuales = new Set(PARAMETROS_AGUA.map((parametro) => parametro.codigo));
  return [
    ...PARAMETROS_AGUA.map((parametro) => porCodigo.get(parametro.codigo) ?? {
      codigo: parametro.codigo,
      valor: null,
      opcion: null,
      obs: null,
    }),
    ...guardadas.filter((medicion) => !codigosActuales.has(medicion.codigo as typeof PARAMETROS_AGUA[number]["codigo"])),
  ];
}

function toTimeValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toVisitDateTime(fecha: string, hora: string): string | null {
  if (!fecha || !hora) return null;
  const date = new Date(`${fecha}T${hora}:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function ParteForm({
  propiedad,
  catalogo,
  visitaId,
  existingParteId,
  copyFromParteId,
  initialDate,
}: {
  propiedad: Propiedad;
  catalogo: CatalogoItem[];
  visitaId: string | null;
  existingParteId: string | null;
  copyFromParteId: string | null;
  initialDate: string;
}) {
  const router = useRouter();
  const [parteId, setParteId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos del formulario
  const [fecha, setFecha] = useState(initialDate);
  const [horaEntrada, setHoraEntrada] = useState<string | null>(null);
  const [horaSalida, setHoraSalida] = useState<string | null>(null);
  const [mediciones, setMediciones] = useState<Medicion[]>(emptyMediciones);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>([]);
  const [estadoAgua, setEstadoAgua] = useState<string | null>(null);
  const [estadoLiner, setEstadoLiner] = useState<string | null>(null);
  const [estadoEquipos, setEstadoEquipos] = useState<string | null>(null);
  const [estadoJardin, setEstadoJardin] = useState<string | null>(null);
  const [cierrePreventivo, setCierrePreventivo] = useState(false);
  const [cierreMotivo, setCierreMotivo] = useState("");
  const [incidencias, setIncidencias] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [stockTitular, setStockTitular] = useState("");
  const [restosVegetales, setRestosVegetales] = useState<string | null>(null);

  // Autosave
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "offline" | "idle">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [online, setOnline] = useState(true);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const pendingLocalRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const initStartedRef = useRef(false);
  const formStateRef = useRef<DraftPayload | null>(null);

  const incluyePiscina = propiedad.tipo === "piscina" || propiedad.tipo === "combinado";
  const incluyeJardin = propiedad.tipo === "jardin" || propiedad.tipo === "combinado";

  // Función para cargar datos de una versión borrador en el formulario
  function loadVersion(ver: {
    fecha?: string | null;
    hora_entrada?: string | null;
    hora_salida?: string | null;
    mediciones?: unknown;
    actuaciones?: unknown;
    estado_agua?: string | null;
    estado_liner?: string | null;
    estado_equipos?: string | null;
    estado_jardin?: string | null;
    cierre_preventivo?: boolean;
    cierre_motivo?: string | null;
    incidencias?: string | null;
    recomendaciones?: string | null;
    stock_titular?: string | null;
    restos_vegetales?: string | null;
  }) {
    setFecha(ver.fecha ? ver.fecha.split("T")[0] : initialDate);
    setHoraEntrada(ver.hora_entrada ?? null);
    setHoraSalida(ver.hora_salida ?? null);
    const medicionesCargadas = normalizeJsonArray<Medicion>(ver.mediciones);
    const actuacionesCargadas = normalizeJsonArray<Actuacion>(ver.actuaciones);
    setMediciones(mergeMediciones(medicionesCargadas));
    const guardadasPorNombre = new Map(actuacionesCargadas.map((actuacion) => [`${actuacion.ambito}:${actuacion.nombre}`, actuacion]));
    const catalogoActual = new Set(catalogo.map((item) => `${item.ambito}:${item.nombre}`));
    setActuaciones([
      ...catalogo.map((item) => guardadasPorNombre.get(`${item.ambito}:${item.nombre}`) ?? {
        nombre: item.nombre,
        ambito: item.ambito,
        estado: "no" as const,
        detalle: null,
      }),
      ...actuacionesCargadas.filter((actuacion) => !catalogoActual.has(`${actuacion.ambito}:${actuacion.nombre}`)),
    ]);
    setEstadoAgua(ver.estado_agua ?? null);
    setEstadoLiner(ver.estado_liner ?? null);
    setEstadoEquipos(ver.estado_equipos ?? null);
    setEstadoJardin(ver.estado_jardin ?? null);
    setCierrePreventivo(Boolean(ver.cierre_preventivo));
    setCierreMotivo(ver.cierre_motivo ?? "");
    setIncidencias(ver.incidencias ?? "");
    setRecomendaciones(ver.recomendaciones ?? "");
    setStockTitular(ver.stock_titular ?? "");
    setRestosVegetales(ver.restos_vegetales ?? null);
  }

  function checkLocalBackup(id: string, serverUpdatedAt?: string | null) {
    const key = `parte-borrador-${id}`;
    const saved = localStorage.getItem(key);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const localTime = Date.parse(parsed.updated_at ?? "");
      const serverTime = Date.parse(serverUpdatedAt ?? "");
      if (parsed.fecha && (!Number.isFinite(serverTime) || localTime > serverTime)) {
        pendingLocalRef.current = key;
        setShowRestoreBanner(true);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }

  // Crear parte o cargar borrador existente al montar
  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    async function init() {
      setCreating(true);
      try {
        if (existingParteId) {
          // Cargar borrador existente
          const detRes = await fetch(`/api/panel/partes/${existingParteId}`);
          if (detRes.ok) {
            const det = await detRes.json();
            if (det.propiedad_id !== propiedad.id) {
              setError("El parte no pertenece a esta instalación.");
              return;
            }
            const ver = det.versiones?.find((v: { estado: string }) => v.estado === "borrador");
            if (!ver) {
              setError("Este parte ya no tiene un borrador editable.");
              return;
            }
            loadVersion(ver);
            setParteId(existingParteId);
            checkLocalBackup(existingParteId, ver.updated_at);
            initializedRef.current = true;
          } else {
            setError("No se pudo cargar el borrador.");
          }
        } else {
          // Crear nuevo parte
          const res = await fetch("/api/panel/partes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ propiedad_id: propiedad.id, visita_id: visitaId, copiar_de: copyFromParteId, fecha }),
          });
          if (!res.ok) {
            const d = await res.json();
            setError(d.error ?? "Error al crear parte.");
            return;
          }
          const data = await res.json();
          setParteId(data.parte_id);

          // Cargar borrador con datos precargados
          const detRes = await fetch(`/api/panel/partes/${data.parte_id}`);
          if (detRes.ok) {
            const det = await detRes.json();
            const ver = det.versiones?.[0];
            if (ver) {
              loadVersion(ver);
              checkLocalBackup(data.parte_id, ver.updated_at);
              initializedRef.current = true;
            } else {
              setError("No se pudo cargar el borrador recién creado.");
            }
          } else {
            setError("No se pudo cargar el borrador recién creado.");
          }
        }
      } catch {
        setError("Error de conexión.");
      } finally {
        setCreating(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Online/offline
  useEffect(() => {
    const onOn = () => { setOnline(true); };
    const onOff = () => setOnline(false);
    window.addEventListener("online", onOn);
    window.addEventListener("offline", onOff);
    setOnline(navigator.onLine);
    return () => { window.removeEventListener("online", onOn); window.removeEventListener("offline", onOff); };
  }, []);

  useEffect(() => {
    if (!online) setSaveStatus("offline");
    else if (saveStatus === "offline") {
      // Came back online — trigger save of pending state
      setSaveStatus("saving");
    }
  }, [online, saveStatus]);

  function restoreFromLocal() {
    if (!pendingLocalRef.current) return;
    try {
      const parsed = JSON.parse(localStorage.getItem(pendingLocalRef.current) ?? "{}");
      loadVersion(parsed);
      setShowRestoreBanner(false);
      setSaveStatus("saving");
    } catch { /* ignore */ }
  }

  function dismissRestore() {
    setShowRestoreBanner(false);
    if (pendingLocalRef.current) localStorage.removeItem(pendingLocalRef.current);
    pendingLocalRef.current = null;
  }

  formStateRef.current = {
    fecha,
    hora_entrada: horaEntrada,
    hora_salida: horaSalida,
    mediciones,
    actuaciones,
    estado_agua: estadoAgua,
    estado_liner: estadoLiner,
    estado_equipos: estadoEquipos,
    estado_jardin: estadoJardin,
    cierre_preventivo: cierrePreventivo,
    cierre_motivo: cierreMotivo || null,
    incidencias: incidencias || null,
    recomendaciones: recomendaciones || null,
    stock_titular: stockTitular || null,
    restos_vegetales: restosVegetales,
  };

  // El backup local es inmediato; la sincronización remota puede esperar al debounce.
  useEffect(() => {
    if (!parteId || !initializedRef.current || !["saving", "offline"].includes(saveStatus)) return;
    const payload = formStateRef.current;
    if (!payload) return;
    localStorage.setItem(
      `parte-borrador-${parteId}`,
      JSON.stringify({ ...payload, updated_at: new Date().toISOString() })
    );
  }, [parteId, saveStatus, fecha, horaEntrada, horaSalida, mediciones, actuaciones, estadoAgua, estadoLiner, estadoEquipos, estadoJardin, cierrePreventivo, cierreMotivo, incidencias, recomendaciones, stockTitular, restosVegetales]);

  // Autosave function
  const doSave = useCallback(async (): Promise<boolean> => {
    if (!parteId) return false;
    const payload = formStateRef.current;
    if (!payload) return false;

    const key = `parte-borrador-${parteId}`;
    const serializedPayload = JSON.stringify(payload);
    localStorage.setItem(key, JSON.stringify({ ...payload, updated_at: new Date().toISOString() }));

    if (!online) {
      setSaveStatus("offline");
      return false;
    }

    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/panel/partes/${parteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: serializedPayload,
      });

      if (res.ok) {
        const unchanged = JSON.stringify(formStateRef.current) === serializedPayload;
        if (unchanged) {
          localStorage.removeItem(key);
          setSaveStatus("saved");
        } else {
          setSaveStatus("saving");
        }
        return unchanged;
      }

      if (res.status === 409) {
        localStorage.removeItem(key);
        setError("Este parte ya no tiene borrador activo.");
        router.push(`/panel/partes/${parteId}`);
        return false;
      }

      setError("No se pudo guardar el borrador.");
      return false;
    } catch {
      setSaveStatus("offline");
      return false;
    }
  }, [parteId, online, router]);

  // Debounce 2s
  useEffect(() => {
    if (!parteId || saveStatus !== "saving") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [fecha, horaEntrada, horaSalida, mediciones, actuaciones, estadoAgua, estadoLiner, estadoEquipos, estadoJardin, cierrePreventivo, cierreMotivo, incidencias, recomendaciones, stockTitular, restosVegetales, parteId, doSave, saveStatus]);

  // Capturar hora
  function capturarHora(tipo: "entrada" | "salida") {
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const value = toVisitDateTime(fecha, hora);
    if (tipo === "entrada") setHoraEntrada(value);
    else setHoraSalida(value);
    setSaveStatus("saving");
  }

  function actualizarFecha(value: string) {
    setFecha(value);
    setHoraEntrada((actual) => toVisitDateTime(value, toTimeValue(actual)));
    setHoraSalida((actual) => toVisitDateTime(value, toTimeValue(actual)));
    setSaveStatus("saving");
  }

  function actualizarHora(tipo: "entrada" | "salida", value: string) {
    const nuevaHora = toVisitDateTime(fecha, value);
    if (tipo === "entrada") setHoraEntrada(nuevaHora);
    else setHoraSalida(nuevaHora);
    setSaveStatus("saving");
  }

  // Finalizar
  async function handleFinalizar() {
    if (!parteId) return;
    if (!(await doSave())) return;
    const res = await fetch(`/api/panel/partes/${parteId}/finalizar`, { method: "POST" });
    if (res.ok) {
      localStorage.removeItem(`parte-borrador-${parteId}`);
      router.push(`/panel/partes/${parteId}`);
    } else {
      const d = await res.json();
      setError(d.error ?? "Error al finalizar.");
    }
  }

  // Actualizar medición
  function updateMedicion(codigo: string, field: keyof Medicion, value: string | number | null) {
    setMediciones((prev) => prev.map((m) => m.codigo === codigo ? { ...m, [field]: value } : m));
    setSaveStatus("saving");
  }

  // Actualizar actuación por identidad estable (evita problemas de índice con filtrado)
  function toggleActuacion(ambito: string, nombre: string) {
    setActuaciones((prev) => prev.map((a) => {
      if (a.ambito !== ambito || a.nombre !== nombre) return a;
      const estados: Array<"si" | "no" | "na"> = ["no", "si", "na"];
      const cur = estados.indexOf(a.estado);
      return { ...a, estado: estados[(cur + 1) % 3] };
    }));
    setSaveStatus("saving");
  }

  function updateActuacionDetalle(ambito: string, nombre: string, detalle: string) {
    setActuaciones((prev) => prev.map((a) =>
      a.ambito === ambito && a.nombre === nombre ? { ...a, detalle: detalle || null } : a
    ));
    setSaveStatus("saving");
  }

  if (creating) {
    return <div className="flex items-center gap-2 p-8 text-sm text-neutral-500"><FiLoader className="animate-spin" /> Creando parte…</div>;
  }

  if (error && !parteId) {
    return <div className="p-8"><p className="text-sm text-red-600">{error}</p></div>;
  }

  const actPiscina = actuaciones.filter((a) => a.ambito === "piscina");
  const actJardin = actuaciones.filter((a) => a.ambito === "jardin");

  return (
    <div className="pb-24">
      <Link href={`/panel/clientes`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-4">
        <FiArrowLeft size={14} /> Volver
      </Link>

      <h1 className="text-xl font-bold mb-1">
        {existingParteId ? "Editar parte de visita" : copyFromParteId ? "Nuevo parte desde copia" : "Nuevo parte de visita"}
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        {propiedad.direccion ?? "Sin dirección"} {propiedad.ref_servicio && <span className="font-mono">· {propiedad.ref_servicio}</span>}
      </p>

      {error && <p className="text-xs text-red-600 mb-4 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

      {copyFromParteId && !existingParteId && (
        <p className="text-xs text-blue-700 mb-4 bg-blue-50 border border-blue-200 rounded p-2">
          Se han copiado los datos del parte anterior. La fecha es de hoy y las horas están vacías.
        </p>
      )}

      {showRestoreBanner && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between text-xs">
          <span className="text-yellow-800">Hay datos sin guardar de una sesión anterior.</span>
          <div className="flex gap-2">
            <button onClick={restoreFromLocal} className="bg-yellow-600 text-white px-3 py-1 rounded font-medium">Restaurar</button>
            <button onClick={dismissRestore} className="text-yellow-600 hover:text-yellow-800">Descartar</button>
          </div>
        </div>
      )}

      {/* Sección 1: Datos + hora */}
      <Section title="Datos de la visita">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => actualizarFecha(e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Cliente</label>
              <p className="text-sm py-2">{propiedad.cliente_nombre}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TimeField label="Hora de entrada" value={toTimeValue(horaEntrada)} onChange={(value) => actualizarHora("entrada", value)} onNow={() => capturarHora("entrada")} />
            <TimeField label="Hora de salida" value={toTimeValue(horaSalida)} onChange={(value) => actualizarHora("salida", value)} onNow={() => capturarHora("salida")} />
          </div>
        </div>
      </Section>

      {/* Sección 2: Parámetros del agua */}
      {incluyePiscina && (
        <Section title="Parámetros del agua">
          <div className="space-y-3">
            {mediciones.map((m) => {
              const param = PARAMETROS_AGUA.find((p) => p.codigo === m.codigo);
              if (!param) return null;

              if (m.codigo === "turbidez") {
                return (
                  <div key={m.codigo}>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">{param.label}</label>
                    <select value={m.opcion ?? ""} onChange={(e) => updateMedicion(m.codigo, "opcion", e.target.value || null)} className={INPUT}>
                      <option value="">— Sin registrar —</option>
                      <option value="clara">Clara</option>
                      <option value="ligeramente_turbia">Ligeramente turbia</option>
                      <option value="turbia">Turbia</option>
                    </select>
                  </div>
                );
              }

              if (m.codigo === "cianurico") {
                return (
                  <div key={m.codigo}>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">{param.label}</label>
                    <div className="flex gap-2">
                      <select value={m.opcion ?? ""} onChange={(e) => updateMedicion(m.codigo, "opcion", e.target.value || null)} className={INPUT + " w-1/2"}>
                        <option value="">— —</option>
                        <option value="medido">Medido</option>
                        <option value="no_medido">No medido</option>
                      </select>
                      {m.opcion === "medido" && (
                        <input type="number" step="0.1" placeholder="mg/l" value={m.valor ?? ""} onChange={(e) => updateMedicion(m.codigo, "valor", e.target.value ? parseFloat(e.target.value) : null)} className={INPUT + " w-1/2"} />
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.codigo}>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    {param.label}
                    {param.min != null && param.max != null && (
                      <span className="text-neutral-400 font-normal"> ({param.min}–{param.max})</span>
                    )}
                  </label>
                  <input type="number" step={m.codigo === "salinidad" ? "1" : "0.1"} value={m.valor ?? ""} onChange={(e) => updateMedicion(m.codigo, "valor", e.target.value ? parseFloat(e.target.value) : null)} className={INPUT} />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Sección 3: Actuaciones piscina */}
      {incluyePiscina && (
        <Section title="Actuaciones piscina">
          <ActuacionesList
            items={actPiscina}
            onToggle={toggleActuacion}
            onDetalle={updateActuacionDetalle}
          />
        </Section>
      )}

      {/* Sección 4: Actuaciones jardín */}
      {incluyeJardin && (
        <Section title="Actuaciones jardín">
          <ActuacionesList
            items={actJardin}
            onToggle={toggleActuacion}
            onDetalle={updateActuacionDetalle}
          />
          <div className="mt-3">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Restos vegetales</label>
            <select value={restosVegetales ?? ""} onChange={(e) => { setRestosVegetales(e.target.value || null); setSaveStatus("saving"); }} className={INPUT}>
              <option value="">— Sin registrar —</option>
              <option value="hasta_150l">≤ 150 L</option>
              <option value="mas_150l">&gt; 150 L (+60 €)</option>
            </select>
          </div>
        </Section>
      )}

      {/* Sección 5: Estado general */}
      <Section title="Estado general">
        <div className="space-y-3">
          {incluyePiscina && (
            <>
              <SelectField label="Agua" value={estadoAgua} onChange={(v) => { setEstadoAgua(v); setSaveStatus("saving"); }} options={[["optimo", "Óptimo"], ["aceptable", "Aceptable"], ["deficiente", "Deficiente"], ["critico", "Crítico"]]} />
              <SelectField label="Liner" value={estadoLiner} onChange={(v) => { setEstadoLiner(v); setSaveStatus("saving"); }} options={[["sin_incidencias", "Sin incidencias"], ["con_incidencias", "Con incidencias"]]} />
              <SelectField label="Equipos" value={estadoEquipos} onChange={(v) => { setEstadoEquipos(v); setSaveStatus("saving"); }} options={[["correcto", "Correcto"], ["averia", "Avería"], ["comunicada", "Comunicada"]]} />
            </>
          )}
          {incluyeJardin && (
            <SelectField label="Jardín" value={estadoJardin} onChange={(v) => { setEstadoJardin(v); setSaveStatus("saving"); }} options={[["optimo", "Óptimo"], ["aceptable", "Aceptable"], ["deficiente", "Deficiente"]]} />
          )}

          <div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={cierrePreventivo} onChange={(e) => { setCierrePreventivo(e.target.checked); setSaveStatus("saving"); }} className="rounded" />
              Cierre preventivo
            </label>
            {cierrePreventivo && (
              <div className="mt-2">
                <textarea rows={2} value={cierreMotivo} onChange={(e) => { setCierreMotivo(e.target.value); setSaveStatus("saving"); }} placeholder="Motivo del cierre" className={INPUT} maxLength={500} />
                <CharCount value={cierreMotivo} max={500} />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Sección 6: Incidencias y recomendaciones */}
      <Section title="Incidencias y recomendaciones">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Incidencias observadas</label>
            <textarea rows={3} value={incidencias} onChange={(e) => { setIncidencias(e.target.value); setSaveStatus("saving"); }} className={INPUT} maxLength={1000} />
            <CharCount value={incidencias} max={1000} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Recomendaciones hasta próxima visita</label>
            <textarea rows={3} value={recomendaciones} onChange={(e) => { setRecomendaciones(e.target.value); setSaveStatus("saving"); }} className={INPUT} maxLength={1000} />
            <CharCount value={recomendaciones} max={1000} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Productos que debe tener en stock</label>
            <textarea rows={2} value={stockTitular} onChange={(e) => { setStockTitular(e.target.value); setSaveStatus("saving"); }} className={INPUT} maxLength={1000} />
            <CharCount value={stockTitular} max={1000} />
          </div>
        </div>
      </Section>

      {/* Barra de acciones sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex items-center justify-between gap-3 z-50 md:left-52">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          {saveStatus === "saved" && <><FiCheck size={14} className="text-green-500" /> Guardado</>}
          {saveStatus === "saving" && <><FiLoader size={14} className="animate-spin" /> Guardando…</>}
          {saveStatus === "offline" && <><FiWifiOff size={14} className="text-orange-500" /> Sin conexión</>}
        </div>
        <button onClick={handleFinalizar} className="bg-black text-white px-5 py-2 rounded-lg text-sm font-semibold">
          Finalizar parte
        </button>
      </div>
    </div>
  );
}

// -- Componentes auxiliares --

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white border rounded-xl shadow-sm mb-4">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-neutral-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function ActuacionesList({ items, onToggle, onDetalle }: {
  items: Actuacion[];
  onToggle: (ambito: string, nombre: string) => void;
  onDetalle: (ambito: string, nombre: string, d: string) => void;
}) {
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const ESTADO_TOGGLE: Record<string, { bg: string; text: string; label: string }> = {
    si: { bg: "bg-green-100", text: "text-green-800", label: "Sí" },
    no: { bg: "bg-neutral-100", text: "text-neutral-500", label: "No" },
    na: { bg: "bg-neutral-50", text: "text-neutral-400", label: "N/A" },
  };

  return (
    <div className="space-y-1">
      {items.map((a) => {
        const st = ESTADO_TOGGLE[a.estado];
        return (
          <div key={a.nombre}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggle(a.ambito, a.nombre)}
                className={`shrink-0 w-10 h-8 rounded text-xs font-semibold ${st.bg} ${st.text}`}
              >
                {st.label}
              </button>
              <button
                onClick={() => setExpandedName(expandedName === a.nombre ? null : a.nombre)}
                className="flex-1 text-left text-sm py-1 hover:text-black text-neutral-700"
              >
                {a.nombre}
              </button>
            </div>
            {expandedName === a.nombre && (
              <div className="ml-12 mt-1 mb-2">
                <input
                  type="text"
                  value={a.detalle ?? ""}
                  onChange={(e) => onDetalle(a.ambito, a.nombre, e.target.value)}
                  placeholder="Detalle (producto, dosis…)"
                  className="w-full border border-neutral-200 rounded px-2 py-1.5 text-xs"
                  maxLength={500}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: [string, string][];
}) {
  const INPUT = "w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black";
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className={INPUT}>
        <option value="">— Sin registrar —</option>
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  if (value.length < max * 0.7) return null;
  return <p className={`text-[11px] mt-0.5 ${value.length >= max ? "text-red-500" : "text-neutral-400"}`}>{value.length}/{max}</p>;
}

function TimeField({ label, value, onChange, onNow }: { label: string; value: string; onChange: (value: string) => void; onNow: () => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input type="time" value={value} onChange={(event) => onChange(event.target.value)} className={INPUT} />
        <button type="button" onClick={onNow} className="shrink-0 inline-flex items-center gap-1 border border-neutral-300 rounded px-3 text-xs font-medium hover:bg-neutral-50">
          <FiClock size={13} /> Ahora
        </button>
      </div>
    </div>
  );
}
