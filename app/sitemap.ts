import { SITE, SERVICES, LOCATIONS } from "../lib/seo";

export const runtime = "edge";

export default function sitemap() {
  const urls = [
    SITE.baseUrl,
    ...SERVICES.map(s => `${SITE.baseUrl}/servicios/${s.slug}`),
    ...LOCATIONS.map(l => `${SITE.baseUrl}/zonas/${l.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    url => `<url><loc>${url}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}