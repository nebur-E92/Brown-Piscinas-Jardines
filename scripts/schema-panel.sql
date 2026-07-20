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

ALTER TABLE visitas
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT;

ALTER TABLE visitas ALTER COLUMN propiedad_id DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'visitas_ancla_xor'
  ) THEN
    ALTER TABLE visitas
      ADD CONSTRAINT visitas_ancla_xor
      CHECK ((cliente_id IS NOT NULL) <> (propiedad_id IS NOT NULL));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_visitas_cliente ON visitas(cliente_id);

CREATE OR REPLACE VIEW visitas_con_cliente AS
SELECT
  v.*,
  COALESCE(v.cliente_id, p.cliente_id) AS eff_cliente_id,
  c.nombre AS cliente_nombre,
  COALESCE(p.municipio, c.municipio) AS eff_municipio
FROM visitas v
LEFT JOIN propiedades p ON p.id = v.propiedad_id
LEFT JOIN clientes c ON c.id = COALESCE(v.cliente_id, p.cliente_id);

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

ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visita_id UUID REFERENCES visitas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gestionada_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reservas_visita ON reservas(visita_id);
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(cliente_id);

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

-- ============================================================
-- MÓDULO: PARTES DE VISITA (v1)
-- Añadido: 2026-07-17
-- ============================================================

-- Extensión de propiedades: campos para partes de visita
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS ref_servicio TEXT,
  ADD COLUMN IF NOT EXISTS tipo_cliente TEXT
    CHECK (tipo_cliente IS NULL OR tipo_cliente = ANY(
      ARRAY['particular', 'comunidad', 'casa_rural'])),
  ADD COLUMN IF NOT EXISTS tecnico_id UUID REFERENCES panel_users(id),
  ADD COLUMN IF NOT EXISTS contexto_equipo TEXT;

-- Extensión de panel_users: perfil del técnico
ALTER TABLE panel_users
  ADD COLUMN IF NOT EXISTS nombre_profesional TEXT,
  ADD COLUMN IF NOT EXISTS firma_base64 TEXT;

-- Catálogo de actuaciones (dato maestro, no código)
CREATE TABLE IF NOT EXISTS catalogo_actuaciones (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambito TEXT NOT NULL CHECK (ambito = ANY(ARRAY['piscina', 'jardin'])),
  nombre TEXT NOT NULL,
  orden  SMALLINT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogo_act_ambito_nombre
  ON catalogo_actuaciones(ambito, nombre) WHERE activo = true;

-- Partes de visita (identidad lógica)
CREATE TABLE IF NOT EXISTS partes_visita (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id      UUID NOT NULL REFERENCES propiedades(id) ON DELETE RESTRICT,
  visita_id         UUID REFERENCES visitas(id) ON DELETE SET NULL,
  anio              SMALLINT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
  numero_temporada  SMALLINT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partes_num_temporada
  ON partes_visita(propiedad_id, anio, numero_temporada)
  WHERE numero_temporada IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_partes_visita_unica
  ON partes_visita(visita_id) WHERE visita_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_partes_visita_propiedad
  ON partes_visita(propiedad_id);

-- Estados de versión de parte
DO $$ BEGIN
  CREATE TYPE estado_parte AS ENUM ('borrador', 'finalizado', 'enviada', 'archivada');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Versiones de parte (documento inmutable una vez enviado)
CREATE TABLE IF NOT EXISTS partes_versiones (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parte_id             UUID NOT NULL REFERENCES partes_visita(id) ON DELETE CASCADE,
  version              SMALLINT NOT NULL DEFAULT 1,
  estado               estado_parte NOT NULL DEFAULT 'borrador',
  fecha                DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada         TIMESTAMPTZ,
  hora_salida          TIMESTAMPTZ,
  mediciones           JSONB NOT NULL DEFAULT '[]'::jsonb,
  actuaciones          JSONB NOT NULL DEFAULT '[]'::jsonb,
  estado_agua          TEXT,
  estado_liner         TEXT,
  estado_equipos       TEXT,
  estado_jardin        TEXT,
  cierre_preventivo    BOOLEAN NOT NULL DEFAULT false,
  cierre_motivo        TEXT,
  incidencias          TEXT,
  recomendaciones      TEXT,
  stock_titular        TEXT,
  restos_vegetales     TEXT,
  snapshot_datos_fijos  JSONB,
  enviada_at           TIMESTAMPTZ,
  plantilla_version    TEXT NOT NULL DEFAULT 'v1.1',
  corrige_version_id   UUID REFERENCES partes_versiones(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parte_id, version),
  CHECK (
    (estado NOT IN ('finalizado', 'enviada'))
    OR (snapshot_datos_fijos IS NOT NULL)
  ),
  CHECK (
    (estado != 'enviada') OR (enviada_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partes_ver_borrador_unico
  ON partes_versiones(parte_id) WHERE estado = 'borrador';

CREATE INDEX IF NOT EXISTS idx_partes_versiones_parte
  ON partes_versiones(parte_id);
CREATE INDEX IF NOT EXISTS idx_partes_versiones_estado
  ON partes_versiones(estado);

-- Trigger: impedir UPDATE en versiones enviadas o archivadas
CREATE OR REPLACE FUNCTION partes_versiones_inmutable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IN ('enviada', 'archivada') THEN
    RAISE EXCEPTION 'No se puede modificar una versión con estado % (id=%)',
      OLD.estado, OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partes_versiones_no_update ON partes_versiones;
CREATE TRIGGER trg_partes_versiones_no_update
  BEFORE UPDATE ON partes_versiones
  FOR EACH ROW
  EXECUTE FUNCTION partes_versiones_inmutable();

-- Trigger: impedir DELETE en versiones enviadas o archivadas
CREATE OR REPLACE FUNCTION partes_versiones_no_delete_enviada()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IN ('enviada', 'archivada') THEN
    RAISE EXCEPTION 'No se puede eliminar una versión con estado % (id=%)',
      OLD.estado, OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partes_versiones_no_delete ON partes_versiones;
CREATE TRIGGER trg_partes_versiones_no_delete
  BEFORE DELETE ON partes_versiones
  FOR EACH ROW
  EXECUTE FUNCTION partes_versiones_no_delete_enviada();

-- Trigger: validar coherencia visita/propiedad
CREATE OR REPLACE FUNCTION partes_visita_check_propiedad()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visita_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM visitas
      WHERE id = NEW.visita_id AND propiedad_id = NEW.propiedad_id
    ) THEN
      RAISE EXCEPTION 'La visita % no pertenece a la propiedad %',
        NEW.visita_id, NEW.propiedad_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partes_visita_check ON partes_visita;
CREATE TRIGGER trg_partes_visita_check
  BEFORE INSERT OR UPDATE ON partes_visita
  FOR EACH ROW
  EXECUTE FUNCTION partes_visita_check_propiedad();
