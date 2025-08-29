import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { SITE, BUSINESS } from "../lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: BUSINESS.description,
  keywords: [
    "piscinas",
    "jardines",
    "mantenimiento",
    "Salamanca",
    "limpieza",
    "desbroce",
    "césped",
    "setos",
  ],
  alternates: {
    canonical: SITE.baseUrl,
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.baseUrl,
    siteName: SITE.name,
    title: SITE.name,
    description: BUSINESS.description,
    images: [BUSINESS.image],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: BUSINESS.description,
    images: [BUSINESS.image],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE.baseUrl}#localbusiness`,
    name: BUSINESS.legalName,
    image: BUSINESS.image,
    url: SITE.baseUrl,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    logo: BUSINESS.logo,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.locality,
      postalCode: BUSINESS.address.postalCode,
      addressRegion: BUSINESS.address.region,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.geo.lat,
      longitude: BUSINESS.geo.lon,
    },
    openingHours: BUSINESS.openingHours,
    sameAs: BUSINESS.sameAs,
    areaServed: BUSINESS.address.locality,
    makesOffer: [
      {
        "@type": "Service",
        name: "Mantenimiento de piscinas",
        areaServed: BUSINESS.address.locality,
        provider: { "@id": `${SITE.baseUrl}#localbusiness` },
      },
      {
        "@type": "Service",
        name: "Mantenimiento de jardines",
        areaServed: BUSINESS.address.locality,
        provider: { "@id": `${SITE.baseUrl}#localbusiness` },
      },
      {
        "@type": "Service",
        name: "Desbroce de terrenos",
        areaServed: BUSINESS.address.locality,
        provider: { "@id": `${SITE.baseUrl}#localbusiness` },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" dir="ltr">
      <body className="overflow-x-hidden">
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
        <Footer />
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}