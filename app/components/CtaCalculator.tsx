import Link from "next/link";

export default function CtaCalculator() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
          Presupuesto sin compromiso
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Calcula el precio de tu servicio
        </h2>
        <p className="text-neutral-400 mb-10 max-w-xl mx-auto">
          Introduce tus medidas y obtén una estimación al instante. IVA incluido. Sin registro ni datos personales.
        </p>
        <Link
          href="/calcular-precio"
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-neutral-100 transition-all active:scale-[0.98]"
        >
          Calcular precio
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="text-xs text-neutral-600 mt-4">
          Precio orientativo · Se confirma tras visita técnica gratuita
        </p>
      </div>
    </section>
  );
}
