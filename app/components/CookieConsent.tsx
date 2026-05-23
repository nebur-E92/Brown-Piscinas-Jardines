"use client";

import { useEffect, useState } from "react";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const KEY = "cookie-consent"; // JSON con categorías

function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

function setConsent(c: Consent) {
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("cookie-consent-changed"));
}

export function openCookieManager() {
  window.dispatchEvent(new Event("cookie-manager-open"));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? getConsent() : null;
    if (!stored) {
      setVisible(true);
    } else {
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
    }

    const handler = () => setShowPanel(true);
    window.addEventListener("cookie-manager-open", handler);
    return () => window.removeEventListener("cookie-manager-open", handler);
  }, []);

  const saveAndClose = (acceptAll?: boolean) => {
    const c: Consent = {
      necessary: true,
      analytics: acceptAll ? true : analytics,
      marketing: acceptAll ? true : marketing,
      timestamp: new Date().toISOString(),
    };
    setConsent(c);
    setVisible(false);
    setShowPanel(false);
  };

  const rejectAll = () => {
    const c: Consent = { necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    setConsent(c);
    setVisible(false);
    setShowPanel(false);
  };

  // Banner
  const banner = visible && (
    <div role="dialog" aria-live="polite" className="fixed inset-x-0 bottom-0 z-50 bg-black/90 text-white p-4">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-3">
        <p className="text-sm leading-snug">
          Usamos cookies opcionales (analítica/marketing) solo tras tu consentimiento. {""}
          <a href="/legal/cookies" className="underline">Más info</a>.
        </p>
        <div className="w-full md:w-auto md:ml-auto flex gap-2 justify-end">
          <button onClick={rejectAll} className="px-3 py-2 text-sm rounded-md bg-neutral-700">Rechazar</button>
          <button onClick={() => setShowPanel(true)} className="px-3 py-2 text-sm rounded-md bg-neutral-800">Configurar</button>
          <button onClick={() => saveAndClose(true)} className="px-3 py-2 text-sm rounded-md bg-white text-black">Aceptar</button>
        </div>
      </div>
    </div>
  );

  // Panel de configuración accesible desde cualquier página
  const panel = showPanel && (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white text-black rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Preferencias de cookies</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1" />
            <div>
              <p className="font-medium">Necesarias</p>
              <p className="text-sm text-neutral-600">Imprescindibles para el funcionamiento básico (no se pueden desactivar).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input id="ck-analytics" type="checkbox" className="mt-1" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            <div>
              <label htmlFor="ck-analytics" className="font-medium">Analíticas</label>
              <p className="text-sm text-neutral-600">Medir uso del sitio (Google Analytics 4).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input id="ck-marketing" type="checkbox" className="mt-1" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            <div>
              <label htmlFor="ck-marketing" className="font-medium">Marketing</label>
              <p className="text-sm text-neutral-600">Integraciones de terceros (p. ej., reseñas/iframes).</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={rejectAll} className="px-3 py-2 text-sm rounded-md bg-neutral-200">Rechazar todo</button>
            <button onClick={() => saveAndClose()} className="px-3 py-2 text-sm rounded-md bg-neutral-900 text-white">Guardar preferencias</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {banner}
      {panel}
    </>
  );
}
