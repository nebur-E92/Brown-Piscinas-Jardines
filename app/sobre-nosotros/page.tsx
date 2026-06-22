import type { Metadata } from "next";
import { SITE, BUSINESS } from "../../lib/seo";
import { getWhatsAppHref } from "../../lib/contact";

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
  const whatsappHref = getWhatsAppHref();

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
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-bold text-black mb-2">Servicio claro y sin sorpresas</h3>
                <p className="text-sm text-gray-700">Sabes desde el principio qué incluye cada servicio y qué no.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-bold text-black mb-2">Especialización real en exterior</h3>
                <p className="text-sm text-gray-700">No somos multiservicios genéricos: solo piscinas y jardines.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-bold text-black mb-2">Flexibilidad sin permanencias</h3>
                <p className="text-sm text-gray-700">Mantenimientos mensuales, trabajos puntuales o refuerzos estacionales.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="font-bold text-black mb-2">Proceso ordenado</h3>
                <p className="text-sm text-gray-700">La calculadora y la reserva nos permiten valorar cada solicitud con datos claros.</p>
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
            <h2 className="text-2xl font-bold mb-3">Solicita presupuesto</h2>
            <p className="text-gray-700 mb-4">
              Para darte una respuesta útil, empieza por la calculadora o reserva una visita en las franjas disponibles.
            </p>
            <div className="space-y-2">
              <p><strong>Calculadora:</strong> <a href="/calcular-precio" className="text-black hover:underline font-semibold">Calcular precio orientativo</a></p>
              <p><strong>Reserva:</strong> <a href="/reservar" className="text-black hover:underline font-semibold">Elegir una franja disponible</a></p>
              {whatsappHref && <p><strong>WhatsApp:</strong> <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-black hover:underline font-semibold">Asistente para recoger datos</a></p>}
              <p><strong>Email:</strong> <a href={`mailto:${BUSINESS.email}`} className="text-black hover:underline font-semibold">{BUSINESS.email}</a></p>
              <p><strong>Reservas:</strong> Lunes, miércoles y viernes por la mañana</p>
            </div>
          </div>
        </article>
      </section>

      <AboutJsonLd />
    </>
  );
}
