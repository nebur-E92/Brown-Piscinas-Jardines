"use client";

import { useState, useEffect } from "react";

// ─── tipos ────────────────────────────────────────────────────────────────────

type Franja = "manana" | "tarde";

type DatosPersonales = {
  nombre: string;
  email: string;
  telefono: string;
  municipio: string;
  notas: string;
  website: string;
  privacidad: boolean;
};

type Ocupacion = Record<string, { manana: number; tarde: number }>;

// ─── constantes ───────────────────────────────────────────────────────────────

const TIPOS = [
  { id: "visita_tecnica", label: "Visita técnica gratuita", desc: "Acudimos a valorar y presupuestar sin compromiso", icono: "🔍" },
  { id: "cesped",         label: "Mantenimiento de césped",  desc: "Corte, perfilado y retirada de restos",           icono: "🌿" },
  { id: "piscina",        label: "Mantenimiento de piscina", desc: "Análisis, ajuste de pH y limpieza completa",      icono: "💧" },
  { id: "setos",          label: "Recorte de setos",         desc: "Hoja pequeña o conífera, con o sin suplemento",   icono: "✂️" },
  { id: "desbroce",       label: "Desbroce de terreno",      desc: "Parcelas y solares en cualquier estado",          icono: "🏗️" },
  { id: "otro",           label: "Otro servicio",            desc: "Cuéntanos qué necesitas en las notas",            icono: "📋" },
];

const MUNICIPIOS = [
  "Salamanca", "Alba de Tormes", "Carbajosa de la Sagrada", "Villamayor",
  "Santa Marta de Tormes", "Castellanos de Villiquera", "Cabrerizos",
  "Monterrubio de Armuña", "Urb. La Rad", "Urb. Los Cisnes", "Calzada de Vandunciel",
  "Otro",
];

const MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DIAS_ES  = ["L","M","X","J","V","S","D"];

const MAX_POR_FRANJA = 3; // máximo reservas por franja y día

// ─── helpers ─────────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function esFestivo(_iso: string): boolean {
  return false; // puedes añadir festivos aquí
}

function esDisponible(iso: string, ocupacion: Ocupacion): boolean {
  const hoy = toISO(new Date());
  if (iso <= hoy) return false;
  const d = new Date(iso + "T12:00:00");
  if (d.getDay() === 0) return false; // domingo
  if (esFestivo(iso)) return false;
  const ocu = ocupacion[iso];
  if (!ocu) return true;
  return ocu.manana < MAX_POR_FRANJA || ocu.tarde < MAX_POR_FRANJA;
}

function franjaDisponible(iso: string, franja: Franja, ocupacion: Ocupacion): boolean {
  const ocu = ocupacion[iso];
  if (!ocu) return true;
  return ocu[franja] < MAX_POR_FRANJA;
}

// ─── Calendario ───────────────────────────────────────────────────────────────

function Calendario({
  ocupacion, seleccionado, onSelect,
}: {
  ocupacion: Ocupacion;
  seleccionado: string | null;
  onSelect: (iso: string) => void;
}) {
  const hoy = new Date();
  const [mes, setMes] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1);
  const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);

  // offset para que empiece en lunes
  const offset = (primerDia.getDay() + 6) % 7;
  const totalCeldas = offset + ultimoDia.getDate();
  const filas = Math.ceil(totalCeldas / 7);

  function prevMes() {
    const n = new Date(mes.getFullYear(), mes.getMonth() - 1, 1);
    if (n >= new Date(hoy.getFullYear(), hoy.getMonth(), 1)) setMes(n);
  }
  function nextMes() {
    const n = new Date(mes.getFullYear(), mes.getMonth() + 1, 1);
    if (n <= new Date(hoy.getFullYear(), hoy.getMonth() + 2, 1)) setMes(n);
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* cabecera mes */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMes} className="p-2 rounded-lg hover:bg-neutral-100 transition text-neutral-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-sm capitalize">
          {MESES_ES[mes.getMonth()]} {mes.getFullYear()}
        </span>
        <button onClick={nextMes} className="p-2 rounded-lg hover:bg-neutral-100 transition text-neutral-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* cabecera días */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_ES.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-neutral-400 py-1">{d}</div>
        ))}
      </div>

      {/* grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: filas * 7 }).map((_, i) => {
          const dia = i - offset + 1;
          if (dia < 1 || dia > ultimoDia.getDate()) return <div key={i} />;

          const d = new Date(mes.getFullYear(), mes.getMonth(), dia);
          const iso = toISO(d);
          const disponible = esDisponible(iso, ocupacion);
          const esDom = d.getDay() === 0;
          const pasado = iso <= toISO(new Date());
          const activo = iso === seleccionado;

          return (
            <button
              key={i}
              disabled={!disponible}
              onClick={() => onSelect(iso)}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${activo ? "bg-black text-white shadow-md" : ""}
                ${!activo && disponible ? "hover:bg-neutral-100 text-neutral-800" : ""}
                ${!disponible || esDom || pasado ? "text-neutral-300 cursor-not-allowed" : ""}
              `}
            >
              {dia}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-neutral-400 text-center mt-3">
        Lunes a sábado · Responderemos en menos de 24 h para confirmar
      </p>
    </div>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────

export default function BookingFlow({
  tipoInicial,
  serviciosInicial,
  precioInicial,
}: {
  tipoInicial?: string;
  serviciosInicial?: string;
  precioInicial?: string;
}) {
  const [paso, setPaso]           = useState<1|2|3|4|5>(tipoInicial ? 2 : 1);
  const [tipo, setTipo]           = useState(tipoInicial ?? "");
  const [fecha, setFecha]         = useState<string | null>(null);
  const [franja, setFranja]       = useState<Franja | null>(null);
  const [ocupacion, setOcupacion] = useState<Ocupacion>({});
  const [datos, setDatos]         = useState<DatosPersonales>({
    nombre: "", email: "", telefono: "", municipio: "", notas: "", website: "", privacidad: false,
  });
  const [enviando, setEnviando]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // cargar ocupación
  useEffect(() => {
    fetch("/api/reservar/disponibilidad")
      .then((r) => r.json())
      .then((d) => setOcupacion(d.ocupacion ?? {}))
      .catch(() => {});
  }, []);

  function pasoAntes() {
    if (paso > 1) setPaso((p) => (p - 1) as any);
  }

  function elegirTipo(id: string) {
    setTipo(id);
    setPaso(2);
  }

  function elegirFecha(iso: string) {
    setFecha(iso);
    setFranja(null);
    setPaso(3);
  }

  function elegirFranja(f: Franja) {
    setFranja(f);
    setPaso(4);
  }

  async function enviar() {
    if (!datos.nombre || !datos.email || !datos.privacidad) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo, servicio: serviciosInicial ?? tipo,
          fecha, franja,
          nombre: datos.nombre, email: datos.email,
          telefono: datos.telefono, municipio: datos.municipio,
          notas: datos.notas,
          website: datos.website,
          precio: precioInicial,
        }),
      });
      if (!res.ok) throw new Error();
      setPaso(5);
    } catch {
      setError("No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.");
    } finally {
      setEnviando(false);
    }
  }

  const tipoLabel = TIPOS.find((t) => t.id === tipo)?.label ?? tipo;
  const franjaLabel = franja === "manana" ? "Mañana (9:00–14:00)" : "Tarde (15:00–19:00)";
  const fechaLabel = fecha
    ? new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
    : "";

  // ── barra de progreso ──────────────────────────────────────────────────────
  const pasos = tipoInicial
    ? ["Fecha", "Franja", "Tus datos", "Confirmación"]
    : ["Servicio", "Fecha", "Franja", "Tus datos", "Confirmación"];
  const pasoActual = tipoInicial ? paso - 1 : paso;

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* progreso */}
      {paso < 5 && (
        <div className="flex items-center gap-1 mb-8">
          {pasos.map((label, i) => {
            const num = tipoInicial ? i + 2 : i + 1;
            const done = paso > num;
            const active = paso === num;
            return (
              <div key={label} className="flex items-center flex-1 min-w-0">
                <div className={`flex items-center gap-1.5 min-w-0 ${i < pasos.length - 1 ? "flex-1" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    done ? "bg-black text-white" : active ? "bg-black text-white" : "bg-neutral-200 text-neutral-400"
                  }`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs truncate hidden sm:block ${active ? "font-semibold" : "text-neutral-400"}`}>{label}</span>
                  {i < pasos.length - 1 && <div className={`h-px flex-1 mx-1 ${done ? "bg-black" : "bg-neutral-200"}`} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── paso 1: tipo ── */}
      {paso === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-1">¿Qué necesitas?</h2>
          <p className="text-sm text-neutral-500 mb-6">Selecciona el tipo de servicio para reservar tu cita.</p>
          <div className="space-y-2">
            {TIPOS.map(({ id, label, desc, icono }) => (
              <button
                key={id}
                onClick={() => elegirTipo(id)}
                className="w-full flex items-start gap-3 p-4 border border-neutral-200 rounded-xl text-left hover:border-black hover:shadow-sm transition-all group"
              >
                <span className="text-2xl shrink-0 mt-0.5">{icono}</span>
                <div>
                  <p className="font-semibold text-sm group-hover:text-black">{label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                </div>
                <svg className="w-4 h-4 text-neutral-300 group-hover:text-black ml-auto mt-1 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── paso 2: calendario ── */}
      {paso === 2 && (
        <div>
          <button onClick={pasoAntes} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-black mb-5 transition">
            ← Volver
          </button>
          <h2 className="text-xl font-bold mb-1">Elige un día</h2>
          <p className="text-sm text-neutral-500 mb-6">
            <span className="font-medium">{tipoLabel}</span>
            {precioInicial && <span className="ml-2 text-neutral-400">· Estimación: {precioInicial} €</span>}
          </p>
          <Calendario ocupacion={ocupacion} seleccionado={fecha} onSelect={elegirFecha} />
        </div>
      )}

      {/* ── paso 3: franja ── */}
      {paso === 3 && fecha && (
        <div>
          <button onClick={pasoAntes} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-black mb-5 transition">
            ← Volver
          </button>
          <h2 className="text-xl font-bold mb-1">¿Mañana o tarde?</h2>
          <p className="text-sm text-neutral-500 mb-6 capitalize">{fechaLabel}</p>
          <div className="grid grid-cols-2 gap-3">
            {(["manana", "tarde"] as Franja[]).map((f) => {
              const disponible = franjaDisponible(fecha, f, ocupacion);
              return (
                <button
                  key={f}
                  disabled={!disponible}
                  onClick={() => elegirFranja(f)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${
                    disponible
                      ? "border-neutral-200 hover:border-black hover:shadow-sm"
                      : "border-neutral-100 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <p className="text-2xl mb-2">{f === "manana" ? "🌅" : "🌇"}</p>
                  <p className="font-semibold">{f === "manana" ? "Mañana" : "Tarde"}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {f === "manana" ? "9:00 – 14:00" : "15:00 – 19:00"}
                  </p>
                  {!disponible && <p className="text-xs text-red-400 mt-1">Completo</p>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── paso 4: datos ── */}
      {paso === 4 && (
        <div>
          <button onClick={pasoAntes} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-black mb-5 transition">
            ← Volver
          </button>

          {/* resumen */}
          <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-500">Servicio</span>
              <span className="font-medium">{tipoLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Fecha</span>
              <span className="font-medium capitalize">{fechaLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Franja</span>
              <span className="font-medium">{franjaLabel}</span>
            </div>
            {precioInicial && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimación</span>
                <span className="font-medium">{precioInicial} €</span>
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold mb-5">Tus datos</h2>

          <div className="space-y-3">
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={datos.website}
                  onChange={(e) => setDatos({ ...datos, website: e.target.value })}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Nombre *</label>
                <input
                  type="text" placeholder="Tu nombre" required
                  value={datos.nombre}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Teléfono</label>
                <input
                  type="tel" placeholder="Teléfono"
                  value={datos.telefono}
                  onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email *</label>
              <input
                type="email" placeholder="tu@email.com" required
                value={datos.email}
                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Municipio</label>
              <select
                value={datos.municipio}
                onChange={(e) => setDatos({ ...datos, municipio: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:border-black transition"
              >
                <option value="">Selecciona...</option>
                {MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Notas (opcional)</label>
              <textarea
                placeholder="Describe brevemente tu jardín, piscina o cualquier detalle útil..."
                rows={3}
                value={datos.notas}
                onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-black transition resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-neutral-500 cursor-pointer">
              <input
                type="checkbox"
                checked={datos.privacidad}
                onChange={(e) => setDatos({ ...datos, privacidad: e.target.checked })}
                className="mt-0.5"
              />
              He leído y acepto la{" "}
              <a href="/legal/privacidad" target="_blank" className="underline text-neutral-700 hover:text-black">
                Política de privacidad
              </a>
            </label>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            onClick={enviar}
            disabled={!datos.nombre || !datos.email || !datos.privacidad || enviando}
            className="mt-6 w-full bg-black text-white font-semibold py-3.5 rounded-full disabled:opacity-40 hover:bg-neutral-800 transition-all active:scale-[0.99]"
          >
            {enviando ? "Enviando…" : "Confirmar reserva"}
          </button>
        </div>
      )}

      {/* ── paso 5: confirmación ── */}
      {paso === 5 && (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Reserva recibida!</h2>
          <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
            Te enviamos confirmación a <strong>{datos.email}</strong>. Nos pondremos en contacto contigo en menos de 24 h para confirmar la cita.
          </p>
          <div className="bg-neutral-50 rounded-xl p-5 text-sm text-left max-w-xs mx-auto space-y-2 mb-6">
            <div className="flex justify-between"><span className="text-neutral-500">Servicio</span><span className="font-medium">{tipoLabel}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Fecha</span><span className="font-medium capitalize">{fechaLabel}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Franja</span><span className="font-medium">{franjaLabel}</span></div>
          </div>
          <a href="/" className="text-sm text-neutral-500 hover:text-black underline transition">Volver al inicio</a>
        </div>
      )}
    </div>
  );
}
