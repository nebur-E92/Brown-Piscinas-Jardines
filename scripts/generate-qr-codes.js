#!/usr/bin/env node

/**
 * Script para generar códigos QR para todas las zonas
 * Usa la librería qrcode
 * Uso: node scripts/generate-qr-codes.js
 */

const fs = require('fs');
const path = require('path');

// Zonas de QR definidas en lib/seo.ts
const LOCATIONS = [
  { slug: "salamanca", name: "Salamanca" },
  { slug: "alba-de-tormes", name: "Alba de Tormes" },
  { slug: "carbajosa", name: "Carbajosa de la Sagrada" },
  { slug: "villamayor", name: "Villamayor" },
  { slug: "santa-marta", name: "Santa Marta de Tormes" },
  { slug: "castellanos-de-villiquera", name: "Castellanos de Villiquera" },
  { slug: "cabrerizos", name: "Cabrerizos" },
  { slug: "monterrubio-de-armuña", name: "Monterrubio de Armuña" },
  { slug: "la-rad", name: "Urb. La Rad" },
  { slug: "los-cisnes", name: "Urb. Los Cisnes" },
  { slug: "calzada-de-vandunciel", name: "Calzada de Vandunciel" },
];

const EXTRA_WHITELIST = ["flyer-enero", "flyer-verano", "web-home", "cartel-piscina", "cartel-jardin"];

// Detectar dominio (local o producción)
const isDev = process.env.NODE_ENV !== 'production';
const domain = isDev ? 'http://localhost:3001' : 'https://brownpiscinasyjardines.com';

async function generateQRCodes() {
  try {
    const QRCode = require('qrcode');
    const outputDir = path.join(__dirname, '../public/qr-codes');
    
    // Crear carpeta si no existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const allSlugs = [...LOCATIONS.map(l => l.slug), ...EXTRA_WHITELIST];
    
    console.log(`Generando ${allSlugs.length} códigos QR...`);
    
    for (const slug of allSlugs) {
      const qrUrl = `${domain}/qr/${slug}`;
      const outputPath = path.join(outputDir, `${slug}.png`);
      
      await QRCode.toFile(outputPath, qrUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
      });
      
      console.log(`✓ QR generado: ${slug}.png (${qrUrl})`);
    }

    // Generar JSON con información de los QR codes
    const qrInfo = allSlugs.map(slug => ({
      slug,
      name: LOCATIONS.find(l => l.slug === slug)?.name || slug,
      url: `${domain}/qr/${slug}`,
      qrPath: `/qr-codes/${slug}.png`,
    }));

    fs.writeFileSync(
      path.join(outputDir, 'qr-codes.json'),
      JSON.stringify(qrInfo, null, 2)
    );

    console.log(`\n✅ Códigos QR generados exitosamente en: ${outputDir}`);
    console.log(`\nPara descargar individualmente, accede a:
  /qr-codes/{slug}.png
  
Ejemplos:
  /qr-codes/salamanca.png
  /qr-codes/alba-de-tormes.png
  /qr-codes/flyer-enero.png
    `);

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Error: librería "qrcode" no instalada.');
      console.error('Instálala con: npm install qrcode --save-dev');
      process.exit(1);
    }
    throw error;
  }
}

generateQRCodes().catch(err => {
  console.error('Error generando QR codes:', err);
  process.exit(1);
});
