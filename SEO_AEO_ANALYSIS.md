# 📊 ANÁLISIS SEO & AEO - BROWN V2

**Fecha:** 10 de diciembre de 2025  
**Versión:** 2.0.0  
**Estado:** BIEN IMPLEMENTADO con áreas de mejora

---

## 1. SEO TÉCNICO ✓

### 1.1 Metadatos Globales
**Estado:** ✅ COMPLETO

```typescript
// layout.tsx
metadata: {
  - title + template ✓
  - description ✓
  - keywords (8 términos) ✓
  - canonical URL ✓
  - robots (index, follow) ✓
  - og:* tags ✓
  - twitter card ✓
  - icons/favicon ✓
  - metadataBase ✓
}
```

**Análisis:**
- Titles dinámicos con template correcto
- Description con 160 caracteres (óptimo)
- Keywords genéricas pero relevantes
- Open Graph + Twitter Card para social sharing
- Canonical auto-generado desde metadataBase

**Mejora Recomendada:** Agregar keywords por región geográfica

### 1.2 Metadatos por Página
**Estado:** ✅ COMPLETO

**Servicios:**
- `generateMetadata()` dinámico
- Title: "Servicio + en Salamanca"
- Description personalizada con precio
- Canonical unique por servicio

**Zonas:**
- `generateMetadata()` dinámico
- Title: "Mantenimiento en {zona}"
- Description con descripción de negocio
- Canonical unique por zona

**Análisis:**
- Cada página tiene título y descripción únicos
- Estructura de URLs SEO-friendly (sin IDs)
- Breadcrumbs JSON-LD ✓

### 1.3 Estructura HTML & Heading Tags
**Estado:** ✅ BUENA

```
Home:
  h1: "BROWN Piscinas & Jardines"
  h2: Secciones principales (Servicios, Cómo trabajamos, etc.)
  
Servicios/[slug]:
  h1: Nombre del servicio
  h2: Secciones (Qué incluye, Precio, FAQ, etc.)
  
Zonas/[slug]:
  h1: "Mantenimiento en {zona}"
  h2: Contenido por zona
```

**Mejora Recomendada:** Asegurar H2/H3 en orden jerárquico (no saltar de H2 a H4)

### 1.4 Velocidad & Performance
**Estado:** ✅ OPTIMIZADO

```
Métricas de Build:
- First Load JS: 87.2 kB (shared) ✓
- Edge Runtime APIs ✓
- ISR caching (3600s) ✓
- Static pre-rendering ✓
- Imágenes unoptimized (self-hosted) ✓
```

**Recomendación:** Usar Next.js Image con priority/lazy loading en fotos grandes

### 1.5 Mobile & Responsive
**Estado:** ✅ TAILWIND CSS RESPONSIVE

```
Validar:
- Viewport meta tag (en layout.tsx)
- Mobile-first CSS (Tailwind)
- Touch targets > 44px
```

---

## 2. SCHEMA.ORG (Structured Data) ✓

### 2.1 Schemas Implementados
**Estado:** ✅ BIEN IMPLEMENTADO

```json
✓ BreadcrumbList (Home, Servicios, Zonas)
✓ FAQPage (Home + Servicios)
✓ Service (Servicios con pricing)
✓ LocalBusiness (implícito en metadata)
```

### 2.2 Análisis Detallado

**Home (page.tsx):**
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    { "Question": "¿Cuánto cuesta...?", "Answer": "..." },
    { "Question": "¿Cuánto tiempo...?", "Answer": "..." }
  ]
}
```
✅ Correcto para Featured Snippets

**Servicios:**
```json
{
  "@type": "Service",
  "name": "Mantenimiento de piscina",
  "areaServed": "Villamayor",
  "offers": {
    "@type": "Offer",
    "price": "Desde 100 €/mes",
    "priceCurrency": "EUR"
  }
}
```
⚠️ **MEJORA:** Falta provider URL completo

**Zonas:**
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "position": 1, "name": "Inicio", "item": "..." }
  ]
}
```
✅ Correcto

### 2.3 Schema Faltante (RECOMENDADO)

**1. Organization Schema (CRÍTICO)**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "BROWN Piscinas & Jardines",
  "description": "...",
  "url": "https://brownpiscinasyjardines.com",
  "telephone": "+34 625 199 394",
  "email": "brownpiscinasyjardines@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Piscina, 2 1ª 18",
    "addressLocality": "Villamayor",
    "postalCode": "37185",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 40.970103,
    "longitude": -5.663539
  },
  "areaServed": ["Salamanca", "Alba de Tormes", ...],
  "image": "/brand/og-brown.jpg",
  "priceRange": "€€",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", ...],
    "opens": "09:00",
    "closes": "20:00"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 5,
    "reviewCount": 2
  }
}
```

**2. AggregateRating + Review Schema**
```json
{
  "@type": "Review",
  "reviewRating": { "@type": "Rating", "ratingValue": 5 },
  "author": { "@type": "Person", "name": "Cliente" },
  "datePublished": "2025-12-10",
  "reviewBody": "Reseña del cliente..."
}
```

**3. Service Offer Schema (MEJORADO)**
```json
{
  "@type": "Offer",
  "url": "https://brownpiscinasyjardines.com/servicios/mantenimiento-piscina",
  "price": "100",
  "priceCurrency": "EUR",
  "priceValidUntil": "2025-12-31",
  "availability": "https://schema.org/InStock",
  "seller": {
    "@type": "LocalBusiness",
    "@id": "https://brownpiscinasyjardines.com#organization"
  }
}
```

---

## 3. AEO (Answer Engine Optimization) 📱

### 3.1 Estado Actual
**Bueno:** El sitio está parcialmente optimizado para Answer Engines (Perplexity, Claude, etc.)

### 3.2 Qué es AEO
Answer Engines (como Perplexity, Claude, nuevas versiones de Google Search) buscan:
- ✅ Respuestas claras y estructuradas
- ✅ Preguntas frecuentes (FAQ Schema)
- ✅ Datos estructurados (Schema.org)
- ✅ Contenido bien formateado
- ✅ Listas y bullet points

### 3.3 Análisis AEO Actual

**Fortalezas:**
- ✅ FAQ Schema en Home ("¿Cuánto cuesta...?")
- ✅ Datos estructurados con Schema.org
- ✅ Títulos y subtítulos claros
- ✅ Descripción de servicios organizada

**Debilidades:**
- ❌ Falta LocalBusiness Schema (crítico para "servicios cerca de mí")
- ❌ Las páginas de zonas no tienen pregunta/respuesta clara
- ❌ No hay Review Schema (importantísimo para credibilidad)
- ❌ Tablas de precios sin semantic markup
- ❌ Falta "About Us" (E-E-A-T factors)

### 3.4 Optimizaciones Necesarias para AEO

**CRÍTICO - Implementar:**

1. **LocalBusiness Schema en layout.tsx** (global)
   - Nombre, dirección, teléfono, email
   - Horarios de apertura
   - Geolocalización
   - Ratings y reviews

2. **Expandir FAQ en Servicios**
   ```
   ¿Cuánto cuesta el servicio?
   ¿Cuál es la frecuencia recomendada?
   ¿Cuál es la zona de cobertura?
   ¿Ofrecen garantía?
   ```

3. **Agregar Reviews Schema**
   - Desde Google Places (INTEGRADO parcialmente)
   - Desde OpinionesClient.tsx

4. **Mejorar páginas de Zonas**
   ```
   ¿Trabajáis en {zona}?
   → Sí, incluida en nuestro área de cobertura
   
   ¿Cuánto cuesta en {zona}?
   → Desde X €/mes (mismos precios que en Salamanca)
   ```

---

## 4. PALABRAS CLAVE & CONTENIDO

### 4.1 Keywords Actuales (Metadatos)
```
Globales: piscinas, jardines, mantenimiento, Salamanca, limpieza, 
          desbroce, césped, setos

Por Servicio: (dinámico, derivado del nombre)
Por Zona: "en {zona}" + servicios
```

### 4.2 Recomendaciones de Keywords

**CORTO PLAZO (Local Focus):**
- "mantenimiento piscina Salamanca"
- "jardinería profesional Salamanca"
- "corte de césped Salamanca"
- "limpieza piscina Villamayor"
- "desbroce terrenos Salamanca"

**LARGO PLAZO (Expandir):**
- "empresa mantenimiento piscinas provincia Salamanca"
- "jardinería piscinas Villamayor"
- "servicio puntual piscina"

### 4.3 Content Gaps (Mejorar Ranking)

**Falta crear:**
1. Blog/Recursos (Ej: "Guía de mantenimiento de piscinas")
2. "Por qué elegir BROWN"
3. "Galería de trabajos antes/después"
4. "Testimonios detallados" (ahora solo números)
5. "Preguntas frecuentes" más exhaustivas

---

## 5. ESTADO DE GOOGLE BUSINESS PROFILE

**Configuración Necesaria:**

```
✓ Nombre: BROWN Piscinas & Jardines
✓ Categoría: Home Services > Piscina & Spa Services
✓ Dirección: Calle Piscina, 2 1ª 18, Villamayor, 37185
✓ Teléfono: +34 625 199 394
✓ Horario: Mo-Sa 09:00-20:00
✓ Servicios: Mantenimiento piscina, Jardín, etc.
✓ Área de servicio: 11 municipios
✓ Fotos: Trabajos realizados
✓ Reviews: Link a Google Places
✓ Website: brownpiscinasyjardines.com
```

**Acción:** Verificar en https://business.google.com

---

## 6. SITEMAP & ROBOTS.TXT

**Estado:** ✅ IMPLEMENTADO

```
✓ sitemap.ts → genera XML dinámico
✓ robots.ts → basic ruleset
✓ Canonical URLs ✓
```

**Mejora:** Asegurar que `robots.txt` y `sitemap.xml` en `/public` redirigen a rutas generadas

---

## 7. CHECKLIST DE IMPLEMENTACIÓN

### Prioridad 1 (ESTA SEMANA):
- [ ] Agregar `LocalBusinessSchema` en `layout.tsx`
- [ ] Expandir FAQ en páginas de servicios
- [ ] Implementar `Review Schema` desde OpinionesClient
- [ ] Optimizar títulos con keywords geográficas
- [ ] Verificar Google Business Profile

### Prioridad 2 (PRÓXIMO MES):
- [ ] Crear landing page "Sobre nosotros" (E-E-A-T)
- [ ] Agregar galería de trabajos con descripciones
- [ ] Expandir FAQ por zona
- [ ] Mejorar vínculos internos
- [ ] Testing con Google Search Console

### Prioridad 3 (LARGO PLAZO):
- [ ] Blog de mantenimiento/tips
- [ ] Video testimonios
- [ ] Case studies por servicio
- [ ] Comparativas: nosotros vs competencia

---

## 8. HERRAMIENTAS PARA VALIDAR

```
SEO:
  - Google Search Console
  - Google PageSpeed Insights
  - Semrush
  
Schema:
  - Google Rich Results Test
  - Schema.org Validator
  
AEO:
  - Perplexity.ai (probar en tu sitio)
  - Claude (pronto integración)
  
Local SEO:
  - Google Business Profile
  - Local SEO Checklist (Moz)
```

---

## 9. SUMMARY ACTUAL

| Aspecto | Estado | Score |
|---------|--------|-------|
| Metadatos Técnicos | ✅ Completo | 9/10 |
| Schema.org | ⚠️ Básico | 6/10 |
| Local SEO | ⚠️ Parcial | 5/10 |
| AEO | ⚠️ Bajo | 4/10 |
| Performance | ✅ Excelente | 9/10 |
| Mobile | ✅ Responsive | 9/10 |
| Contenido | ⚠️ Funcional | 7/10 |
| **TOTAL** | **✅ BUENO** | **7.1/10** |

---

## 10. RECOMENDACIÓN FINAL

**ESTADO:** Listo para producción con mejoras SEO/AEO recomendadas

**IMPLEMENTAR PRIMERO:**
1. LocalBusiness Schema (máximo impacto SEO local)
2. Review Schema (credibilidad + AEO)
3. Optimizar FAQ por servicio (contenido AEO)
4. Google Business Profile (visibilidad local)

Después de producción, focalizar en:
- Contenido de mayor valor (blog, guías)
- Vínculos internos mejorados
- Testing continuo en Google Search Console
