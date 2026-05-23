#!/usr/bin/env tsx
/**
 * Crea el usuario panel de Rubén y datos de ejemplo.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/seed-panel.ts
 *
 * Requiere: PANEL_DATABASE_URL y PANEL_JWT_SECRET en .env.local
 * El schema debe existir: psql $PANEL_DATABASE_URL -f scripts/schema-panel.sql
 */

import postgres from "postgres";
import { hashSync } from "bcryptjs";

const EMAIL    = "ruben@brownpiscinasyjardines.com";
const PASSWORD = "Brown2024!"; // Cambia esto tras el primer login

async function main() {
  const sql = postgres(process.env.PANEL_DATABASE_URL!, { prepare: false });

  console.log("\n🌱 Seed panel BROWN\n");

  // ── 1. Panel user ───────────────────────────────────────────────────────────
  const hash = hashSync(PASSWORD, 12);
  await sql`
    INSERT INTO panel_users (email, password_hash)
    VALUES (${EMAIL}, ${hash})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${hash}
  `;
  console.log(`✅ Usuario creado: ${EMAIL} / ${PASSWORD}`);

  // ── 2. Clientes de ejemplo ──────────────────────────────────────────────────
  const clientes = [
    { nombre: "García López, Ana",   telefono: "625000001", municipio: "Salamanca",         direccion: "C/ Mayor 12" },
    { nombre: "Rodríguez Pérez, José", telefono: "625000002", municipio: "Villamayor",       direccion: "Urb. Los Pinos 3" },
    { nombre: "Martínez Ruiz, Carmen", telefono: "625000003", municipio: "Carbajosa de la Sagrada", direccion: "Av. Principal 5" },
    { nombre: "Sánchez Torres, Luis",  telefono: "625000004", municipio: "Cabrerizos",        direccion: "C/ del Río 8" },
  ];

  const clienteIds: string[] = [];
  for (const c of clientes) {
    const [row] = await sql`
      INSERT INTO clientes (nombre, telefono, municipio, direccion)
      VALUES (${c.nombre}, ${c.telefono}, ${c.municipio}, ${c.direccion})
      ON CONFLICT DO NOTHING
      RETURNING id
    `;
    if (row) clienteIds.push(row.id);
  }
  console.log(`✅ ${clienteIds.length} clientes creados`);

  // ── 3. Propiedades de ejemplo ───────────────────────────────────────────────
  if (clienteIds.length >= 4) {
    const propiedades = [
      { cliente_id: clienteIds[0], tipo: "combinado",  tamano_jardin: "mediano",  tamano_piscina: "pequeno", precio_acordado: 255 },
      { cliente_id: clienteIds[1], tipo: "piscina",    tamano_piscina: "mediano", precio_acordado: 135 },
      { cliente_id: clienteIds[2], tipo: "jardin",     tamano_jardin: "grande",   precio_acordado: 205 },
      { cliente_id: clienteIds[3], tipo: "combinado",  tamano_jardin: "pequeno",  tamano_piscina: "pequeno", precio_acordado: 205 },
    ];

    const propIds: string[] = [];
    for (const p of propiedades) {
      const [row] = await sql`
        INSERT INTO propiedades
          (cliente_id, tipo, tamano_jardin, tamano_piscina, precio_acordado)
        VALUES
          (${p.cliente_id}, ${p.tipo}::tipo_propiedad,
           ${(p as { tamano_jardin?: string }).tamano_jardin ?? null}::tamano_prop,
           ${(p as { tamano_piscina?: string }).tamano_piscina ?? null}::tamano_prop,
           ${p.precio_acordado})
        RETURNING id
      `;
      if (row) propIds.push(row.id);
    }
    console.log(`✅ ${propIds.length} propiedades creadas`);

    // ── 4. Visitas de ejemplo ─────────────────────────────────────────────────
    const hoy = new Date();
    const offset = (days: number) => {
      const d = new Date(hoy);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    const visitas = [
      { propiedad_id: propIds[0], tipo: "mantenimiento", fecha: offset(-14), estado: "completada", precio: 255 },
      { propiedad_id: propIds[1], tipo: "mantenimiento", fecha: offset(-7),  estado: "completada", precio: 135 },
      { propiedad_id: propIds[2], tipo: "mantenimiento", fecha: offset(-7),  estado: "completada", precio: 205 },
      { propiedad_id: propIds[3], tipo: "puntual",       fecha: offset(-3),  estado: "completada", precio: 110 },
      { propiedad_id: propIds[0], tipo: "mantenimiento", fecha: offset(0),   estado: "programada", precio: 255 },
      { propiedad_id: propIds[1], tipo: "mantenimiento", fecha: offset(2),   estado: "programada", precio: 135 },
      { propiedad_id: propIds[2], tipo: "mantenimiento", fecha: offset(3),   estado: "programada", precio: 205 },
      { propiedad_id: propIds[3], tipo: "mantenimiento", fecha: offset(7),   estado: "programada", precio: 205 },
      { propiedad_id: propIds[0], tipo: "setos",         fecha: offset(10),  estado: "programada", precio: null },
    ];

    for (const v of visitas) {
      await sql`
        INSERT INTO visitas (propiedad_id, tipo, fecha, estado, precio)
        VALUES (
          ${v.propiedad_id}, ${v.tipo}::tipo_visita, ${v.fecha}::date,
          ${v.estado}::estado_visita, ${v.precio}
        )
      `;
    }
    console.log(`✅ ${visitas.length} visitas creadas`);
  }

  console.log("\n✅ Seed completado");
  console.log(`   Login: ${EMAIL}`);
  console.log(`   Pass:  ${PASSWORD}\n`);

  await sql.end();
}

main().catch((err) => {
  console.error("❌", err.message ?? err);
  process.exit(1);
});
