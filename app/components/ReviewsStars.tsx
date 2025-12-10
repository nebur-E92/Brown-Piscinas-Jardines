"use client";
import { useEffect, useState } from "react";

export default function ReviewsStars() {
  const rating = Number(process.env.NEXT_PUBLIC_GBP_RATING || 4.9);
  const count = Number(process.env.NEXT_PUBLIC_GBP_COUNT || 25);
  const embedUrl = process.env.NEXT_PUBLIC_GMAPS_EMBED_URL;
  
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const raw = localStorage.getItem('cookie-consent');
        if (!raw) return setMarketingAllowed(false);
        const c = JSON.parse(raw);
        setMarketingAllowed(!!c.marketing);
      } catch { setMarketingAllowed(false); }
    };
    check();
    const h = () => check();
    window.addEventListener('cookie-consent-changed', h);
    return () => window.removeEventListener('cookie-consent-changed', h);
  }, []);
  
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a href="/opiniones" className="flex items-center justify-center gap-3 text-black hover:opacity-80 transition">
          <div className="flex text-yellow-400" aria-label={`${rating} de 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-base font-medium">{rating.toFixed(1)} / 5 · {count} reseñas en Google</span>
        </a>
        
        {embedUrl && marketingAllowed && (
          <div className="mt-6 flex justify-center">
            <iframe 
              src={embedUrl}
              className="w-full max-w-2xl h-64 rounded-lg shadow-md"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
        
        {embedUrl && !marketingAllowed && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl h-64 rounded-lg shadow-md bg-neutral-100 flex items-center justify-center p-6 text-center">
              <p className="text-sm text-neutral-700">
                Para ver el mapa con reseñas, permite cookies de marketing en{' '}
                <button 
                  className="underline font-semibold" 
                  onClick={() => window.dispatchEvent(new Event('cookie-manager-open'))}
                >
                  Gestionar cookies
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
