import ContactForm from "../components/ContactForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Contacto",
  description: "Pide tu visita y presupuesto en Salamanca.",
};

function getDefaults(searchParams: Record<string, string | string[] | undefined>) {
  const pick = (k: string) => (Array.isArray(searchParams[k]) ? searchParams[k]?.[0] : searchParams[k]) || "";
  return {
    servicio: pick('servicio'),
    tamano: pick('tamano'),
    frecuencia: pick('frecuencia'),
    municipio: pick('municipio'),
    precio: pick('precio'),
  } as any;
}

export default function ContactoPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <section className="py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title">Contacto</h1>
        {searchParams?.enviado === '1' && (
          <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            Mensaje enviado correctamente. Te responderemos lo antes posible.
          </div>
        )}
        <ContactForm defaults={getDefaults(searchParams)} />
      </div>
    </section>
  );
}
