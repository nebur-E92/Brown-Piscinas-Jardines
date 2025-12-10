import React from "react";
import { SITE, BUSINESS, LOCATIONS } from "../../../lib/seo";

type Params = { slug: string };

export function generateStaticParams() {
  return LOCATIONS.map(loc => ({ slug: loc.slug }));
}

export function generateMetadata({ params }: { params: Params }) {
  const location = LOCATIONS.find(l => l.slug === params.slug);
  if (!location) return {};
  return {
    title: `Mantenimiento de piscina y jardín en ${location.name}`,
    description: `Servicios de piscina y jardín en ${location.name}. ${BUSINESS.description}`,
    alternates: {
      canonical: `${SITE.baseUrl}/zonas/${location.slug}`,
    },
  };
}

function BreadcrumbJsonLd(locationName: string): React.ReactElement {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": SITE.baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Zonas",
        "item": `${SITE.baseUrl}/zonas`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": locationName,
        "item": `${SITE.baseUrl}/zonas`
      }
    ]
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ZonaPage({ params }: { params: Params }) {
  const location = LOCATIONS.find(l => l.slug === params.slug);
  if (!location) return <div>Zona no encontrada</div>;
  return (
    <>
      {BreadcrumbJsonLd(location.name)}
      <section className="max-w-2xl mx-auto py-12">
        <h1 className="page-title mb-4">
          Mantenimiento de piscina y jardín en {location.name}
        </h1>
        <p className="mb-6">{BUSINESS.description}</p>
        <p className="text-sm text-neutral-600">Solicita tu presupuesto desde el formulario de contacto.</p>
      </section>
    </>
  );
}