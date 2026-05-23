"use client";

export default function ReviewsStars() {
  const rating = Number(process.env.NEXT_PUBLIC_GBP_RATING || 5);
  const gbpUrl = process.env.NEXT_PUBLIC_GBP_URL || "#";

  return (
    <section className="py-12 border-t border-neutral-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">

          <a
            href={gbpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm font-semibold text-neutral-300 group-hover:text-white transition">
              {rating.toFixed(1)} en Google Maps
            </p>
          </a>

          <div className="hidden sm:block w-px h-10 bg-neutral-700" />

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-neutral-400">
            {[
              "Presupuesto sin compromiso",
              "Respuesta en menos de 24 h",
              "IVA siempre incluido",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
