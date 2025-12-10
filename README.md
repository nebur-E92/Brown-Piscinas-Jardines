# Brown – V2 (Servicios + QR + RGPD)

- Next.js 14 (App Router) + TailwindCSS 3 + TypeScript
- Arquitectura por rutas de servicio y zonas
- Calculadora de precios conectada a tarifas reales (`PRICING_TABLE`)
- Sistema QR con registro y dashboard protegido por token
- Cumplimiento cookies AEPD 2024 (Aceptar / Rechazar / Configurar)

## Arranque local
```
npm install
copy .env.local.example .env.local
npm run dev
```

Rellena `.env.local` con tus IDs/URLs y tarifas. No hagas commit de `.env.local`.

## Variables de entorno principales
- `NEXT_PUBLIC_GA_ID` → GA4 (solo carga con analíticas aceptadas)
- `NEXT_PUBLIC_GBP_URL` y `NEXT_PUBLIC_GMAPS_EMBED_URL` → reseñas/iframe (solo con marketing)
- `QR_DASHBOARD_TOKEN` → protege `/analitica-qr` (primera entrada con `?token=`)
- `QR_REDIRECT_PATH` → destino tras escanear `/qr/*`
- `N8N_WEBHOOK_URL` y `N8N_QR_WEBHOOK_URL` → reenvío de formularios y eventos QR
- `PRICING_TABLE` → JSON con tarifas reales (ver `.env.local.example`)

## Rutas clave
- Servicios: `/servicios`, `/servicios/[slug]`
- Zonas: `/zonas`, `/zonas/[slug]`
- Calculadora: `/calcular-precio`
- Opiniones: `/opiniones`
- Trabajos: `/trabajos`
- Contacto: `/contacto`
- QR: `/qr/[slug]` → redirección + logging
- Dashboard QR: `/analitica-qr` (token)
- Legal: `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies`

## QA rápido
- Cookies de terceros no cargan sin consentimiento (ver DevTools → Network)
- `/api/qa` muestra checklist básico (rutas, cookies, forms, sitemap)
- `sitemap.xml` y `robots.txt` accesibles

## Despliegue
- Define `SITE.baseUrl` en `lib/seo.ts` con el dominio real
- No subir `.env.local` ni tokens
