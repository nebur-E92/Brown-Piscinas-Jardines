import { BUSINESS, SITE } from "../../../lib/seo";

export const metadata = { title: "Aviso legal" };

export default function AvisoLegalPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <h1 className="page-title mb-4">Aviso legal</h1>
      <p className="mb-4">Titular: {BUSINESS.legalName} · NIF: {BUSINESS.taxId}</p>
      <p className="mb-4">Contacto: {BUSINESS.email} · {BUSINESS.phone}</p>
      <p className="mb-4">Domicilio: {BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.locality} ({BUSINESS.address.region}), {BUSINESS.address.country}</p>
      <p className="mb-4">Sitio web: {SITE.baseUrl}</p>
      <p className="mb-4">El acceso y uso suponen la aceptación de este Aviso Legal. Los contenidos son propiedad del titular o de terceros con licencia. Queda prohibida su reproducción salvo autorización.</p>
    </section>
  );
}
