import { BUSINESS, SITE } from "../../../lib/seo";

export const metadata = {
  title: "Aviso legal — BROWN Piscinas & Jardines",
  robots: { index: false },
};

export default function AvisoLegalPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-12 prose prose-neutral">
      <h1 className="text-2xl font-bold mb-2">Aviso legal</h1>
      <p className="text-sm text-neutral-400 mb-8">Última actualización: mayo de 2025</p>

      <h2>1. Datos identificativos del titular</h2>
      <table className="text-sm w-full border-collapse mb-6">
        <tbody>
          <tr className="border-b"><td className="py-1.5 font-medium w-36">Titular</td><td>{BUSINESS.legalName}</td></tr>
          <tr className="border-b"><td className="py-1.5 font-medium">NIF</td><td>{BUSINESS.taxId}</td></tr>
          <tr className="border-b"><td className="py-1.5 font-medium">Domicilio</td><td>{BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.locality} ({BUSINESS.address.region}), España</td></tr>
          <tr className="border-b"><td className="py-1.5 font-medium">Email</td><td><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></td></tr>
          <tr><td className="py-1.5 font-medium">Sitio web</td><td><a href={SITE.baseUrl}>{SITE.baseUrl}</a></td></tr>
        </tbody>
      </table>

      <h2>2. Objeto y ámbito de aplicación</h2>
      <p>El presente Aviso Legal regula el acceso y uso del sitio web {SITE.baseUrl} (en adelante, «el Sitio»), titularidad de {BUSINESS.legalName}. El acceso al Sitio implica la aceptación plena y sin reservas de las condiciones contenidas en este documento.</p>

      <h2>3. Propiedad intelectual e industrial</h2>
      <p>Todos los contenidos del Sitio —textos, imágenes, logotipos, diseño gráfico, código fuente y demás elementos— son propiedad del titular o de terceros que han autorizado su uso, y están protegidos por la normativa española e internacional de propiedad intelectual e industrial.</p>
      <p>Queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otro acto de explotación de dichos contenidos sin autorización escrita del titular, salvo usos permitidos por la Ley.</p>

      <h2>4. Condiciones de uso</h2>
      <p>El usuario se compromete a hacer un uso lícito del Sitio, absteniéndose de:</p>
      <ul>
        <li>Reproducir, copiar o distribuir contenidos sin autorización.</li>
        <li>Utilizar el Sitio con fines fraudulentos o para transmitir contenidos ilícitos.</li>
        <li>Introducir virus informáticos o código malicioso.</li>
        <li>Realizar acciones que puedan dañar o sobrecargar la infraestructura técnica del Sitio.</li>
      </ul>

      <h2>5. Exclusión de garantías y responsabilidad</h2>
      <p>El titular no garantiza la disponibilidad ininterrumpida del Sitio y no se responsabiliza de los daños que puedan derivarse de interrupciones técnicas, errores de contenido o accesos no autorizados por terceros. Los precios y condiciones publicados tienen carácter orientativo y están sujetos a confirmación.</p>

      <h2>6. Enlaces a terceros</h2>
      <p>El Sitio puede contener enlaces a páginas de terceros. El titular no controla ni se responsabiliza del contenido de dichas páginas ni de las prácticas de privacidad de sus operadores.</p>

      <h2>7. Legislación aplicable y jurisdicción</h2>
      <p>Este Aviso Legal se rige por la legislación española, en particular la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), el Real Decreto Legislativo 1/1996, de Propiedad Intelectual, y el Reglamento (UE) 2016/679 (RGPD). Para cualquier controversia, las partes se someten a los juzgados y tribunales de Salamanca, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

      <h2>8. Modificaciones</h2>
      <p>El titular se reserva el derecho de modificar este Aviso Legal en cualquier momento. La versión vigente estará siempre publicada en <a href={`${SITE.baseUrl}/legal/aviso-legal`}>{SITE.baseUrl}/legal/aviso-legal</a>.</p>
    </article>
  );
}
