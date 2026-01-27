import Link from "next/link";

export default function CtaCalculator() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center bg-black rounded-xl p-8 md:p-12 shadow-xl">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-white text-black font-bold text-sm rounded-full mb-4">
            🎯 GRATIS Y SIN COMPROMISO
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Cuánto cuesta mantener tu piscina o jardín?
          </h2>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
            Calcula tu presupuesto al instante con nuestra calculadora online. 
            <strong className="text-white"> Precio real en 30 segundos.</strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm">Sin datos personales</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm">Precios reales 2026</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm">Resultado instantáneo</span>
          </div>
        </div>

        <Link
          href="/calcular-precio"
          className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-black font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-white"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="whitespace-nowrap">Calcular mi presupuesto ahora</span>
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <p className="text-xs text-white mt-4">
          💡 <strong>Nota:</strong> Este es un presupuesto orientativo. El precio final se confirma tras la visita técnica gratuita.
        </p>
      </div>
    </section>
  );
}
