#Brown Piscinas & Jardines — Web

Sitio en **Next.js 14 (App Router) + Tailwind + TypeScript**.  
Form activo (Formspree o `mailto` fallback), botón flotante de WhatsApp y SEO on-page.

---

Requisitos
- Node 18 o 20 recomendado
- npm

Desarrollo local
```bash
npm install
npm run dev
# http://localhost:3000
🧩 Estructura
python
Copiar código
app/
  components/           # Header, Hero, Services, HowWeWork, ContactForm, WhatsAppFloat, Footer
  layout.tsx            # Layout/SEO base (metadata + viewport)
  page.tsx              # Home
  globals.css
public/
  images/               # WebP optimizadas (hero & secciones)
  icons/                # logo.svg, logo-inverted.svg
  docs/                 # privacy-policy.pdf, cookies-policy.pdf, tarifas-oficiales-brown.pdf
next.config.mjs
tailwind.config.js
postcss.config.js
tsconfig.json
README.md