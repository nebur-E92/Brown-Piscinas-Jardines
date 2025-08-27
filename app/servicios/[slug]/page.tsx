import { SITE, BUSINESS, SERVICES } from "../../../lib/seo";

type Params = { slug: string };

export function generateStaticParams() {
  return SERVICES.map(service => ({ slug: service.slug }));
}

export function generateMetadata({ params }: { params: Params }) {
  const service = SERVICES.find(s => s.slug === params.slug);
  if (!service) return {};
  return {
    title: `${service.name} en Salamanca`,
    description: `${service.name} ${service.fromPrice}. ${BUSINESS.description}`,
    alternates: {
      canonical: `${SITE.baseUrl}/servicios/${service.slug}`,
    },
  };
}

function BreadcrumbJsonLd(serviceName: string) {
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
        "name": "Servicios",
        "item": `${SITE.baseUrl}/servicios`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": serviceName,
        "item": `${SITE.baseUrl}/servicios`
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

function ServiceJsonLd(service: { name: string; slug: string; fromPrice: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    areaServed: BUSINESS.address.locality,
    provider: { "@id": `${SITE.baseUrl}#localbusiness` },
    offers: {
      "@type": "Offer",
      price: service.fromPrice,
      priceCurrency: "EUR"
    }
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ServicePage({ params }: { params: Params }) {
  const service = SERVICES.find(s => s.slug === params.slug);
  if (!service) return <div>Servicio no encontrado</div>;
  return (
    <>
      {BreadcrumbJsonLd(service.name)}
      {ServiceJsonLd(service)}
      <section className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
        <p className="mb-2 text-lg">{service.fromPrice}</p>
        <p className="mb-6">{BUSINESS.description}</p>
        <a
          href={`https://wa.me/${BUSINESS.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-6 py-3 rounded font-semibold"
        >
          Solicita tu presupuesto por WhatsApp
        </a>
      </section>
    </>
  );
}