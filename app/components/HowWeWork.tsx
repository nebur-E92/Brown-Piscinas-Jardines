import { FaWhatsapp, FaClipboardCheck, FaLeaf } from 'react-icons/fa';

export default function HowWeWork() {
  return (
    <section id="como-trabajamos" className="py-12 bg-white">
      <h2 className="text-center text-2xl font-bold mb-8">CÓMO TRABAJAMOS</h2>
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center">
          <FaWhatsapp size={60} className="text-blue-900 mb-4" />
          <h3 className="text-lg font-bold mb-2">1. Contacto rápido</h3>
          <p className="text-center max-w-md">Nos escribes por WhatsApp, email o desde el formulario web. Respondemos en menos de 24 horas.</p>
        </div>
        <div className="flex flex-col items-center">
          <FaClipboardCheck size={60} className="text-blue-900 mb-4" />
          <h3 className="text-lg font-bold mb-2">2. Visita y validación del presupuesto</h3>
          <p className="text-center max-w-md">Acudimos a valorar y asesorar para piscina y jardín. Ajustamos el presupuesto según el detalle real sin sorpresas ocultas.</p>
        </div>
        <div className="flex flex-col items-center">
          <FaLeaf size={60} className="text-blue-900 mb-4" />
          <h3 className="text-lg font-bold mb-2">3. Mantenimiento sin preocupaciones</h3>
          <p className="text-center max-w-md">Nos encargamos de todo de forma periódica o puntual. Tú solo disfrutas de tu jardín y piscina perfectos.</p>
        </div>
      </div>
    </section>
  );
}