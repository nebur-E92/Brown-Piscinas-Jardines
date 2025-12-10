import Image from 'next/image';

export default function Hero() {
  return (
  <section id="hero" className="relative w-full bg-white min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex items-center justify-center">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
        <Image
          src="/images/hero.webp"
          alt="Piscina y jardín"
          fill
          className="object-cover w-full h-full z-0 rounded-xl"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40 rounded-xl" />
      </div>
      {/* Texto centrado */}
      <div className="relative z-10 text-center px-2 lg:px-0">
  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-white drop-shadow-lg max-w-5xl mx-auto">
          Mantenimiento de piscina y jardín en Salamanca
        </h2>
        <p className="mt-4 text-base sm:text-lg text-white drop-shadow max-w-2xl mx-auto">
          Mantenimiento profesional con tarifas claras y compromiso de calidad.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#contacto" className="rounded-full px-5 py-3 border text-base text-white border-white">
            Solicita tu presupuesto
          </a>
          <a
            href={process.env.NEXT_PUBLIC_WA_LINK || `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '34625199394'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-5 py-3 border text-base text-white border-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
