import type { Metadata } from "next";
import { SITE, BUSINESS } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Sobre Nosotros | BROWN Piscinas & Jardines",
  description: "BROWN es una empresa especializada en mantenimiento de piscinas y jardines en Salamanca. Servicio profesional, claro y sin sorpresas.",
  alternates: {
    canonical: `${SITE.baseUrl}/sobre-nosotros`,
  },
};

function AboutJsonLd() {
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
        "name": "Sobre Nosotros",
        "item": `${SITE.baseUrl}/sobre-nosotros`
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

export default function SobreNosotrosPage() {
  return (
    <>
      <section className="max-w-3xl mx-auto py-12">
        <h1 className="page-title mb-6">Sobre Nosotros</h1>

        <article className="prose prose-sm max-w-none space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">¿Quiénes somos?</h2>
            <p className="text-gray-700 mb-4">
              BROWN Piscinas & Jardines es una empresa de mantenimiento de piscinas y jardines ubicada en Salamanca, creada para dar un servicio profesional, claro y sin sorpresas a propietarios de viviendas, chalets y comunidades.
            </p>
            <p className="text-gray-700">
              Nacemos con una idea muy concreta: hacer bien el trabajo, explicar exactamente qué se hace en cada servicio y ofrecer un mantenimiento realista, adaptado a cada instalación y a cada cliente. Sin paquetes cerrados absurdos ni permanencias innecesarias.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Nuestra Experiencia</h2>
            <p className="text-gray-700 mb-4">
              Trabajamos exclusivamente en servicios de exterior, lo que nos permite especializarnos en cada detalle técnico:
            </p>
            <ul className="space-y-4 text-gray-700 mb-4">
              <li>
                <strong>Mantenimiento preventivo de piscinas</strong><br/>
                Control del agua, limpieza de vaso, filtros, skimmers, revisión de cloración y prevención de averías antes de que aparezcan.
              </li>
              <li>
                <strong>Limpieza puntual de piscinas</strong><br/>
                Puestas a punto tras el invierno, limpiezas por abandono, turbidez, restos de obra o exceso de suciedad.
              </li>
              <li>
                <strong>Mantenimiento de jardines</strong><br/>
                Corte de césped, control de crecimiento, limpieza de zonas verdes y mantenimiento estético durante todo el año.
              </li>
              <li>
                <strong>Desbroce de parcelas y terrenos</strong><br/>
                Limpieza de fincas, solares y zonas rurales con maquinaria propia, adaptada a terrenos difíciles.
              </li>
              <li>
                <strong>Recorte de setos y cierres vegetales</strong><br/>
                Setos ornamentales, separadores de parcela y cierres perimetrales con acabado limpio y seguro.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-bold text-blue-900 mb-2">Servicio claro y sin sorpresas</h3>
                <p className="text-sm text-gray-700">Sabes desde el principio qué incluye cada servicio y qué no.</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-bold text-green-900 mb-2">Especialización real en exterior</h3>
                <p className="text-sm text-gray-700">No somos multiservicios genéricos: solo piscinas y jardines.</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <h3 className="font-bold text-yellow-900 mb-2">Flexibilidad sin permanencias</h3>
                <p className="text-sm text-gray-700">Mantenimientos mensuales, trabajos puntuales o refuerzos estacionales.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-2">Atención directa y trato personal</h3>
                <p className="text-sm text-gray-700">Sin call centers ni intermediarios.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Área de Cobertura</h2>
            <p className="text-gray-700 mb-4">
              Prestamos servicio en Salamanca capital y municipios del entorno, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-4">
              <li>Carbajosa de la Sagrada</li>
              <li>Santa Marta de Tormes</li>
              <li>Villamayor</li>
              <li>Doñinos</li>
              <li>Cabrerizos</li>
              <li>Aldeatejada</li>
              <li>Calvarrasa de Abajo</li>
              <li>Calvarrasa de Arriba</li>
              <li>Pelabravo</li>
              <li>Moriscos</li>
              <li>Villares de la Reina</li>
            </ul>
            <p className="text-gray-600 text-sm italic">También atendemos otras zonas bajo presupuesto previo.</p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-3">Contacta con Nosotros</h2>
            <p className="text-gray-700 mb-4">
              ¿Tienes dudas o necesitas presupuesto? Nos encantaría ayudarte:
            </p>
            <div className="space-y-2">
              <p><strong>Teléfono:</strong> <a href={`tel:${BUSINESS.phone}`} className="text-blue-600 hover:underline">{BUSINESS.phone}</a></p>
              <p><strong>WhatsApp:</strong> <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Chat directo</a></p>
              <p><strong>Email:</strong> <a href={`mailto:${BUSINESS.email}`} className="text-blue-600 hover:underline">{BUSINESS.email}</a></p>
              <p><strong>Horario:</strong> Lunes a Sábado, 09:00 - 20:00</p>
            </div>
          </div>
        </article>
      </section>

      <AboutJsonLd />
    </>
  );
}
