-- Panel de gestión BROWN Piscinas & Jardines
-- Ejecutar en Neon: psql $PANEL_DATABASE_URL -f scripts/schema-panel.sql

-- ── Panel users (solo Rubén) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panel_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login    TIMESTAMPTZ
);

-- ── Clientes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre    TEXT NOT NULL,
  telefono  TEXT,
  email     TEXT,
  municipio TEXT,
  direccion TEXT,
  notas     TEXT,
  activo    BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Propiedades (cada cliente puede tener varias) ────────────────────────────
CREATE TYPE IF NOT EXISTS tipo_propiedad AS ENUM ('jardin', 'piscina', 'combinado');
CREATE TYPE IF NOT EXISTS tamano_prop    AS ENUM ('pequeno', 'mediano', 'grande');

CREATE TABLE IF NOT EXISTS propiedades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  tipo            tipo_propiedad NOT NULL,
  tamano_jardin   tamano_prop,
  tamano_piscina  tamano_prop,
  municipio       TEXT,
  direccion       TEXT,
  precio_acordado NUMERIC(8,2),
  notas           TEXT,
  activa          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_propiedades_cliente ON propiedades(cliente_id);

-- ── Visitas ───────────────────────────────────────────────────────────────────
CREATE TYPE IF NOT EXISTS estado_visita AS ENUM ('programada', 'completada', 'cancelada');
CREATE TYPE IF NOT EXISTS tipo_visita   AS ENUM ('mantenimiento', 'puntual', 'desbroce', 'setos', 'puesta_marcha', 'otro');

CREATE TABLE IF NOT EXISTS visitas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE RESTRICT,
  tipo         tipo_visita   NOT NULL DEFAULT 'mantenimiento',
  fecha        DATE          NOT NULL,
  estado       estado_visita NOT NULL DEFAULT 'programada',
  precio       NUMERIC(8,2),
  notas        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitas_fecha       ON visitas(fecha);
CREATE INDEX IF NOT EXISTS idx_visitas_propiedad   ON visitas(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_visitas_estado_fecha ON visitas(estado, fecha);
