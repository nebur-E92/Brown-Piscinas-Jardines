const PASOS = [
  {
    numero: "01",
    titulo: "Contacto rápido",
    descripcion: "Escríbenos por WhatsApp, email o desde el formulario. Respondemos en menos de 24 h.",
  },
  {
    numero: "02",
    titulo: "Visita técnica gratuita",
    descripcion: "Acudimos a valorar la instalación y confirmar el presupuesto. Sin sorpresas ni costes ocultos.",
  },
  {
    numero: "03",
    titulo: "Servicio sin preocupaciones",
    descripcion: "Nos encargamos de todo, de forma periódica o puntual. Tú solo disfrutas del resultado.",
  },
];

export default function HowWeWork() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 text-center mb-3">
          Proceso
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-14">
          Cómo trabajamos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800">
          {PASOS.map(({ numero, titulo, descripcion }) => (
            <div key={numero} className="bg-neutral-950 p-8 flex flex-col gap-4">
              <span className="text-5xl font-bold text-neutral-800 leading-none">{numero}</span>
              <div>
                <h3 className="text-base font-semibold text-white mb-1.5">{titulo}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
