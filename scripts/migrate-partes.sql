-- Migración incremental: módulo partes de visita v1
-- Ejecutar sobre la BD existente: psql $PANEL_DATABASE_URL -f scripts/migrate-partes.sql
-- Idempotente: seguro ejecutar varias veces.

-- Extensión de propiedades
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS ref_servicio TEXT,
  ADD COLUMN IF NOT EXISTS tipo_cliente TEXT
    CHECK (tipo_cliente IS NULL OR tipo_cliente = ANY(
      ARRAY['particular', 'comunidad', 'casa_rural'])),
  ADD COLUMN IF NOT EXISTS tecnico_id UUID REFERENCES panel_users(id),
  ADD COLUMN IF NOT EXISTS contexto_equipo TEXT;

-- Extensión de panel_users
ALTER TABLE panel_users
  ADD COLUMN IF NOT EXISTS nombre_profesional TEXT,
  ADD COLUMN IF NOT EXISTS firma_base64 TEXT;

-- Catálogo de actuaciones
CREATE TABLE IF NOT EXISTS catalogo_actuaciones (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambito TEXT NOT NULL CHECK (ambito = ANY(ARRAY['piscina', 'jardin'])),
  nombre TEXT NOT NULL,
  orden  SMALLINT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogo_act_ambito_nombre
  ON catalogo_actuaciones(ambito, nombre) WHERE activo = true;

-- Partes de visita
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

-- Estados
DO $$ BEGIN
  CREATE TYPE estado_parte AS ENUM ('borrador', 'finalizado', 'enviada', 'archivada');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Versiones de parte
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

-- Triggers de inmutabilidad
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

-- Trigger: coherencia visita/propiedad
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
