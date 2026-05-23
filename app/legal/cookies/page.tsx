import type { Metadata } from "next";
import { BUSINESS, SITE } from "../../../lib/seo";
import CookieManageLink from "../../components/CookieManageLink";

export const metadata: Metadata = {
  title: "Política de cookies — BROWN Piscinas & Jardines",
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-12 prose prose-neutral">
      <h1 className="text-2xl font-bold mb-2">Política de cookies</h1>
      <p className="text-sm text-neutral-400 mb-8">Última actualización: mayo de 2025</p>

      <p>
        En cumplimiento del artículo 22.2 de la Ley 34/2002 (LSSI-CE) y el Reglamento (UE) 2016/679 (RGPD), {BUSINESS.legalName} informa sobre el uso de cookies en <a href={SITE.baseUrl}>{SITE.domain}</a>.
      </p>

      <h2>¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños ficheros de texto que se almacenan en el navegador del usuario al visitar un sitio web. Permiten que el sitio recuerde preferencias y comportamientos para mejorar la experiencia de navegación.</p>

      <h2>Cookies que utilizamos</h2>

      <h3>Necesarias (siempre activas)</h3>
      <table className="text-sm w-full border-collapse">
        <thead><tr className="bg-neutral-50 border-b"><th className="py-1.5 text-left font-semibold pr-3">Cookie</th><th className="py-1.5 text-left font-semibold pr-3">Duración</th><th className="py-1.5 text-left font-semibold">Finalidad</th></tr></thead>
        <tbody>
          <tr className="border-b"><td className="py-1.5 pr-3 font-mono text-xs">cookie-consent</td><td className="py-1.5 pr-3">1 año</td><td className="py-1.5">Guarda tus preferencias de cookies</td></tr>
          <tr className="border-b"><td className="py-1.5 pr-3 font-mono text-xs">panel_session</td><td className="py-1.5 pr-3">8 h</td><td className="py-1.5">Sesión del panel de gestión privado (solo acceso interno)</td></tr>
          <tr><td className="py-1.5 pr-3 font-mono text-xs">qr_auth</td><td className="py-1.5 pr-3">30 días</td><td className="py-1.5">Acceso autenticado a analítica QR interna</td></tr>
        </tbody>
      </table>

      <h3 className="mt-6">Analíticas (requieren consentimiento)</h3>
      <table className="text-sm w-full border-collapse">
        <thead><tr className="bg-neutral-50 border-b"><th className="py-1.5 text-left font-semibold pr-3">Cookie</th><th className="py-1.5 text-left font-semibold pr-3">Proveedor</th><th className="py-1.5 text-left font-semibold">Finalidad</th></tr></thead>
        <tbody>
          <tr className="border-b"><td className="py-1.5 pr-3 font-mono text-xs">_ga, _ga_*</td><td className="py-1.5 pr-3">Google LLC</td><td className="py-1.5">Estadísticas de uso anónimas (Google Analytics 4)</td></tr>
          <tr><td className="py-1.5 pr-3 font-mono text-xs">_gid</td><td className="py-1.5 pr-3">Google LLC</td><td className="py-1.5">Distingue sesiones de usuario (24 h)</td></tr>
        </tbody>
      </table>
      <p className="text-sm">Google LLC, con sede en EE. UU., trata los datos bajo las cláusulas contractuales tipo aprobadas por la Comisión Europea. Más información: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">políticas de privacidad de Google</a>.</p>

      <h3>Marketing / terceros (requieren consentimiento)</h3>
      <p className="text-sm">Widgets externos como mapas de Google Maps se cargan únicamente si aceptas este tipo de cookies. Dichos servicios pueden instalar sus propias cookies bajo sus propias políticas.</p>

      <h2>Gestión del consentimiento</h2>
      <p>Al acceder al Sitio por primera vez aparece un banner para que aceptes, rechaces o configures las categorías. Puedes cambiar tu decisión en cualquier momento desde <CookieManageLink />.</p>
      <p>También puedes bloquear o eliminar cookies desde la configuración de tu navegador. Ten en cuenta que desactivar cookies necesarias puede afectar al funcionamiento del sitio.</p>

      <h2>Más información</h2>
      <p>
        Para cualquier consulta puedes escribirnos a <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.<br />
        Esta política se rige por la legislación española y europea. Versión vigente en <a href={`${SITE.baseUrl}/legal/cookies`}>{SITE.domain}/legal/cookies</a>.
      </p>
    </article>
  );
}
