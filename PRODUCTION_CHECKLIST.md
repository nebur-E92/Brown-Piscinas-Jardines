# ✅ CHECKLIST PRODUCCIÓN - BROWN V2

## Estado: ✅ LISTO PARA PRODUCCIÓN (VERIFICADO 10/12/2025)

### Build Production
- [x] npm run build ejecutado exitosamente
- [x] 34 rutas compiladas sin errores
- [x] Carpeta .next generada correctamente
- [x] Static pages pre-renderizadas (24/34)
- [x] Dynamic pages listas para servidor (10/34)
- [x] First Load JS: 87.2 kB shared
- [x] Middleware compilado: 26.9 kB

### 1. CONFIGURACIÓN GENERAL
- [x] Next.js 14.2.32 con App Router
- [x] TypeScript strict mode habilitado
- [x] React Strict Mode activo
- [x] Typed Routes experimentales
- [x] Headers de seguridad agregados (X-Content-Type-Options, X-Frame-Options, etc.)

### 2. VARIABLES DE ENTORNO
Requeridas en Vercel Project Settings:
```
NEXT_PUBLIC_WA_LINK=https://wa.me/34625199394
NEXT_PUBLIC_GBP_URL=https://share.google/pzfhOi60ueNovKW63
NEXT_PUBLIC_GBP_RATING=5
NEXT_PUBLIC_GBP_COUNT=2
NEXT_PUBLIC_GA_ID=[Tu ID de Google Analytics]
NEXT_PUBLIC_GMAPS_EMBED_URL=[Tu URL embebida de Google Maps]
QR_DASHBOARD_TOKEN=[Cambiar a valor seguro en producción]
QR_REDIRECT_PATH=/
QR_BASIC_USER=admin
QR_BASIC_PASS=[Cambiar a contraseña segura en producción]
GOOGLE_MAPS_API_KEY=[Tu API key]
GOOGLE_PLACE_ID=[Tu Place ID de Google]
N8N_WEBHOOK_URL=[Opcional - tu webhook de n8n]
N8N_QR_WEBHOOK_URL=[Opcional - para eventos QR]
PRICING_TABLE=[JSON completo de precios]
FORMSPREE_ENDPOINT=https://formspree.io/f/xqadaakq
```

### 3. SEGURIDAD
- [x] Middleware protege /analitica-qr con 3 capas de autenticación:
  - Cookie qr_auth con httpOnly, secure, sameSite=lax
  - Token en query (?token=...)
  - HTTP Basic Auth (usuario/contraseña)
- [x] Validación de entrada en rutas API
- [x] Cookies seguras (httpOnly, secure, SameSite)
- [x] CORS headers implícitos en Edge Runtime
- [x] Sanitización de slugs en rutas QR

### 4. APIS CRÍTICAS
- [x] POST /api/contact - Envía a Formspree + webhook n8n (opcional)
- [x] POST /api/calcular - Calcula precios con validación
- [x] GET /api/calcular/servicios - Lista servicios disponibles
- [x] GET /qr/[slug] - Redirige y registra acceso QR
- [x] GET /api/opiniones - Obtiene reviews de Google Places (fallback a link)
- [x] GET /api/qa - Info interna de QA

### 5. FUNCIONALIDADES
- [x] Cálculo de precios dinámico por servicio, tamaño y municipio
- [x] Tracking QR con persistencia en archivo JSON (.qr-logs/logs.json)
- [x] Dashboard analítico protegido (/analitica-qr)
- [x] Consentimiento de cookies (marketing, analytics, necesarias)
- [x] Google Analytics gateado por consentimiento
- [x] Google Maps iframe gateado por consentimiento
- [x] Formulario de contacto con Formspree
- [x] Página de éxito del formulario
- [x] 7 páginas de servicios con contenido dinámico
- [x] Links de servicios con preselección en calculadora
- [x] Breadcrumbs JSON-LD
- [x] Schema.org markup (Organization, LocalBusiness, Service, FAQ)

### 6. PERFORMANCE
- [x] Caching: Home revalidada cada 3600s (ISR)
- [x] Dashboard QR con force-dynamic (siempre fresco)
- [x] Edge Runtime en APIs rápidas
- [x] Imágenes optimizadas (unoptimized=true para self-hosted)
- [x] Tailwind CSS minificado

### 7. ZONAS QR CONFIGURADAS (16 total)

**Localizaciones (11):**
1. Salamanca
2. Alba de Tormes
3. Carbajosa de la Sagrada
4. Villamayor
5. Santa Marta de Tormes
6. Castellanos de Villiquera
7. Cabrerizos
8. Monterrubio de Armuña
9. Urb. La Rad
10. Urb. Los Cisnes
11. Calzada de Vandunciel

**Campañas/Materiales (5):**
- flyer-enero
- flyer-verano
- web-home
- cartel-piscina
- cartel-jardin

URLs de producción:
```
https://brownpiscinasyjardines.com/qr/[slug]
```

### 8. COMPILACIÓN & ERRORES
- [x] Cero errores de TypeScript
- [x] Cero warnings de compilación
- [x] Tipos importados correctamente
- [x] Funciones async/await correctas

### 9. RUTAS PROTEGIDAS
```
/analitica-qr              → Protegida con middleware
/api/*                     → Validación de entrada
/contacto                  → Pública
/calcular-precio           → Pública
/servicios/[slug]          → Pública
/qr/[slug]                 → Pública (logging interno)
```

### 10. ACCIONES PRE-DEPLOY

1. **Cambiar credenciales en producción:**
   - QR_BASIC_USER: cambiar de "admin"
   - QR_BASIC_PASS: cambiar de "brown2024" (mínimo 16 caracteres)
   - QR_DASHBOARD_TOKEN: cambiar de "brown-admin-2024"

2. **Verificar integraciones:**
   - [ ] FORMSPREE_ENDPOINT activo y funcionando
   - [ ] Google Analytics ID configurado (NEXT_PUBLIC_GA_ID)
   - [ ] Google Maps iframe URL correcta
   - [ ] Webhook n8n (si lo usas)

3. **Monitoreo post-deploy:**
   - [ ] Verificar QR tracking en /analitica-qr
   - [ ] Probar formulario contacto → email
   - [ ] Probar calculadora precios
   - [ ] Revisar logs en Vercel

### 11. ESTRUCTURA DE ARCHIVOS
```
app/
  ├── api/
  │   ├── calcular/route.ts          ✓ Edge runtime
  │   ├── calcular/servicios/route.ts ✓ Edge runtime
  │   ├── contact/route.ts            ✓ Edge runtime
  │   ├── opiniones/route.ts          ✓ Google Places API
  │   └── qa/route.ts                 ✓ Info interna
  ├── qr/[slug]/route.ts              ✓ Logging + redirect
  ├── analitica-qr/page.tsx           ✓ Dashboard protegido
  ├── servicios/[slug]/page.tsx       ✓ Dynamic content
  ├── layout.tsx                      ✓ Metadata + estructura
  └── page.tsx                        ✓ Home + caching ISR
lib/
  ├── pricing.ts                      ✓ Cálculo dinámico
  ├── qrStore.ts                      ✓ Persistencia JSON
  └── seo.ts                          ✓ Config centralizada
middleware.ts                         ✓ Auth 3-capas
next.config.mjs                       ✓ Headers seguridad
```

### 12. NOTAS IMPORTANTES

- **Logs QR**: Se guardan en `.qr-logs/logs.json` (incluir en `.gitignore`)
- **Google Places API**: Actualmente con fallback "Ver en Google" debido a validación Place ID
- **Email**: Configurado con Formspree (no requiere backend propio)
- **Webhooks n8n**: Opcionales, para eventos de contacto y QR
- **Revisiones Google**: Widget con fallback a link público
- **Análisis QR**: Dashboard interno solo con Basic Auth

---

**Última revisión:** 10 de diciembre de 2025  
**Versión:** 2.0.0  
**Estado:** ✅ LISTO PARA PRODUCCIÓN
