import { SITE } from "../lib/seo";

export const runtime = "edge";

export default function robots() {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      `Sitemap: ${SITE.baseUrl}/sitemap.xml`,
      `Host: ${SITE.baseUrl}`,
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}