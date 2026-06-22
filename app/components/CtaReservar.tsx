import { getWhatsAppHref } from "../../lib/contact";

export default function CtaReservar() {
  const whatsappHref = getWhatsAppHref();

  return (
    <section id="contacto" className="py-24 border-t border-neutral-800">
      <div className="max-w-xl mx-auto px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
          Servicios puntuales
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Agenda periódica completa
        </h2>
        <p className="text-neutral-400 mb-10 max-w-sm mx-auto">
          No abrimos nuevas plazas de mantenimiento periódico. Puedes reservar un servicio puntual o dejar una solicitud para lista de espera.
        </p>

        <a
          href="/reservar"
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-4 rounded-full hover:bg-neutral-100 transition-all active:scale-[0.98] text-base"
        >
          Reservar servicio puntual
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-10 text-sm text-neutral-500">
          {whatsappHref && (
            <>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition flex items-center gap-1.5"
              >
                Asistente WhatsApp
              </a>
              <span className="hidden sm:inline text-neutral-700">·</span>
            </>
          )}
          <a
            href="mailto:brownpiscinasyjardines@gmail.com"
            className="hover:text-white transition"
          >
            brownpiscinasyjardines@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
