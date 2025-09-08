"use client";

import { useEffect, useState } from "react";

const KEY = "cookie-consent"; // "accepted" | "rejected"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!stored) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  const reject = () => {
    localStorage.setItem(KEY, "rejected");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  };

  return (
    <div role="dialog" aria-live="polite" className="fixed inset-x-0 bottom-0 z-50 bg-black/90 text-white p-4">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-3">
        <p className="text-sm leading-snug">
          Usamos cookies analíticas opcionales para mejorar la web.{" "}
          <a href="/legal/politica-de-cookies" className="underline">Más info</a>.
        </p>
        <div className="w-full md:w-auto md:ml-auto flex gap-2 justify-end">
          <button onClick={reject} className="px-3 py-2 text-sm rounded-md bg-neutral-700">Rechazar</button>
          <button onClick={accept} className="px-3 py-2 text-sm rounded-md bg-white text-black">Aceptar</button>
        </div>
      </div>
    </div>
  );
}
