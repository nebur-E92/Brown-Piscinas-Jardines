# Brown – V2 (Servicios + QR + RGPD)

- Next.js 14 (App Router) + TailwindCSS 3 + TypeScript
- Arquitectura por rutas de servicio y zonas
- Calculadora de precios conectada a tarifas reales (`PRICING_TABLE`)
- Sistema QR con registro y dashboard protegido por token
- Cumplimiento cookies AEPD 2024 (Aceptar / Rechazar / Configurar)
- **Menú de servicios dropdown** (Desktop: hover, Mobile: click)
- **Diseño black & white** (solo negro, blanco y amarillo para estrellas)
- **Calculadora mejorada**: medidas reales (m²), info de servicios, desglose de precios

## Arranque local
```bash
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
- Servicios: `/servicios`, `/servicios/[slug]` (accesible desde dropdown del menú)
- Zonas: `/zonas`, `/zonas/[slug]`
- Calculadora: `/calcular-precio` (con medidas reales y desglose de precios)
- Opiniones: `/opiniones`
- Trabajos: `/trabajos`
- Contacto: `/contacto`
- QR: `/qr/[slug]` → redirección + logging
- Dashboard QR: `/analitica-qr` (token)
- Legal: `/legal/aviso-legal`, `/legal/privacidad`, `/legal/cookies`

## Características destacadas (2026)

### 🎨 Diseño
- **Paleta de colores**: Solo negro, blanco y amarillo (estrellas)
- **Responsive completo**: Mobile, tablet y desktop
- **Navegación mejorada**: Dropdown de servicios (hover en desktop, click en mobile)
- **CTA Calculator**: Componente destacado para impulsar conversiones

### 🧮 Calculadora de precios
- **Medidas reales**: Piscinas (m² de superficie), Jardines (m² de césped), Setos (metros lineales)
- **Info de servicios**: Botón "¿Qué incluye?" con descripción detallada de cada servicio
- **Desglose de precios**: Cuando se seleccionan 2+ servicios, muestra precio individual + total
- **Validación completa**: Rangos por servicio, validación de municipios, errores específicos
- **Tarifas por tramos**: Descuentos automáticos por volumen (ej: setos 30ml, 60ml, +60ml)

### 🔍 SEO optimizado
- **Keywords**: 19 términos optimizados para "jardinería en Salamanca" y "mantenimiento piscinas"
- **Meta descriptions**: Incluyen tanto piscinas como jardines
- **Schema.org**: Organization, LocalBusiness, Service, FAQ
- **Sitemap**: Actualizado con todas las rutas
- **ISR**: Revalidación cada 3600s en home

## QA rápido
- Cookies de terceros no cargan sin consentimiento (ver DevTools → Network)
- `/api/qa` muestra checklist básico (rutas, cookies, forms, sitemap)
- `sitemap.xml` y `robots.txt` accesibles
- Build production: `npm run build` ✅ 40 rutas compiladas sin errores

## Lógica de precios (verificada ✅)

### Servicios con tamaños predefinidos
- Mantenimiento mensual piscina/jardín: `pequena`, `mediana`, `grande`
- Servicios puntuales: `pequena`, `mediana`, `grande`
- Combinados: `pequena-mediana`, `grande-pequena`, etc.

### Servicios con cantidad numérica
- **Desbroce**: €/m² por tramos (hasta 250m², 251-500m², 501-1000m², +1000m²)
- **Setos**: €/ml con descuento por volumen (hasta 30ml, 31-60ml, +60ml)
- **Baldosas**: €/m² fijo

### Servicios con estados
- **Limpieza piscina por estado**: vacía / sucia / muy sucia

### Ajustes por municipio
- Incrementos/descuentos según zona (configurables en `PRICING_TABLE`)

## Despliegue
- Define `SITE.baseUrl` en `lib/seo.ts` con el dominio real
- No subir `.env.local` ni tokens
- Vercel deploy automático desde branch `main`
- Build verificado: ✅ 40 rutas, First Load JS: 87.2 kB

## Última actualización
- **Fecha**: 27/01/2026
- **Versión**: 1.0.2
- **Estado**: ✅ Listo para producción
