"use client";
import { useEffect, useState } from "react";

type Review = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
  time?: number;
};

export default function OpinionesClient() {
  const [marketingAllowed, setMarketingAllowed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchReviews = async () => {
      if (!marketingAllowed) return;
      // Temporalmente deshabilitado hasta configurar Places API (New)
      // setLoading(true);
      // setError(null);
      // try {
      //   const res = await fetch('/api/opiniones');
      //   const data = await res.json();
      //   if (!res.ok) {
      //     setError(data?.error || 'No se pudieron cargar las reseñas');
      //     setReviews([]);
      //   } else {
      //     setRating(data.rating ?? null);
      //     setTotal(data.total ?? null);
      //     setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      //   }
      // } catch {
      //   setError('Problema de conexión al cargar reseñas');
      // } finally {
      //   setLoading(false);
      // }
    };
    fetchReviews();
  }, [marketingAllowed]);

  if (!marketingAllowed) {
    return (
      <div className="text-sm text-neutral-600">Para ver las reseñas, permite cookies de marketing en <button className="underline" onClick={() => window.dispatchEvent(new Event('cookie-manager-open'))}>Gestionar cookies</button>.</div>
    );
  }

  const gbpUrl = process.env.NEXT_PUBLIC_GBP_URL;
  
  // Solución temporal: mostrar enlace directo a Google
  return (
    <div className="w-full text-center py-6">
      <p className="text-sm text-neutral-600 mb-3">
        Consulta nuestras reseñas verificadas en Google
      </p>
      {gbpUrl && (
        <a 
          href={gbpUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition font-semibold"
        >
          Ver reseñas en Google
        </a>
      )}
    </div>
  );
}
