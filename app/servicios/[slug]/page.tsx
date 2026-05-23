import React from "react";
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

function BreadcrumbJsonLd(serviceName: string): React.ReactElement {
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

function ServiceJsonLd(service: { name: string; slug: string; fromPrice: string }): React.ReactElement {
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

function FaqJsonLd(serviceName: string, serviceSlug: string): React.ReactElement {
  // FAQ personalizada por servicio
  let specificQuestions: Array<{ name: string; text: string }> = [];
  
  if (serviceSlug.includes('piscina') && !serviceSlug.includes('jardin')) {
    if (serviceSlug.includes('limpieza') || serviceSlug.includes('puntual')) {
      // Limpieza puntual de piscinas
      specificQuestions = [
        { name: "¿Podéis limpiar piscinas con agua muy sucia o verde?", text: "Sí, realizamos limpiezas completas incluso en casos de abandono prolongado." },
        { name: "¿La limpieza incluye productos químicos?", text: "Incluye los necesarios para dejar el agua en condiciones, siempre tras valorar el estado real de la piscina." }
      ];
    } else {
      // Mantenimiento preventivo de piscinas
      specificQuestions = [
        { name: "¿Qué incluye el mantenimiento químico de la piscina?", text: "Incluye el control del cloro, el pH, revisión visual del estado del agua y ajustes necesarios para mantenerla en condiciones óptimas." },
        { name: "¿Incluye limpieza de filtros?", text: "Sí, se revisan y limpian según el estado del sistema y la frecuencia contratada." }
      ];
    }
  } else if (serviceSlug.includes('jardin') && !serviceSlug.includes('piscina')) {
    // Mantenimiento de jardín y corte de césped
    if (serviceSlug.includes('corte') || serviceSlug.includes('cesped')) {
      specificQuestions = [
        { name: "¿Cortáis césped en parcelas grandes?", text: "Sí, adaptamos maquinaria y tiempos según el tamaño de la superficie." },
        { name: "¿Recogéis el césped cortado?", text: "Sí, salvo que el cliente prefiera triturado para abono." }
      ];
    } else {
      specificQuestions = [
        { name: "¿Con qué frecuencia se realiza el mantenimiento del jardín?", text: "Puede ser semanal, quincenal o mensual, según el crecimiento y el uso del jardín." },
        { name: "¿Incluye retirada de restos vegetales?", text: "Sí, siempre que se contrate como parte del servicio o como extra puntual." }
      ];
    }
  } else if (serviceSlug.includes('desbroce')) {
    specificQuestions = [
      { name: "¿Trabajáis con terrenos muy grandes?", text: "Sí, realizamos desbroces en parcelas, solares y fincas de gran tamaño." },
      { name: "¿Desbrozáis zonas con pendiente o de difícil acceso?", text: "Sí, siempre que sea seguro para el operario." }
    ];
  } else if (serviceSlug.includes('seto')) {
    specificQuestions = [
      { name: "¿Qué tipos de setos podéis cortar?", text: "Setos ornamentales, separadores de parcelas, cipreses, laurel, tuyas y seto natural." },
      { name: "¿Existe un límite de altura?", text: "Sí, trabajamos hasta un máximo seguro según normativa y medios disponibles." }
    ];
  } else if (serviceSlug.includes('combinado')) {
    specificQuestions = [
      { name: "¿Es más económico combinar piscina y jardín?", text: "Sí, el mantenimiento combinado permite reducir costes frente a contratar servicios por separado." },
      { name: "¿Se hace el mismo día?", text: "Siempre que la logística lo permita, sí." }
    ];
  }

  // FAQ genérica base
  const baseQuestions = [
    {
      "@type": "Question",
      name: `¿Cuál es el precio de ${serviceName}?`,
      acceptedAnswer: { "@type": "Answer", text: "Usa nuestro calculador de precios en línea para una estimación orientativa, o ponte en contacto para un presupuesto personalizado sin compromiso." }
    },
    {
      "@type": "Question",
      name: `¿Trabajáis en ${BUSINESS.address.locality}?`,
      acceptedAnswer: { "@type": "Answer", text: `Sí, cubrimos ${BUSINESS.address.locality} y las localidades cercanas. Consulta nuestra zona de cobertura o ponte en contacto para verificar tu ubicación.` }
    }
  ];

  // Agregar preguntas específicas
  const specificQuestionsFormatted = specificQuestions.map(q => ({
    "@type": "Question",
    name: q.name,
    acceptedAnswer: { "@type": "Answer", text: q.text }
  }));

  // Preguntas finales genéricas
  const finalQuestions = [
    {
      "@type": "Question",
      name: `¿Ofrecéis garantía en ${serviceName}?`,
      acceptedAnswer: { "@type": "Answer", text: "Sí, garantizamos nuestro trabajo. Si no te satisface, volvemos sin coste adicional." }
    },
    {
      "@type": "Question",
      name: `¿Con qué frecuencia debo contratar ${serviceName}?`,
      acceptedAnswer: { "@type": "Answer", text: "Depende del tamaño y estado. En nuestras páginas encontrarás recomendaciones específicas o consulta con nosotros vía WhatsApp." }
    },
    {
      "@type": "Question",
      name: `¿Cómo contratar ${serviceName}?`,
      acceptedAnswer: { "@type": "Answer", text: "Puedes usar el calculador de precios, enviar un formulario o contactarnos directamente por WhatsApp o teléfono." }
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...baseQuestions, ...specificQuestionsFormatted, ...finalQuestions]
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
  const isPiscina = service.slug === 'mantenimiento-piscina';
  const isJardin = service.slug === 'mantenimiento-jardin-mensual' || service.slug === 'mantenimiento-jardin';
  const isCombinado = service.slug === 'mantenimiento-combinado-mensual' || service.slug === 'mantenimiento-combinado';
  const isLimpiezaPiscina = service.slug === 'limpieza-piscina-estado' || service.slug === 'limpieza-piscina' || service.slug === 'limpieza-puntual-piscina';
  const isCorteCespeed = service.slug === 'corte-cesped' || service.slug === 'servicio-puntual-jardin';
  const isDesbroce = service.slug === 'desbroce' || service.slug === 'desbroce-de-parcelas';
  const isSetos = service.slug === 'setos' || service.slug === 'setos-hoja-pequena' || service.slug === 'setos-coniferas' || service.slug === 'recorte-setos';
  return (
    <>
      {BreadcrumbJsonLd(service.name)}
      {ServiceJsonLd(service)}
      {FaqJsonLd(service.name, service.slug)}
      <section className="mx-auto max-w-3xl py-12 px-4">
        <h1 className="page-title mb-3">{isSetos ? 'Recorte profesional de setos en Salamanca' : service.name}</h1>
        {isPiscina && (
          <p className="text-neutral-700 mb-6">
            Mantener una piscina limpia y segura no es un lujo, sino una necesidad. En Salamanca, el clima frío y seco en invierno contrasta con veranos calurosos, lo que obliga a vigilar el estado del agua todo el año. Nuestros planes de mantenimiento están pensados para propietarios de chalets, comunidades de vecinos, viviendas vacías y alojamientos turísticos que quieren despreocuparse y disfrutar de su piscina sin sorpresas.
          </p>
        )}
        {isJardin && (
          <p className="text-neutral-700 mb-6">
            El clima de Salamanca exige un cuidado constante del jardín: inviernos fríos y secos, veranos calurosos y períodos de lluvia escasa. Este servicio está diseñado para propietarios de chalets, comunidades de vecinos y segundas residencias que desean un jardín sano y estético durante todo el año.
          </p>
        )}
        {isCombinado && (
          <>
            <p className="text-neutral-700 mb-2">Mantenimiento combinado de piscina y jardín en Salamanca</p>
            <p className="text-neutral-700 mb-6">Para las propiedades que cuentan con piscina y jardín, ofrecemos un servicio integral que combina ambas rutinas de mantenimiento. Es ideal para chalets, segundas residencias y comunidades que buscan un cuidado coordinado y eficiente de sus espacios exteriores.</p>
          </>
        )}
        {isLimpiezaPiscina && (
          <p className="text-neutral-700 mb-6">Si has pasado un tiempo sin utilizar la piscina o necesitas ponerla a punto para la temporada, esta opción te ofrece un servicio completo de limpieza en una sola visita. Ideal para propietarios que no requieren mantenimiento mensual pero desean una puesta en marcha profesional.</p>
        )}
        {isCorteCespeed && (
          <p className="text-neutral-700 mb-6">Un césped bien cuidado mejora la estética de tu jardín y ayuda a conservar el suelo sano. Ofrecemos cortes puntuales y programados para particulares y comunidades que desean un acabado profesional.</p>
        )}
        {isDesbroce && (
          <p className="text-neutral-700 mb-6">El desbroce es fundamental para mantener parcelas y solares en buen estado, evitar plagas y reducir riesgos de incendio. Este servicio está pensado para propietarios de fincas, parcelas agrícolas, solares urbanos o jardines muy descuidados que necesitan una limpieza a fondo.</p>
        )}
        {isSetos && (
          <p className="text-neutral-700 mb-6">Los setos ornamentales dan estructura y privacidad a tu jardín, pero requieren un recorte periódico para mantener su forma y salud. Este servicio se centra en el recorte profesional de setos en chalets, urbanizaciones y jardines privados de Salamanca.</p>
        )}

        <h2 className="text-xl font-semibold mb-2">Qué incluye el servicio</h2>
        {isPiscina && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Dos visitas programadas al mes en temporada alta (mínimo) y una visita semanal recomendada en verano.</li>
            <li>Limpieza del vaso y de los skimmers, aspirado y cepillado de paredes.</li>
            <li>Control y ajuste de niveles de pH y cloro con productos autorizados.</li>
            <li>Revisión y mantenimiento del sistema de filtrado y bomba.</li>
            <li>Suministro e invernaje: preparación para el cierre y apertura de temporada.</li>
            <li>Asesoría sobre uso y protección de la piscina en las distintas estaciones.</li>
          </ul>
        )}
        {isJardin && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Mínimo dos visitas al mes y recomendación de una visita semanal en verano para un resultado óptimo.</li>
            <li>Corte de césped con altura adecuada y retirada de restos (hasta 150 litros).</li>
            <li>Recorte y poda de setos y arbustos ornamentales.</li>
            <li>Aireado, abonado orgánico y replantado de césped si es necesario.</li>
            <li>Control de riego y ajuste según estación.</li>
            <li>Control de malas hierbas y aplicación de herbicidas autorizados, siempre respetando nuestras normas internas.</li>
          </ul>
        )}
        {isCombinado && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Mínimo dos visitas al mes, recomendadas una por semana en temporada alta.</li>
            <li>Todas las tareas descritas en los servicios de mantenimiento de piscina y de jardín: limpieza y control del agua, corte de césped, recorte de setos, abonado y replantado del césped, revisión de sistemas de filtrado y riego.</li>
            <li>Preparación de la piscina y el jardín para invierno y puesta en marcha en primavera.</li>
            <li>Retirada de restos vegetales hasta 150 litros.</li>
          </ul>
        )}
        {isLimpiezaPiscina && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Vaciado parcial o total del vaso (según estado) y eliminación de algas y sedimentos.</li>
            <li>Aspirado de fondo y paredes, y limpieza de skimmers y línea de flotación.</li>
            <li>Revisión del sistema de filtración y ajustes básicos.</li>
            <li>Medición y ajuste inicial de niveles de pH y cloro.</li>
            <li>Asesoría sobre el mantenimiento básico para prolongar la limpieza.</li>
          </ul>
        )}
        {isCorteCespeed && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Corte de césped con maquinaria adaptada al tamaño de tu jardín.</li>
            <li>Ajuste de altura de corte según especie y temporada.</li>
            <li>Recogida y retirada de hasta 150 l de restos de corte.</li>
            <li>Revisión básica del estado del césped y recomendaciones para abonado y riego.</li>
          </ul>
        )}
        {isDesbroce && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Corte y retirada de matorrales, malas hierbas y vegetación espontánea.</li>
            <li>Uso de maquinaria profesional para desbrozar con seguridad y eficacia.</li>
            <li>Eliminación de restos vegetales (hasta 150 l incluidos; residuos adicionales se cobran aparte).</li>
            <li>Desplazamiento de nuestro equipo al lugar del desbroce (tarifa por kilómetro aplicada según normativa).</li>
            <li>Informe final sobre el estado de la parcela y recomendaciones para su mantenimiento.</li>
          </ul>
        )}
        {isSetos && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Recorte y poda de setos ornamentales (aligustre y similares, coníferas) con equipo profesional.</li>
            <li>Retirada de restos de poda (hasta 150 l incluidos; resto con coste adicional).</li>
            <li>Ajuste de altura y forma según especie y preferencias del cliente.</li>
            <li>Suplementos aplicados según altura del seto (más de 2 m o 3 m) y dificultad de acceso.</li>
            <li>Asesoramiento sobre la frecuencia de recorte y cuidados posteriores.</li>
          </ul>
        )}

        <h2 className="text-xl font-semibold mb-2">Qué no incluye</h2>
        {isPiscina && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Reparación de fugas, fisuras o grietas.</li>
            <li>Sustitución o instalación de sistemas de filtrado, bombas u otros equipos.</li>
            <li>Trabajos de fontanería, electricidad o construcción no recogidos en nuestro catálogo.</li>
            <li>Aplicación de productos químicos no autorizados.</li>
          </ul>
        )}
        {isJardin && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Poda o tala de árboles, especialmente frutales.</li>
            <li>Trabajos con escalera o plataforma elevadora.</li>
            <li>Instalación de sistemas de riego o trabajos de fontanería.</li>
            <li>Aplicación de pesticidas químicos no autorizados.</li>
          </ul>
        )}
        {isCombinado && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Reparaciones de equipamiento de piscina o riego.</li>
            <li>Poda o tala de árboles o trabajos de altura.</li>
            <li>Instalaciones de sistemas de riego o obras civiles.</li>
            <li>Aplicación de productos químicos no autorizados.</li>
          </ul>
        )}
        {isCorteCespeed && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Replantado o abonado (estos servicios se incluyen en el mantenimiento de jardín).</li>
            <li>Desbroce de hierba alta (consulta nuestro servicio de desbroce).</li>
            <li>Poda de árboles o trabajos de jardinería más complejos.</li>
          </ul>
        )}
        {isDesbroce && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Tala de árboles o eliminación de tocones.</li>
            <li>Trabajos de nivelación de terreno o preparación para construcción.</li>
            <li>Aplicación de productos químicos no autorizados para eliminar vegetación.</li>
          </ul>
        )}
        {isSetos && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Poda de frutales o árboles de gran porte.</li>
            <li>Trabajos con riesgo que requieran escalera o plataforma elevadora.</li>
            <li>Aplicación de herbicidas o pesticidas químicos no autorizados.</li>
          </ul>
        )}
        {isLimpiezaPiscina && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Reparaciones o sustitución de equipamiento.</li>
            <li>Obras de rehabilitación de la piscina.</li>
            <li>Tratamientos químicos complejos o uso de productos no autorizados.</li>
          </ul>
        )}

        <h2 className="text-xl font-semibold mb-2">Para quién es este servicio</h2>
        {isPiscina && (
          <ul className="list-disc ml-6 space-y-1 mb-6">
            <li>Chalets y viviendas unifamiliares con piscinas privadas.</li>
            <li>Comunidades de propietarios con piscinas comunitarias.</li>
            <li>Segundas residencias y viviendas de temporada que necesitan un control constante.</li>
            <li>Alojamiento turístico (casas rurales, hoteles con piscina) que buscan una piscina siempre lista para sus clientes.</li>
          </ul>
        )}
        {isJardin && (
          <p className="text-neutral-700 mb-6">Ideal para chalets con jardín, comunidades de propietarios con zonas verdes, viviendas deshabitadas que necesitan mantenimiento periódico y viviendas de alquiler vacacional que requieren un jardín impecable.</p>
        )}
        {isCombinado && (
          <p className="text-neutral-700 mb-6">Propietarios de villas con piscina y jardín, comunidades de propietarios con zonas comunes, alojamientos turísticos con áreas verdes y piscina.</p>
        )}
        {isCorteCespeed && (
          <p className="text-neutral-700 mb-6">Propietarios de chalets con jardín, comunidades con zonas verdes, viviendas de alquiler vacacional y fincas que desean un corte puntual o regular.</p>
        )}
        {isDesbroce && (
          <p className="text-neutral-700 mb-6">Propietarios de parcelas rústicas o solares urbanos, comunidades de propietarios con zonas comunes descuidadas, gestores de fincas agrícolas y jardines con vegetación muy alta.</p>
        )}
        {isSetos && (
          <p className="text-neutral-700 mb-6">Propietarios de viviendas con setos ornamentales, comunidades de vecinos con vallas vegetales, empresas y hoteles con jardines que buscan un acabado profesional.</p>
        )}
        {isLimpiezaPiscina && (
          <p className="text-neutral-700 mb-6">Propietarios que no tienen un plan de mantenimiento, viviendas de alquiler vacacional que necesitan preparar la piscina para los huéspedes, segundas residencias o comunidades que realizan su propio mantenimiento y solo requieren apoyo puntual.</p>
        )}

        <h2 className="text-xl font-semibold mb-2">Frecuencia habitual del servicio</h2>
        {isPiscina && (
          <p className="text-neutral-700 mb-6">La frecuencia recomendada es de dos visitas al mes, con la opción de una visita semanal en verano para un resultado óptimo.</p>
        )}
        {isJardin && (
          <p className="text-neutral-700 mb-6">Se recomiendan al menos dos visitas al mes; durante el verano, una visita semanal puede ayudar a mantener el césped y los setos en perfectas condiciones.</p>
        )}
        {isCombinado && (
          <p className="text-neutral-700 mb-6">Se recomiendan al menos dos visitas al mes, aunque en verano suele ser aconsejable una visita semanal para mantener tanto el agua de la piscina como el césped en perfectas condiciones.</p>
        )}
        {isCorteCespeed && (
          <p className="text-neutral-700 mb-6">En primavera y verano recomendamos cortes semanales; en otoño e invierno se puede espaciar a quincenal o mensual, dependiendo del crecimiento.</p>
        )}
        {isDesbroce && (
          <p className="text-neutral-700 mb-6">El desbroce suele ser puntual, aunque se recomienda realizarlo al menos una vez al año (habitualmente en primavera o finales de verano) para evitar acumulación de biomasa.</p>
        )}
        {isSetos && (
          <p className="text-neutral-700 mb-6">La mayoría de setos requieren entre dos y tres recortes al año, según especie. Se recomienda recortar a finales de primavera y finales de verano para mantener su forma.</p>
        )}
        {isLimpiezaPiscina && (
          <p className="text-neutral-700 mb-6">Se trata de una visita única. Se recomienda contratarla antes del inicio de la temporada de baño o cuando la piscina ha estado sin uso.</p>
        )}

        <h2 className="text-xl font-semibold mb-2">Rango de precio orientativo</h2>
        {isPiscina && (
          <p className="text-neutral-700 mb-6">El mantenimiento mensual para una piscina pequeña parte de 125 € al mes según nuestras tarifas oficiales. El precio final dependerá del tamaño y estado de la piscina y se confirma tras una inspección gratuita.</p>
        )}
        {isJardin && (
          <p className="text-neutral-700 mb-6">El servicio de mantenimiento de jardín parte de 130 € al mes para jardines pequeños. El precio final depende del tamaño y estado del jardín y se fija tras inspección.</p>
        )}
        {isCombinado && (
          <p className="text-neutral-700 mb-6">La combinación parte de 250 € al mes para viviendas con jardín pequeño y piscina pequeña. El precio varía según el tamaño de cada zona y se define tras evaluación.</p>
        )}
        {isCorteCespeed && (
          <p className="text-neutral-700 mb-6">Desde 70 € por visita para jardines pequeños. El precio depende del tamaño y estado del césped.</p>
        )}
        {isDesbroce && (
          <p className="text-neutral-700 mb-6">El coste se calcula por metro cuadrado y varía según la superficie; nuestros precios parten de 0,30 €/m² para grandes superficies. Las parcelas de menor tamaño tienen un coste unitario superior.</p>
        )}
        {isSetos && (
          <p className="text-neutral-700 mb-6">El precio se calcula por metro lineal y varía según la especie, altura y densidad del seto; nuestros servicios parten de aproximadamente 2 €/ml, con suplementos por altura y retirada de residuos voluminosos.</p>
        )}
        {isLimpiezaPiscina && (
          <p className="text-neutral-700 mb-6">Desde 60 € por piscina pequeña y visita. El precio se ajusta según el tamaño y la suciedad acumulada y siempre se confirma tras una inspección.</p>
        )}

        <h2 className="text-xl font-semibold mb-2">Cómo trabajamos</h2>
        {isPiscina && (
          <ul className="list-disc ml-6 space-y-1 mb-8">
            <li><span className="font-medium">Diagnóstico inicial:</span> concertamos una visita gratuita para evaluar el estado de la piscina y elaborar un presupuesto personalizado.</li>
            <li><span className="font-medium">Plan de acción:</span> establecemos un calendario de visitas y un plan de tratamiento del agua según tus necesidades.</li>
            <li><span className="font-medium">Seguimiento y ajuste:</span> monitorizamos la piscina en cada visita, ajustamos los parámetros y te informamos de cualquier incidencia.</li>
          </ul>
        )}
        {isJardin && (
          <ul className="list-disc ml-6 space-y-1 mb-8">
            <li><span className="font-medium">Evaluación y diagnóstico:</span> visitamos tu jardín y valoramos sus necesidades específicas.</li>
            <li><span className="font-medium">Plan de mantenimiento:</span> acordamos las tareas y la frecuencia de visitas.</li>
            <li><span className="font-medium">Cuidado continuo:</span> ejecutamos las labores en cada visita, retiramos restos y te mantenemos informado.</li>
          </ul>
        )}
        {isCombinado && (
          <ul className="list-disc ml-6 space-y-1 mb-8">
            <li><span className="font-medium">Visita inicial y diagnóstico:</span> analizamos el estado de la piscina y el jardín.</li>
            <li><span className="font-medium">Plan de acción integral:</span> diseñamos una rutina de visitas que coordina las tareas de ambos espacios.</li>
            <li><span className="font-medium">Seguimiento y comunicación:</span> revisamos periódicamente el estado de la piscina y el jardín y te informamos de cualquier incidencia.</li>
          </ul>
        )}
        {isCorteCespeed && (
          <ul className="list-disc ml-6 space-y-1 mb-8">
            <li><span className="font-medium">Evaluación inicial:</span> analizamos la superficie y evaluamos la altura ideal de corte.</li>
            <li><span className="font-medium">Ejecución:</span> realizamos el corte con maquinaria profesional y retiramos los restos.</li>
            <li><span className="font-medium">Recomendaciones:</span> te asesoramos sobre riego y abonado si lo necesitas.</li>
          </ul>
        )}
        {isDesbroce && (
          <ul className="list-disc ml-6 space-y-1 mb-8">
            <li><span className="font-medium">Visita previa:</span> valoramos la superficie y nivel de vegetación.</li>
            <li><span className="font-medium">Desbroce:</span> utilizamos maquinaria adecuada y retiramos los restos.</li>
            <li><span className="font-medium">Recomendaciones:</span> proporcionamos un informe con sugerencias para evitar nuevas proliferaciones.</li>
          </ul>
        )}
        {isSetos && (
          <ul className="list-disc ml-6 space-y-1 mb-8">
            <li><span className="font-medium">Visita inicial:</span> medimos la longitud y evaluamos la altura del seto.</li>
            <li><span className="font-medium">Recorte:</span> ejecutamos el recorte con las técnicas adecuadas para cada planta.</li>
            <li><span className="font-medium">Retirada y limpieza:</span> retiramos y gestionamos los residuos de forma segura.</li>
          </ul>
        )}
        {isLimpiezaPiscina && (
          <ul className="list-disc ml-6 space-y-1 mb-8">
            <li><span className="font-medium">Inspección previa:</span> verificamos el estado de la piscina y determinamos si es necesario vaciar parcial o totalmente.</li>
            <li><span className="font-medium">Limpieza profunda:</span> realizamos el vaciado, limpieza de superficies y ajuste del sistema de filtrado.</li>
            <li><span className="font-medium">Puesta en marcha:</span> ajustamos los niveles químicos y dejamos la piscina lista para el baño.</li>
          </ul>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={
              isPiscina ? "/calcular-precio?servicio=mantenimiento-piscina" :
              isJardin ? "/calcular-precio?servicio=mantenimiento-jardin" :
              isCombinado ? "/calcular-precio?servicio=mantenimiento-combinado" :
              isLimpiezaPiscina ? "/calcular-precio?servicio=limpieza-piscina-estado" :
              isCorteCespeed ? "/calcular-precio?servicio=corte-cesped" :
              isDesbroce ? "/calcular-precio?servicio=desbroce" :
              isSetos ? "/calcular-precio?servicio=setos" :
              "/calcular-precio"
            }
            className="inline-block px-5 py-3 border rounded text-sm font-semibold"
          >
            {isPiscina ? 'Utiliza nuestra calculadora de precios para piscina' : isJardin ? 'Calcula tu presupuesto de jardín' : isCombinado ? 'Comprueba nuestro servicio combinado en la calculadora' : isLimpiezaPiscina ? 'Utiliza la calculadora para tu limpieza puntual' : isCorteCespeed ? 'Calcula el coste de tu corte de césped' : isSetos ? 'Usa nuestra calculadora de precios para estimar el coste de tu seto' : 'Simula el coste aproximado del desbroce'}
          </a>
          <a href="/contacto" className="inline-block px-5 py-3 border rounded text-sm font-semibold">
            {isPiscina ? 'Solicita tu diagnóstico gratuito' : isJardin ? 'Contáctanos para una visita de valoración' : isCombinado ? 'Solicita una visita gratuita' : isLimpiezaPiscina ? 'Solicita tu limpieza puntual' : isCorteCespeed ? 'Pide tu servicio de corte' : isSetos ? 'Programa tu recorte de setos' : 'Solicita una visita sin compromiso'}
          </a>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">FAQ – Preguntas frecuentes</h2>
          {isPiscina && (
            <div className="space-y-3 text-neutral-800">
              <div>
                <p className="font-medium">¿Con qué frecuencia visitarán mi piscina?</p>
                <p>Nuestro plan estándar incluye dos visitas mensuales, pero se recomienda una visita semanal en verano y podemos adaptarnos a tus necesidades.</p>
              </div>
              <div>
                <p className="font-medium">¿El servicio incluye productos químicos?</p>
                <p>Sí, utilizamos productos de tratamiento autorizados. Si se requieren tratamientos especiales, se presupuestan aparte.</p>
              </div>
              <div>
                <p className="font-medium">¿Qué ocurre si detectáis una avería o fuga?</p>
                <p>Te informaremos de inmediato y te pondremos en contacto con un técnico especializado; no realizamos reparaciones.</p>
              </div>
              <div>
                <p className="font-medium">¿Puedo contratar una limpieza puntual?</p>
                <p>Sí, ofrecemos un servicio de limpieza puntual de piscina para casos aislados o para la puesta en marcha antes de verano.</p>
              </div>
            </div>
          )}
          {isJardin && (
            <div className="space-y-3 text-neutral-800">
              <div>
                <p className="font-medium">¿Incluye el servicio la replantación y abonado de césped?</p>
                <p>Sí, realizamos replantado y abonado si detectamos zonas deterioradas en tu jardín.</p>
              </div>
              <div>
                <p className="font-medium">¿Qué pasa con los restos de poda y corte?</p>
                <p>Retiramos hasta 150 l de restos sin coste; volúmenes mayores se presupuestan aparte.</p>
              </div>
              <div>
                <p className="font-medium">¿Podéis regar mi jardín si no estoy en casa?</p>
                <p>Ajustamos el sistema de riego si está instalado, pero no instalamos nuevos sistemas.</p>
              </div>
              <div>
                <p className="font-medium">¿Cómo determináis el tamaño del jardín y la tarifa?</p>
                <p>Medimos la superficie y evaluamos el estado del jardín durante la visita inicial para ofrecer un presupuesto ajustado.</p>
              </div>
            </div>
          )}
          {isCombinado && (
            <div className="space-y-3 text-neutral-800">
              <div>
                <p className="font-medium">¿Puedo contratar solo el mantenimiento de piscina o de jardín?</p>
                <p>Sí, puedes contratar cada servicio por separado según tus necesidades.</p>
              </div>
              <div>
                <p className="font-medium">¿Se coordinan las visitas para ambos espacios?</p>
                <p>Sí, en el servicio combinado coordinamos las tareas para optimizar el tiempo y recursos.</p>
              </div>
              <div>
                <p className="font-medium">¿Incluye la limpieza de zonas pavimentadas alrededor de la piscina?</p>
                <p>Se incluye una limpieza básica; limpiezas profundas de pavimentos se presupuestan aparte.</p>
              </div>
              <div>
                <p className="font-medium">¿Puedo ajustar la frecuencia de visitas según la estación?</p>
                <p>Sí, adaptamos la frecuencia de acuerdo con tus necesidades y con la época del año.</p>
              </div>
            </div>
          )}
          {isCorteCespeed && (
            <div className="space-y-3 text-neutral-800">
              <div>
                <p className="font-medium">¿Cada cuánto debo cortar el césped?</p>
                <p>Depende de la especie y época del año; en verano se aconseja semanalmente y en invierno cada 3 o 4 semanas.</p>
              </div>
              <div>
                <p className="font-medium">¿Incluye la eliminación de malas hierbas?</p>
                <p>No, pero podemos retirarlas como parte del mantenimiento de jardín.</p>
              </div>
              <div>
                <p className="font-medium">¿Necesito estar en casa durante el servicio?</p>
                <p>No, siempre que tengamos acceso al jardín y a una toma de corriente si fuese necesaria.</p>
              </div>
              <div>
                <p className="font-medium">¿Qué pasa si llueve el día programado?</p>
                <p>Reprogramamos la visita para garantizar un corte de calidad.</p>
              </div>
            </div>
          )}
          {isDesbroce && (
            <div className="space-y-3 text-neutral-800">
              <div>
                <p className="font-medium">¿En qué época se recomienda realizar el desbroce?</p>
                <p>En primavera para prevenir incendios y en otoño para limpiar la vegetación de verano.</p>
              </div>
              <div>
                <p className="font-medium">¿Qué ocurre con los restos vegetales?</p>
                <p>Retiramos hasta 150 l gratuitamente; cantidades mayores se cobran aparte y deben gestionarse según normativa local.</p>
              </div>
              <div>
                <p className="font-medium">¿Necesitáis permiso para desbrozar?</p>
                <p>En parcelas privadas no suele ser necesario, pero te aconsejamos revisar la normativa municipal si se trata de suelo protegido.</p>
              </div>
              <div>
                <p className="font-medium">¿Ofrecéis desbroce en zonas de difícil acceso?</p>
                <p>Sí, evaluamos cada caso; si el terreno presenta riesgos adicionales, te lo indicaremos en la visita previa.</p>
              </div>
            </div>
          )}
          {isSetos && (
            <div className="space-y-3 text-neutral-800">
              <div>
                <p className="font-medium">¿Con qué frecuencia debo recortar un seto?</p>
                <p>La frecuencia depende de la especie; como regla general, dos veces al año son suficientes para mantener la forma.</p>
              </div>
              <div>
                <p className="font-medium">¿Recogéis todos los restos?</p>
                <p>Recogemos los restos hasta 150 l; cantidades superiores pueden conllevar un suplemento.</p>
              </div>
              <div>
                <p className="font-medium">¿Incluye la poda de árboles pequeños?</p>
                <p>No, el servicio se centra en setos ornamentales; no realizamos poda de árboles de frutal ni de gran porte.</p>
              </div>
              <div>
                <p className="font-medium">¿Qué pasa si el seto supera los 3 metros?</p>
                <p>Aplicamos un suplemento adicional por altura y evaluamos los riesgos antes de realizar el trabajo.</p>
              </div>
            </div>
          )}
          {isLimpiezaPiscina && (
            <div className="space-y-3 text-neutral-800">
              <div>
                <p className="font-medium">¿Cuánto dura la limpieza?</p>
                <p>Una limpieza puntual suele durar entre 2 y 4 horas, dependiendo del estado inicial.</p>
              </div>
              <div>
                <p className="font-medium">¿Es necesario vaciar la piscina por completo?</p>
                <p>No siempre; evaluamos la mejor opción para evitar desperdicio de agua.</p>
              </div>
              <div>
                <p className="font-medium">¿Puedo nadar inmediatamente después de la limpieza?</p>
                <p>Sí, siempre que los niveles químicos estén correctos tras el servicio.</p>
              </div>
              <div>
                <p className="font-medium">¿Es necesario contratar un mantenimiento mensual después?</p>
                <p>No es obligatorio, pero recomendamos un mantenimiento regular para conservar la calidad del agua.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}