export const metadata = { title: "QA Checklist" };

export default function QAPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <h1 className="page-title mb-4">QA Checklist</h1>
      <p className="mb-4">Consulta el reporte JSON en <a className="underline" href="/api/qa" target="_blank">/api/qa</a>.</p>
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>Cookies de terceros bloqueadas hasta consentimiento (AnalyticsGate + CookieConsent).</li>
        <li>Rutas obligatorias presentes (ver /api/qa).</li>
        <li>Formulario operando vía /api/contact y listo para n8n.</li>
        <li>Sitemap y robots generados dinámicamente.</li>
      </ul>
    </section>
  );
}
