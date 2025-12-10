import React from "react";
import { SITE, BUSINESS } from "../lib/seo";
import Hero from "./components/Hero";
import Services from "./components/Services";
import HowWeWork from "./components/HowWeWork";
import ContactForm from "./components/ContactForm";
import ReviewsStars from "./components/ReviewsStars";

export const revalidate = 3600; // revalidar cada hora

function FaqJsonLd(): React.ReactElement {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta el mantenimiento de piscina?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Desde 100 €/mes en Salamanca y alrededores."
        }
      },
      {
        "@type": "Question",
        "name": "¿Ofrecéis servicios puntuales?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, limpieza de piscinas desde 50 € y corte de césped desde 60 €."
        }
      },
      {
        "@type": "Question",
        "name": "¿En qué zonas trabajáis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Principalmente en Salamanca y alrededores."
        }
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

function BreadcrumbJsonLd(): React.ReactElement {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": SITE.baseUrl
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

export default function Page() {
  return (
    <>
      <FaqJsonLd />
      <BreadcrumbJsonLd />
      <Hero />
      <Services />
      <ReviewsStars />
      <HowWeWork />
      <ContactForm />
    </>
  );
}