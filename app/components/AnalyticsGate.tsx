"use client";

import { useEffect } from "react";

export default function AnalyticsGate() {
  useEffect(() => {
    // Espera al consentimiento
    const init = () => {
      const consent = localStorage.getItem("cookie-consent");
      if (consent !== "accepted") return;

      const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
      if (!GA_ID) return;

      // Evita doble inyección
      if (document.getElementById("ga4-src")) return;

      // Cargar GA4
      const s = document.createElement("script");
      s.id = "ga4-src";
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      s.async = true;
      document.head.appendChild(s);

      // Inicializar GA
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      gtag("js", new Date());
      gtag("config", GA_ID);
    };

    // Inicial al cargar
    init();

    // Reaccionar si el usuario cambia su decisión (por si añades un botón en la página de cookies)
    const handler = () => init();
    window.addEventListener("cookie-consent-changed", handler);
    return () => window.removeEventListener("cookie-consent-changed", handler);
  }, []);

  return null;
}
