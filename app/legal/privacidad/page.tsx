import { BUSINESS, SITE } from "../../../lib/seo";

export const metadata = {
  title: "Política de privacidad — BROWN Piscinas & Jardines",
  robots: { index: false },
};

export default function PrivacidadPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-12 prose prose-neutral">
      <h1 className="text-2xl font-bold mb-2">Política de privacidad</h1>
      <p className="text-sm text-neutral-400 mb-8">Última actualización: mayo de 2025</p>

      <h2>1. Responsable del tratamiento</h2>
      <table className="text-sm w-full border-collapse mb-6">
        <tbody>
          <tr className="border-b"><td className="py-1.5 font-medium w-36">Titular</td><td>{BUSINESS.legalName}</td></tr>
          <tr className="border-b"><td className="py-1.5 font-medium">NIF</td><td>{BUSINESS.taxId}</td></tr>
          <tr className="border-b"><td className="py-1.5 font-medium">Domicilio</td><td>{BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.locality} ({BUSINESS.address.region})</td></tr>
          <tr className="border-b"><td className="py-1.5 font-medium">Email</td><td><a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></td></tr>
        </tbody>
      </table>

      <h2>2. Finalidades y base jurídica</h2>
      <table className="text-sm w-full border-collapse mb-6">
        <thead><tr className="border-b bg-neutral-50"><th className="py-1.5 text-left font-semibold">Finalidad</th><th className="py-1.5 text-left font-semibold">Base jurídica</th></tr></thead>
        <tbody>
          <tr className="border-b"><td className="py-1.5 pr-4">Responder a consultas y solicitudes de presupuesto</td><td className="py-1.5">Consentimiento del interesado (art. 6.1.a RGPD)</td></tr>
          <tr className="border-b"><td className="py-1.5 pr-4">Gestión y ejecución de contratos de servicios</td><td className="py-1.5">Ejecución de contrato (art. 6.1.b RGPD)</td></tr>
          <tr className="border-b"><td className="py-1.5 pr-4">Cumplimiento de obligaciones fiscales y mercantiles</td><td className="py-1.5">Obligación legal (art. 6.1.c RGPD)</td></tr>
          <tr><td className="py-1.5 pr-4">Envío de comunicaciones sobre servicios contratados</td><td className="py-1.5">Interés legítimo (art. 6.1.f RGPD)</td></tr>
        </tbody>
      </table>

      <h2>3. Datos que recopilamos</h2>
      <p>A través del formulario de contacto y la calculadora de presupuesto recogemos: nombre, dirección de correo electrónico, teléfono, municipio y descripción de la necesidad. No recopilamos datos especialmente protegidos.</p>

      <h2>4. Destinatarios</h2>
      <p>Los datos no se ceden a terceros salvo:</p>
      <ul>
        <li>Obligación legal (administraciones públicas, juzgados).</li>
        <li>Proveedores de servicios técnicos necesarios (alojamiento en Vercel Inc., servicio de envío de correo Resend Inc.) que actúan como encargados del tratamiento bajo contrato.</li>
        <li>Si has aceptado cookies analíticas: Google LLC (Google Analytics 4) conforme a las cláusulas contractuales estándar de la UE.</li>
      </ul>

      <h2>5. Transferencias internacionales</h2>
      <p>Vercel Inc. y Google LLC están situados en EE. UU. y acogen datos en servidores dentro del EEE. Cuando aplica, el tratamiento se ampara en las cláusulas contractuales tipo aprobadas por la Comisión Europea (art. 46 RGPD).</p>

      <h2>6. Plazo de conservación</h2>
      <p>Los datos de contacto se conservan mientras dure la relación comercial y, una vez finalizada, durante los plazos exigidos por la normativa aplicable (4 años para obligaciones fiscales según la Ley 58/2003 General Tributaria; 6 años para libros contables según el Código de Comercio).</p>

      <h2>7. Derechos del interesado</h2>
      <p>Puedes ejercer en cualquier momento los siguientes derechos enviando un correo a <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> con copia de tu DNI:</p>
      <ul>
        <li><strong>Acceso</strong>: conocer qué datos tratamos sobre ti.</li>
        <li><strong>Rectificación</strong>: corregir datos inexactos.</li>
        <li><strong>Supresión</strong>: solicitar el borrado cuando los datos ya no sean necesarios.</li>
        <li><strong>Oposición</strong>: oponerte al tratamiento basado en interés legítimo.</li>
        <li><strong>Limitación</strong>: solicitar que suspendamos temporalmente el tratamiento.</li>
        <li><strong>Portabilidad</strong>: recibir tus datos en formato estructurado.</li>
      </ul>
      <p>También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).</p>

      <h2>8. Seguridad</h2>
      <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos contra acceso no autorizado, pérdida o destrucción, de acuerdo con el art. 32 RGPD.</p>

      <h2>9. Modificaciones</h2>
      <p>Esta política puede actualizarse para adaptarse a cambios normativos o de negocio. La versión vigente estará siempre disponible en <a href={`${SITE.baseUrl}/legal/privacidad`}>{SITE.baseUrl}/legal/privacidad</a>.</p>
    </article>
  );
}
