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
DO $$ BEGIN
  CREATE TYPE tipo_propiedad AS ENUM ('jardin', 'piscina', 'combinado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tamano_prop AS ENUM ('pequeno', 'mediano', 'grande');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

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
DO $$ BEGIN
  CREATE TYPE estado_visita AS ENUM ('programada', 'completada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tipo_visita AS ENUM ('mantenimiento', 'puntual', 'desbroce', 'setos', 'puesta_marcha', 'otro');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

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

-- ── Reservas públicas ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha      DATE NOT NULL,
  franja     TEXT NOT NULL CHECK (franja = ANY (ARRAY['manana', 'tarde'])),
  tipo       TEXT NOT NULL DEFAULT 'visita_tecnica',
  servicio   TEXT,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL,
  telefono   TEXT,
  municipio  TEXT,
  notas      TEXT,
  estado     TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado = ANY (ARRAY['pendiente', 'confirmada', 'cancelada'])),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservas_fecha  ON reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);

ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS mensaje_cliente TEXT,
  ADD COLUMN IF NOT EXISTS mensaje_cliente_updated_at TIMESTAMPTZ;

-- ── Bloqueos de agenda ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bloqueos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha      DATE NOT NULL,
  franja     TEXT CHECK (franja IS NULL OR franja = ANY (ARRAY['manana', 'tarde'])),
  motivo     TEXT NOT NULL DEFAULT 'Bloqueado',
  notas      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bloqueos_fecha ON bloqueos(fecha);

-- ── Leads de contacto ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT,
  email       TEXT,
  telefono    TEXT,
  municipio   TEXT,
  servicio    TEXT,
  servicios   TEXT,
  tamano      TEXT,
  frecuencia  TEXT,
  precio      TEXT,
  mensaje     TEXT,
  qr_source   TEXT,
  estado      TEXT NOT NULL DEFAULT 'nuevo',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado);

-- ── Rate-limit persistente para endpoints públicos ──────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  rate_key   TEXT PRIMARY KEY,
  count      INTEGER NOT NULL DEFAULT 0,
  reset_at   TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
