export const metadata = {
  title: "Opiniones",
  description: "Reseñas reales de clientes en Google.",
};

import OpinionesClient from "./OpinionesClient";
import { SITE, BUSINESS } from "../../lib/seo";

function ReviewsJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "@id": `${SITE.baseUrl}#reviews`,
    ratingValue: "5",
    reviewCount: "2",
    bestRating: "5",
    worstRating: "1",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function OpinionesPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <h1 className="page-title mb-4">Opiniones</h1>
      <p className="mb-4">Consulta nuestras reseñas en Google. Si no ves el widget, puedes abrirlas directamente:</p>
      <p className="mb-6"><a className="underline" href={process.env.NEXT_PUBLIC_GBP_URL || '#'} target="_blank" rel="noopener noreferrer">Ver reseñas en Google</a></p>
      <OpinionesClient />
      <ReviewsJsonLd />
    </section>
  );
}
