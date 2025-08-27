import Image from 'next/image';

export default function Hero() {
  return (
    <section id="hero" className="relative w-full flex flex-col items-center justify-center text-center bg-white">
      <div className="w-full relative">
        <Image
          src="/images/hero.webp"
          alt="Piscina y jardín"
          width={1920}
          height={1200}
          className="w-full h-[800px] object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] mb-4">
            Piscinas y jardines perfectos, sin complicaciones
          </h2>
          <p className="text-lg md:text-2xl text-white font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] mb-8">
            Mantenimiento profesional en Salamanca y alrededores,<br />
            con tarifas claras y compromiso de calidad.
          </p>
          <a
            href="#contacto"
            className="inline-block px-6 py-3 bg-blue-900 text-white rounded shadow border border-blue-300 font-semibold"
            style={{ boxShadow: '0 2px 8px rgba(26,35,126,0.25)' }}
          >
            Solicita tu presupuesto
          </a>
        </div>
      </div>
    </section>
  );
}