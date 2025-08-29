import Image from 'next/image';

export default function Hero() {
  return (
    <section id="hero" className="relative w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 grid lg:grid-cols-2 gap-8 items-center">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Mantenimiento de piscina y jardín en Salamanca
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Mantenimiento profesional con tarifas claras y compromiso de calidad.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a href="#contacto" className="rounded-full px-5 py-3 bg-blue-900 text-white text-base">
              Solicita tu presupuesto
            </a>
            <a href={process.env.NEXT_PUBLIC_WA_LINK ?? 'https://wa.me/34625199394'} className="rounded-full px-5 py-3 border text-base">
              WhatsApp
            </a>
          </div>
        </div>
        {/* Imagen */}
        <div className="w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[5/4]">
          <Image
            src="/images/hero.webp"
            alt="Piscina y jardín"
            fill
            className="object-cover rounded-xl shadow"
            priority
            sizes="(min-width:1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
