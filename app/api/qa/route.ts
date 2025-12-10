import { NextRequest } from "next/server";
import { SERVICES, LOCATIONS, SITE } from "../../../lib/seo";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const requiredRoutes = [
    "/",
    "/servicios",
    "/calcular-precio",
    "/opiniones",
    "/trabajos",
    "/zonas",
    "/contacto",
    "/legal/aviso-legal",
    "/legal/privacidad",
    "/legal/cookies",
    ...SERVICES.map((s) => `/servicios/${s.slug}`),
    ...LOCATIONS.map((l) => `/zonas/${l.slug}`),
  ];

  const cookiesBlocking = true; // estático: scripts dependen de consentimiento en AnalyticsGate
  const consentCategories = true; // gestor incluye Aceptar/Rechazar/Configurar
  const sitemapUrl = `${SITE.baseUrl}/sitemap.xml`;

  const report = {
    routes: requiredRoutes,
    cookies: {
      categories: consentCategories,
      blockedThirdPartyByDefault: cookiesBlocking,
    },
    seo: {
      sitemap: sitemapUrl,
      robots: `${SITE.baseUrl}/robots.txt`,
    },
    forms: {
      contactApi: true,
      webhookReady: !!process.env.N8N_WEBHOOK_URL,
    },
  };

  return new Response(JSON.stringify(report, null, 2), { headers: { "Content-Type": "application/json" } });
}
