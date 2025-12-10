import ContactForm from "../components/ContactForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Contacto",
  description: "Pide tu visita y presupuesto en Salamanca.",
};

function getDefaults(searchParams: Record<string, string | string[] | undefined>) {
  const pick = (k: string): string => (Array.isArray(searchParams[k]) ? searchParams[k]?.[0] : searchParams[k]) || "";
  
  // Construir mensaje automático con todos los detalles
  let mensaje = "";
  const serviciosParam = pick('servicios');
  const municipio = pick('municipio');
  const precio = pick('precio');
  
  if (serviciosParam) {
    const servicios = serviciosParam.split(',');
    mensaje = "Solicitud de presupuesto desde calculadora:\n\n";
    
    servicios.forEach((servId) => {
      // Buscar parámetros relacionados con este servicio
      const tamano = pick(`${servId}_tamano`);
      const m2 = pick(`${servId}_m2`);
      const ml = pick(`${servId}_ml`);
      const frecuencia = pick(`${servId}_frecuencia`);
      
      mensaje += `- Servicio: ${servId}\n`;
      if (tamano) mensaje += `  Tamaño: ${tamano}\n`;
      if (m2) mensaje += `  Superficie: ${m2} m²\n`;
      if (ml) mensaje += `  Metros lineales: ${ml} ml\n`;
      if (frecuencia) mensaje += `  Frecuencia: ${frecuencia}\n`;
    });
    
    if (municipio) mensaje += `\nMunicipio: ${municipio}\n`;
    if (precio) mensaje += `Precio orientativo: ${precio}€\n`;
  }
  
  return {
    servicio: pick('servicio'),
    tamano: pick('tamano'),
    frecuencia: pick('frecuencia'),
    municipio: municipio,
    precio: precio,
    servicios: serviciosParam,
    mensaje: mensaje,
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
