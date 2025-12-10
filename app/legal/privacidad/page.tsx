import { BUSINESS } from "../../../lib/seo";

export const metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <h1 className="page-title mb-4">Política de privacidad</h1>
      <p className="mb-4">Responsable: {BUSINESS.legalName} (NIF {BUSINESS.taxId}). Contacto: {BUSINESS.email}</p>
      <p className="mb-4">Finalidad: responder a solicitudes y presupuestos, gestión de clientes y comunicaciones relacionadas con los servicios contratados.</p>
      <p className="mb-4">Legitimación: consentimiento del interesado y ejecución de contrato.</p>
      <p className="mb-4">Destinatarios: no se ceden datos a terceros salvo obligación legal y procesadores necesarios (alojamiento, analítica opcional si aceptas cookies).</p>
      <p className="mb-4">Derechos: acceso, rectificación, supresión, oposición, limitación y portabilidad. Puedes ejercerlos escribiendo a {BUSINESS.email}.</p>
      <p className="mb-4">Conservación: se conservarán durante la relación y los plazos necesarios para cumplir obligaciones legales.</p>
    </section>
  );
}
