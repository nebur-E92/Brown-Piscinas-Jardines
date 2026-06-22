export const SITE = {
  name: "BROWN Piscinas & Jardines",
  domain: "brownpiscinasyjardines.com",
  baseUrl: "https://brownpiscinasyjardines.com",
  locale: "es_ES",
};

export const BUSINESS = {
  legalName: "Rubén Herrero García",
  taxId: "07971517Q",
  tagline: "Servicios puntuales de piscinas y jardines en Salamanca",
  description: "Servicios puntuales de piscinas y jardines en Salamanca y alrededores. Agenda periódica completa, lista de espera para mantenimiento y trabajos puntuales de césped, setos, desbroce y piscina.",
  email: "brownpiscinasyjardines@gmail.com",
  logo: "/brand/logo-brown.png",
  image: "/brand/og-brown.jpg", // 1200x630 recomendado
  address: {
    street: "Calle Piscina, 2 1ª 18",
    locality: "Villamayor",
    postalCode: "37185",
    region: "Salamanca",
    country: "ES",
  },
  geo: {
    lat: 40.970103,
    lon: -5.663539,
  },
  openingHours: "Mo-Sa 09:00-20:00",
  priceRange: "€€",
  sameAs: [] as string[], // Añade RRSS si tienes
};

// Precios v4.0 — IVA incluido
export const SERVICES = [
  { slug: "mantenimiento-piscina",    name: "Mantenimiento de piscina",                     fromPrice: "Lista de espera" },
  { slug: "mantenimiento-jardin",     name: "Mantenimiento de jardín",                       fromPrice: "Lista de espera" },
  { slug: "mantenimiento-combinado",  name: "Mantenimiento combinado piscina + jardín",      fromPrice: "Lista de espera" },
  { slug: "limpieza-puntual-piscina", name: "Limpieza puntual de piscina",                   fromPrice: "Desde 110 €" },
  { slug: "corte-cesped",             name: "Corte de césped",                               fromPrice: "Desde 90 €" },
  { slug: "desbroce",                 name: "Desbroce de terrenos",                          fromPrice: "Desde 0,70 €/m²" },
  { slug: "setos",                    name: "Recorte de setos",                              fromPrice: "Desde 7,00 €/ml" },
  { slug: "puesta-marcha",            name: "Puesta en marcha / Cierre de temporada",       fromPrice: "Desde 300 €" },
];

export const LOCATIONS = [
  { slug: "salamanca", name: "Salamanca" },
  { slug: "alba-de-tormes", name: "Alba de Tormes" },
  { slug: "carbajosa", name: "Carbajosa de la Sagrada" },
  { slug: "villamayor", name: "Villamayor" },
  { slug: "santa-marta", name: "Santa Marta de Tormes" },
  { slug: "castellanos-de-villiquera", name: "Castellanos de Villiquera" },
  { slug: "cabrerizos", name: "Cabrerizos" },
  { slug: "monterrubio-de-armuña", name: "Monterrubio de Armuña" },
  { slug: "la-rad", name: "Urb. La Rad" },
  { slug: "los-cisnes", name: "Urb. Los Cisnes" },
  { slug: "calzada-de-vandunciel", name: "Calzada de Vandunciel" },
  // Añade más localidades aquí
];
