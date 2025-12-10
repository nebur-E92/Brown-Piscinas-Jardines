import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Política de cookies" };

function CookieManagerButton() {
  "use client";
  const openCookieManager = () => {
    window.dispatchEvent(new Event('cookie-manager-open'));
  };
  return (
    <button className="underline" onClick={openCookieManager}>
      Gestionar cookies
    </button>
  );
}

export default function CookiesPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <h1 className="page-title mb-4">Política de cookies</h1>
      <p className="mb-4">Utilizamos cookies necesarias para el funcionamiento del sitio y, solo si consientes, cookies analíticas (Google Analytics 4) y de marketing (widgets externos).</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Gestión del consentimiento</h2>
      <p className="mb-4">
        Puedes aceptar, rechazar o configurar las categorías desde el banner inicial o en cualquier momento en <CookieManagerButton />.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Cookies utilizadas</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Necesarias:</strong> recuerdan tu decisión de consentimiento.</li>
        <li><strong>Analíticas (opcionales):</strong> _ga, _gid, etc. Solo se cargan si aceptas.</li>
        <li><strong>Marketing (opcionales):</strong> iframes/embeds de terceros. Solo si aceptas.</li>
      </ul>
    </section>
  );
}
