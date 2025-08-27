# Brown – Next.js Ready (v1.0.1)

- Next.js 14 (App Router) + TailwindCSS 3 + TypeScript
- Imágenes WebP optimizadas en /public/images
- PDFs en /public/docs con nombres ASCII para evitar errores
- CTA hace scroll a #contacto
- Form con mailto si no hay Formspree
- WhatsApp flotante configurable por env

## Arranque
```
npm install
npm run dev
```

## .env.local (opcional)
```
NEXT_PUBLIC_FORMSPREE_ID=xxxxxxxx
NEXT_PUBLIC_WA_NUMBER=346XXXXXXXX
```
