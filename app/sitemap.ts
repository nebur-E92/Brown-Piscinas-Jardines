import { SITE, SERVICES, LOCATIONS } from "../lib/seo";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/servicios",
    "/zonas",
    "/calcular-precio",
    "/opiniones",
    "/trabajos",
    "/sobre-nosotros",
    "/contacto",
    "/legal/aviso-legal",
    "/legal/privacidad",
    "/legal/cookies",
  ];

  const serviceRoutes = SERVICES.map(s => `/servicios/${s.slug}`);
  const locationRoutes = LOCATIONS.map(l => `/zonas/${l.slug}`);

  const allRoutes = [...routes, ...serviceRoutes, ...locationRoutes];

  return allRoutes.map(route => ({
    url: `${SITE.baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.includes("/servicios/") || route.includes("/calcular-precio") ? 0.8 : 0.6,
  }));
}