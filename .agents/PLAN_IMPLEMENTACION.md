# Plan de implementación — Partes de visita v1

**Redactor:** Claude  
**Revisor:** Codex  
**Versión:** 2 (corrige los 8 bloqueos de T-005)  
**Fecha:** 2026-07-17  
**Estado:** APROBADO POR RUBÉN E IMPLEMENTADO  
**Decisiones vinculantes:** D1–D8 en `DECISIONES.md`

> Rubén aprobó expresamente este plan en la sesión manual tras la segunda
> revisión. La implementación fue validada posteriormente por Claude.

---

## 0. Principios

1. **Un commit por fase.** Cada fase deja `npm run build` pasando.
2. **Extender, no duplicar.** Se reusan tablas, helpers, patrones de API y
   componentes existentes.
3. **Sin refactor colateral.** No se tocan archivos fuera del alcance.
4. **Convenciones del repo:** tagged templates de `postgres.js`, `getSession()`
   en todo endpoint, `escapeHtml` para salida HTML, soft-delete en
   propiedades.
5. **Fuente de verdad del schema:** `scripts/schema-panel.sql` (AGENTS.md:33).
   Toda tabla nueva se añade ahí. Adicionalmente se crea un script de
   migración incremental para ejecutar sobre la BD existente.

---

## 1. Fases de implementación

### Fase 0 — Configuración de datos fijos (prerrequisito)

**Objetivo:** que exista UI para editar propiedades y configurar el perfil
del técnico. Sin esto no se puede preparar la instalación de Doñinos ni
insertar la firma.

#### 0.1 Editor de propiedad

`NuevaPropiedadForm.tsx` solo crea propiedades, no las edita. Crear un
componente `EditarPropiedadForm.tsx` que abra inline (mismo patrón de
expand/collapse) con los campos actuales más los nuevos de esta fase:
`ref_servicio`, `tipo_cliente`, `contexto_equipo`.

`tecnico_id` se omite de la UI de propiedad en v1 — solo hay un técnico y se
asigna por defecto. Se setea en BD directamente o se infiere del usuario
autenticado.

#### 0.2 Página de configuración del técnico

Crear `app/(panel)/panel/config/page.tsx` (Server Component) +
`_components/ConfigTecnicoForm.tsx` (Client) para editar:
- `nombre_profesional`
- `firma_base64` (subida de imagen, conversión a base64 en cliente,
  comprimida a JPEG ≤20 KB antes de enviar)

Endpoint: `app/api/panel/config/route.ts` — GET (datos del usuario
autenticado) + PATCH (actualizar nombre y firma).

#### 0.3 Archivos de la fase

| Acción | Archivo |
|--------|---------|
| Crear | `app/(panel)/panel/clientes/[id]/_components/EditarPropiedadForm.tsx` |
| Crear | `app/(panel)/panel/config/page.tsx` |
| Crear | `app/(panel)/panel/config/_components/ConfigTecnicoForm.tsx` |
| Crear | `app/api/panel/config/route.ts` |
| Modificar | `app/(panel)/panel/clientes/[id]/page.tsx` — incluir EditarPropiedadForm |
| Modificar | `app/api/panel/propiedades/route.ts` — aceptar campos nuevos en POST |
| Modificar | `app/api/panel/propiedades/[id]/route.ts` — aceptar campos nuevos en PATCH |

**No se tocan:** schema (aún no hay tablas nuevas), middleware, agenda.

---

### Fase 1 — Schema y datos maestros

**Objetivo:** migración de BD + seed del catálogo de actuaciones.

#### 1.1 Fuente de verdad

Añadir las tablas nuevas al final de `scripts/schema-panel.sql`. Además,
crear `scripts/migrate-partes.sql` como script de migración incremental
para ejecutar sobre la BD existente (solo `ALTER` + `CREATE IF NOT EXISTS`).

#### 1.2 Extensión de `propiedades`

```sql
ALTER TABLE propiedades
  ADD COLUMN IF NOT EXISTS ref_servicio TEXT,
  ADD COLUMN IF NOT EXISTS tipo_cliente TEXT
    CHECK (tipo_cliente IS NULL OR tipo_cliente = ANY(
      ARRAY['particular', 'comunidad', 'casa_rural'])),
  ADD COLUMN IF NOT EXISTS tecnico_id UUID REFERENCES panel_users(id),
  ADD COLUMN IF NOT EXISTS contexto_equipo TEXT;
```

#### 1.3 Extensión de `panel_users`

```sql
ALTER TABLE panel_users
  ADD COLUMN IF NOT EXISTS nombre_profesional TEXT,
  ADD COLUMN IF NOT EXISTS firma_base64 TEXT;
```

#### 1.4 Catálogo de actuaciones

```sql
CREATE TABLE IF NOT EXISTS catalogo_actuaciones (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambito TEXT NOT NULL CHECK (ambito = ANY(ARRAY['piscina', 'jardin'])),
  nombre TEXT NOT NULL,
  orden  SMALLINT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogo_act_ambito_nombre
  ON catalogo_actuaciones(ambito, nombre) WHERE activo = true;
```

Seed (en `scripts/seed-actuaciones.sql`):

**Piscina (orden 1-10):** limpieza skimmers, limpieza fondo, adición de
cloro, ajuste pH, algicida, floculante, revisión filtración/bomba, revisión
dosificadora, retrolavado, otros tratamientos.

**Jardín (orden 1-7):** inspección césped, corte, recorte de bordes, soplado,
retirada de restos, revisión de riego, otras.

#### 1.5 Tabla `partes_visita`

```sql
CREATE TABLE IF NOT EXISTS partes_visita (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propiedad_id      UUID NOT NULL REFERENCES propiedades(id) ON DELETE RESTRICT,
  visita_id         UUID REFERENCES visitas(id) ON DELETE SET NULL,
  anio              SMALLINT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
  numero_temporada  SMALLINT,  -- NULL hasta envío (D1: sin huecos)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- UNIQUE parcial: solo partes con número asignado (enviados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_partes_num_temporada
  ON partes_visita(propiedad_id, anio, numero_temporada)
  WHERE numero_temporada IS NOT NULL;

-- Un solo parte por visita de agenda
CREATE UNIQUE INDEX IF NOT EXISTS idx_partes_visita_unica
  ON partes_visita(visita_id) WHERE visita_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_partes_visita_propiedad
  ON partes_visita(propiedad_id);
```

**Cambio respecto a v1:** `numero_temporada` es nullable. Se asigna solo al
enviar. El UNIQUE es parcial (solo filas con número asignado). Esto elimina
la colisión entre borradores (bloqueo 2).

#### 1.6 Enum y tabla `partes_versiones`

```sql
DO $$ BEGIN
  CREATE TYPE estado_parte AS ENUM ('borrador', 'finalizado', 'enviada', 'archivada');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

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

-- Un solo borrador activo por parte
CREATE UNIQUE INDEX IF NOT EXISTS idx_partes_ver_borrador_unico
  ON partes_versiones(parte_id) WHERE estado = 'borrador';

CREATE INDEX IF NOT EXISTS idx_partes_versiones_parte
  ON partes_versiones(parte_id);
CREATE INDEX IF NOT EXISTS idx_partes_versiones_estado
  ON partes_versiones(estado);
```

**Cambios respecto a v1:**
- Estado `finalizado` añadido entre `borrador` y `enviada` (bloqueo 5).
- `corrige_version_id` referencia la versión original (bloqueo 3).
- UNIQUE parcial en borrador: un solo borrador activo por parte (bloqueo 7).
- Dos CHECK separados para claridad.

#### 1.7 Triggers de inmutabilidad

```sql
-- Impedir UPDATE en versiones enviadas o archivadas
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

-- Impedir DELETE en versiones enviadas
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

-- Validar coherencia visita/propiedad
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
```

**Cambio respecto a v1:** triggers también bloquean `archivada` (las
versiones archivadas son igualmente inmutables). Trigger de coherencia
visita/propiedad añadido (bloqueo 7).

#### 1.8 Archivos de la fase

| Acción | Archivo |
|--------|---------|
| Modificar | `scripts/schema-panel.sql` — añadir tablas nuevas al final |
| Crear | `scripts/migrate-partes.sql` — migración incremental |
| Crear | `scripts/seed-actuaciones.sql` |

---

### Fase 2 — API de partes

**Objetivo:** endpoints CRUD para partes, versiones y catálogo.

#### 2.1 Endpoints

| Método | Ruta | Función |
|--------|------|---------|
| GET | `/api/panel/catalogo-actuaciones` | Lista actuaciones activas, agrupadas por ámbito |
| GET | `/api/panel/partes?propiedad_id=X` | Partes de una instalación con última versión |
| POST | `/api/panel/partes` | Crear parte + borrador (precarga desde última visita) |
| GET | `/api/panel/partes/[id]` | Detalle con todas las versiones |
| GET | `/api/panel/partes/[id]/version/[v]` | Datos de una versión concreta |
| PUT | `/api/panel/partes/[id]` | Reemplazar borrador completo (autosave) |
| DELETE | `/api/panel/partes/[id]` | Eliminar parte (solo si todas sus versiones son borrador) |
| POST | `/api/panel/partes/[id]/finalizar` | Congelar datos → estado `finalizado` |
| POST | `/api/panel/partes/[id]/enviar` | Marcar como `enviada` (registra `enviada_at`) |
| POST | `/api/panel/partes/[id]/correccion` | Crear versión nueva que corrige la enviada |
| GET | `/api/panel/partes/[id]/pdf?version=N` | Generar PDF de una versión concreta |
| GET | `/api/panel/partes/historico?propiedad_id=X` | Histórico de parámetros |

Todos protegidos con `getSession()`.

#### 2.2 Estados y transiciones

```
borrador → finalizado → enviada
                            ↓
                         (nueva versión) → borrador → finalizado → enviada
                            ↓
                   (original queda enviada, no archivada)
```

- **borrador:** editable libremente. Eliminable.
- **finalizado:** snapshot congelado, número de temporada asignado, PDF
  generado con datos definitivos. Permite compartir el PDF antes de marcar
  como enviado. Puede revertirse a borrador si Rubén lo necesita (no está
  inmutabilizado por trigger — solo `enviada` y `archivada` lo están).
- **enviada:** inmutable. Registra `enviada_at`. El trigger impide UPDATE y
  DELETE.
- **Corrección:** se crea una **nueva fila** en `partes_versiones` con
  `version = old.version + 1`, `corrige_version_id = old.id`, estado
  `borrador`. La versión original **permanece con estado `enviada`** — no se
  archiva ni se modifica (bloqueo 3 resuelto).

#### 2.3 Lógica de numeración (D1: sin huecos)

**Al crear (POST `/api/panel/partes`):**

El borrador se crea con `numero_temporada = NULL`. El UNIQUE parcial solo
aplica a filas con número asignado, así que no hay colisión entre borradores.

**Al finalizar (POST `/api/panel/partes/[id]/finalizar`):**

```sql
BEGIN;
  -- Bloquear fila del parte para serializar
  SELECT * FROM partes_visita WHERE id = $parte_id FOR UPDATE;

  -- Contar partes con número asignado en la misma instalación+año
  SELECT COALESCE(MAX(pv.numero_temporada), 0) + 1 AS nuevo_num
  FROM partes_visita pv
  WHERE pv.propiedad_id = $propiedad_id
    AND pv.anio = $anio
    AND pv.numero_temporada IS NOT NULL;

  -- Asignar número definitivo
  UPDATE partes_visita
  SET numero_temporada = $nuevo_num, updated_at = now()
  WHERE id = $parte_id;

  -- Construir snapshot y cambiar estado
  UPDATE partes_versiones
  SET estado = 'finalizado',
      snapshot_datos_fijos = $snapshot,
      updated_at = now()
  WHERE parte_id = $parte_id AND estado = 'borrador';
COMMIT;
```

El snapshot se construye en el endpoint leyendo datos actuales de
`propiedades` + `clientes` + `panel_users`:

```json
{
  "direccion": "...",
  "ref_servicio": "260527-JD",
  "tipo_cliente": "particular",
  "tecnico_nombre": "Rubén Herrero García",
  "firma_base64": "data:image/jpeg;base64,...",
  "cliente_nombre": "...",
  "cliente_telefono": "...",
  "cliente_email": "..."
}
```

**Al enviar (POST `/api/panel/partes/[id]/enviar`):**

Solo cambia estado a `enviada` y registra `enviada_at = now()`. El número
y el snapshot ya están asignados desde `finalizar`. No hay recálculo.

**Corrección:** la nueva versión hereda el `numero_temporada` del parte
(vive en `partes_visita`, no en `partes_versiones`). No se reasigna número.

**Revertir finalización (DELETE `/api/panel/partes/[id]/finalizar` o
PATCH estado=borrador):** si Rubén finaliza por error, puede revertir a
borrador. Se libera el `numero_temporada` (SET NULL). No está bloqueado
por trigger porque `finalizado` no es inmutable.

#### 2.4 Autosave: PUT completo, no COALESCE (bloqueo 6)

El endpoint PUT `/api/panel/partes/[id]` reemplaza todos los campos
editables del borrador activo en una sola sentencia. No usa COALESCE.

```sql
UPDATE partes_versiones SET
  fecha             = $fecha,
  hora_entrada      = $hora_entrada,
  hora_salida       = $hora_salida,
  mediciones        = $mediciones::jsonb,
  actuaciones       = $actuaciones::jsonb,
  estado_agua       = $estado_agua,
  estado_liner      = $estado_liner,
  estado_equipos    = $estado_equipos,
  estado_jardin     = $estado_jardin,
  cierre_preventivo = $cierre_preventivo,
  cierre_motivo     = $cierre_motivo,
  incidencias       = $incidencias,
  recomendaciones   = $recomendaciones,
  stock_titular     = $stock_titular,
  restos_vegetales  = $restos_vegetales,
  updated_at        = now()
WHERE parte_id = $parte_id AND estado = 'borrador';
```

El cliente envía siempre el estado completo del formulario. Vaciar un campo
envía `null` o `""`, que se escribe tal cual. Esto resuelve el bloqueo 6.

Validación en el endpoint: si no existe un borrador activo para ese parte,
devolver 409 (el parte está finalizado o enviado).

#### 2.5 Precarga desde última visita

Al crear un borrador (POST), buscar la última versión `enviada` de la misma
propiedad y copiar:
- `actuaciones` (completo)
- `estado_agua`, `estado_liner`, `estado_equipos`, `estado_jardin`
- `restos_vegetales`

NO copiar: `mediciones` (siempre `[]`), `incidencias`, `recomendaciones`,
`stock_titular`, horas, fecha, cierre preventivo.

#### 2.6 Archivos de la fase

| Acción | Archivo |
|--------|---------|
| Crear | `app/api/panel/catalogo-actuaciones/route.ts` |
| Crear | `app/api/panel/partes/route.ts` |
| Crear | `app/api/panel/partes/[id]/route.ts` — GET, PUT, DELETE |
| Crear | `app/api/panel/partes/[id]/finalizar/route.ts` |
| Crear | `app/api/panel/partes/[id]/enviar/route.ts` |
| Crear | `app/api/panel/partes/[id]/correccion/route.ts` |
| Crear | `app/api/panel/partes/[id]/pdf/route.ts` — stub, implementar en fase 4 |
| Crear | `app/api/panel/partes/[id]/version/[v]/route.ts` |
| Crear | `app/api/panel/partes/historico/route.ts` |
| Crear | `lib/panel/partes.ts` — tipos, constantes, helpers |

---

### Fase 3 — UI del formulario de parte

**Objetivo:** formulario de registro de visita + listado en ficha de
instalación.

#### 3.1 Componentes

| Archivo | Tipo | Función |
|---------|------|---------|
| `app/(panel)/panel/partes/nuevo/page.tsx` | Server | Recibe `?propiedad_id`, carga datos fijos y catálogo |
| `app/(panel)/panel/partes/nuevo/_components/ParteForm.tsx` | Client | Formulario completo con autosave |
| `app/(panel)/panel/partes/[id]/page.tsx` | Server | Detalle/edición de parte existente |
| `app/(panel)/panel/partes/[id]/_components/ParteDetail.tsx` | Client | Vista de detalle + acciones |

#### 3.2 Formulario (`ParteForm.tsx`)

Secciones colapsables, coherentes con las 7 del PDF:

1. **Datos** (solo lectura: dirección, ref, tipo, técnico, nº temporada si
   asignado o "Pendiente") + fecha editable + botones hora entrada/salida.
2. **Parámetros del agua** (si tipo incluye piscina): inputs numéricos +
   select turbidez + toggle cianúrico medido/no + observaciones.
3. **Actuaciones piscina** (si aplica): lista del catálogo con toggle
   sí/no/na de un toque + campo detalle expandible.
4. **Actuaciones jardín** (si aplica): igual + select restos vegetales.
5. **Estado general**: selects para agua/liner/equipos/jardín + cierre
   preventivo con motivo condicional.
6. **Incidencias y recomendaciones**: 3 textareas.
7. **Barra de acciones** (sticky bottom): indicador de guardado + botón
   "Finalizar" (si borrador) / "Ver PDF" + "Marcar enviado" (si finalizado).

**Controles móvil-first:**
- Toggles de un toque para sí/no/na (no checkboxes tradicionales).
- Barra de acciones fija `sticky bottom-0 bg-white border-t`.
- Indicador `Guardado ✓ / Guardando… / Sin conexión`.

**Límites de texto:**
- Observaciones por parámetro: 200 caracteres.
- Detalle de actuación: 500 caracteres.
- Incidencias, recomendaciones, stock: 1000 caracteres.
- Cierre motivo: 500 caracteres.
- Indicador de caracteres restantes en textareas.

#### 3.3 Autosave

```
Estado React (useReducer)
  ↕ sync
localStorage[`parte-borrador-${versionId}`]
  ↕ debounce 2s
PUT /api/panel/partes/[id]  (reemplazo completo)
```

- Al montar: cargar del servidor. Si localStorage tiene `updated_at` más
  reciente, mostrar banner "Hay cambios locales. ¿Restaurar?".
- `navigator.onLine` + eventos `online`/`offline` para indicador.
- Al guardar OK: actualizar `updated_at` en localStorage.
- Al finalizar/enviar OK: limpiar localStorage de ese borrador.
- Si el PUT devuelve 409 (borrador ya no existe): mostrar aviso, limpiar
  localStorage, redirigir al detalle.

#### 3.4 Flujo de acciones en la UI (bloqueo 5 resuelto)

```
[Borrador]
  ├── Editar libremente
  ├── "Finalizar parte" → POST /finalizar
  │     → Congela snapshot + asigna nº temporada
  │     → Estado pasa a "finalizado"
  └── "Eliminar borrador" → DELETE

[Finalizado]
  ├── "Ver PDF" → GET /pdf?version=N (nueva pestaña)
  ├── "Compartir PDF" → navigator.share / descarga
  ├── "Marcar como enviado" → POST /enviar (con confirmación)
  │     → Registra enviada_at
  │     → Estado pasa a "enviada"
  └── "Volver a borrador" → revertir finalización
        → Libera número, borra snapshot

[Enviada]
  ├── "Ver PDF" → GET /pdf?version=N
  ├── "Compartir PDF" → descarga
  └── "Crear corrección" → POST /correccion
        → Nueva versión borrador, corrige_version_id apunta aquí
```

El PDF solo es compartible desde `finalizado` o `enviada`. Nunca desde
`borrador`. Esto garantiza que el cliente recibe un documento con número
definitivo (bloqueo 5).

#### 3.5 Integración en ficha de instalación

Modificar `app/(panel)/panel/clientes/[id]/page.tsx`:
- En cada tarjeta de propiedad, botón **"Nuevo parte"** →
  `/panel/partes/nuevo?propiedad_id=X`.
- Botón solo visible si `ref_servicio` está configurado. Si no, mostrar
  texto "Configura la referencia de servicio para crear partes".
- Debajo de la tarjeta: últimos partes (fecha, nº temporada o "—", estado
  badge, enlace al detalle).

#### 3.6 Archivos de la fase

| Acción | Archivo |
|--------|---------|
| Crear | `app/(panel)/panel/partes/nuevo/page.tsx` |
| Crear | `app/(panel)/panel/partes/nuevo/_components/ParteForm.tsx` |
| Crear | `app/(panel)/panel/partes/[id]/page.tsx` |
| Crear | `app/(panel)/panel/partes/[id]/_components/ParteDetail.tsx` |
| Modificar | `app/(panel)/panel/clientes/[id]/page.tsx` — botón + listado |

---

### Fase 4 — Generación de PDF

**Objetivo:** render del parte con `@react-pdf/renderer`.

#### 4.0 Prueba de build (D8)

Antes de implementar el PDF, instalar la dependencia y verificar que
`npm run build` pasa en local y que Vercel la acepta. Si falla, **parar y
volver al comité** — no sustituir por `pdfmake` sin aprobación (D3).

```bash
npm install @react-pdf/renderer
npm run build
```

Si hay warnings de `canvas`: añadir `"browser": { "canvas": false }` en
`package.json`.

#### 4.1 Componente PDF

| Archivo | Función |
|---------|---------|
| `lib/panel/pdf/PartePDF.tsx` | Componente React PDF, 7 secciones |
| `lib/panel/pdf/styles.ts` | StyleSheet con estética BROWN |

El componente recibe un objeto tipado con todos los datos de la versión
(snapshot + mediciones + actuaciones) y renderiza las dos páginas. No hace
fetch ni accede a BD.

**Logo:** leer `public/icons/logo.svg`, convertir a base64 en el endpoint
(no en el componente). Pasar como prop. No crear archivo `logo.ts` separado.

**Secciones del PDF:**
1. Cabecera: logo + datos del servicio + fecha + nº visita.
2. Parámetros del agua: tabla con rangos RD 742/2013 (constantes en código).
3. Actuaciones piscina: tabla con casillas X / — / N/A.
4. Actuaciones jardín: igual + restos vegetales.
5. Estado general: tabla.
6. Incidencias, recomendaciones, stock.
7. Conformidad: leyenda 48h + firma del técnico (base64 del snapshot).

**Paginación:** si incidencias/recomendaciones desbordan la segunda página,
el componente debe permitir flujo a una tercera página. `@react-pdf/renderer`
maneja esto automáticamente con `wrap`.

**Secciones no aplicables:** si el tipo de servicio no incluye piscina o
jardín, la sección se imprime con todas las casillas en N/A (no se oculta —
especificación § 7).

#### 4.2 Endpoint de generación

`app/api/panel/partes/[id]/pdf/route.ts`:

```typescript
import { renderToBuffer } from '@react-pdf/renderer';
import PartePDF from '@/lib/panel/pdf/PartePDF';

// GET /api/panel/partes/[id]/pdf?version=1
export async function GET(req, { params }) {
  // auth, cargar versión concreta o última, construir props
  const element = React.createElement(PartePDF, { data });
  const buffer = await renderToBuffer(element);
  // ...Response con Content-Type y Content-Disposition
}
```

**Sin JSX en route.ts** — usar `React.createElement` o importar una función
factory del componente. Esto evita problemas de transpilación en un archivo
que Next.js trata como API route (bloqueo observación menor).

Nombre de archivo:
`BROWN-PARTE-{ref_servicio}-{AAAAMMDD}-v{version}.pdf`

Query param `version`: si se omite, devuelve la última versión finalizada o
enviada. Si se especifica, devuelve esa versión concreta (permite consultar
versiones archivadas o anteriores — bloqueo 7).

#### 4.3 Archivos de la fase

| Acción | Archivo |
|--------|---------|
| Crear | `lib/panel/pdf/PartePDF.tsx` |
| Crear | `lib/panel/pdf/styles.ts` |
| Modificar | `app/api/panel/partes/[id]/pdf/route.ts` — implementar stub |
| Modificar | `package.json` + `package-lock.json` — dependencia |

---

### Fase 5 — Histórico de parámetros

**Objetivo:** tabla comparativa de mediciones en la ficha de instalación.

#### 5.1 Componente

Tabla con las últimas N visitas como columnas y los parámetros como filas:
cloro libre, cloro combinado, pH, temperatura, turbidez, cianúrico.

Datos: GET `/api/panel/partes/historico?propiedad_id=X`, que extrae
`mediciones` JSONB de las versiones `enviada` de esa propiedad, ordenadas
por `fecha DESC`, límite 10.

El componente es un Client Component dentro de la ficha de propiedad,
renderizado condicionalmente si la propiedad tiene tipo `piscina` o
`combinado`.

#### 5.2 Archivos de la fase

| Acción | Archivo |
|--------|---------|
| Crear | `app/(panel)/panel/clientes/[id]/_components/HistoricoParametros.tsx` |
| Modificar | `app/(panel)/panel/clientes/[id]/page.tsx` — integrar componente |

---

## 2. Resumen de archivos

### Archivos nuevos (20)

```
scripts/migrate-partes.sql
scripts/seed-actuaciones.sql
app/api/panel/config/route.ts
app/api/panel/catalogo-actuaciones/route.ts
app/api/panel/partes/route.ts
app/api/panel/partes/[id]/route.ts
app/api/panel/partes/[id]/finalizar/route.ts
app/api/panel/partes/[id]/enviar/route.ts
app/api/panel/partes/[id]/correccion/route.ts
app/api/panel/partes/[id]/pdf/route.ts
app/api/panel/partes/[id]/version/[v]/route.ts
app/api/panel/partes/historico/route.ts
app/(panel)/panel/config/page.tsx
app/(panel)/panel/config/_components/ConfigTecnicoForm.tsx
app/(panel)/panel/clientes/[id]/_components/EditarPropiedadForm.tsx
app/(panel)/panel/clientes/[id]/_components/HistoricoParametros.tsx
app/(panel)/panel/partes/nuevo/page.tsx
app/(panel)/panel/partes/nuevo/_components/ParteForm.tsx
app/(panel)/panel/partes/[id]/page.tsx
app/(panel)/panel/partes/[id]/_components/ParteDetail.tsx
lib/panel/partes.ts
lib/panel/pdf/PartePDF.tsx
lib/panel/pdf/styles.ts
```

### Archivos modificados (5)

```
scripts/schema-panel.sql      — tablas nuevas al final (fuente de verdad)
package.json                   — @react-pdf/renderer
app/(panel)/panel/clientes/[id]/page.tsx  — editor prop + listado partes + histórico
app/api/panel/propiedades/route.ts        — campos nuevos en POST
app/api/panel/propiedades/[id]/route.ts   — campos nuevos en PATCH
```

Total: **23 archivos nuevos + 5 modificados = 28 archivos**.

(`package-lock.json` se regenera automáticamente con `npm install`.)

### Archivos intocables

Todo lo no listado arriba. En particular:
- `middleware.ts` — ya protege `/panel/*` y `/api/panel/*`.
- `lib/panel/reservas.ts`, `lib/panel/rateLimit.ts`, `lib/panel/db.ts`.
- Componentes de agenda, leads, reservas.
- `NuevaPropiedadForm.tsx` — no se modifica; se crea `EditarPropiedadForm`
  aparte.

---

## 3. Convenciones técnicas

- **Queries:** tagged templates de `postgres.js`. Sin concatenación.
- **Auth:** `getSession()` al inicio de cada handler. 401 si falla.
- **Autosave (PUT):** reemplazo completo del borrador. **No usar COALESCE**
  para los endpoints de partes — ese patrón se reserva para los PATCH
  existentes de propiedades/visitas.
- **Estilos Tailwind:** cards `bg-white border rounded-xl shadow-sm`,
  botones primarios `bg-black text-white py-2 rounded-lg text-sm font-semibold`,
  badges `text-[11px] px-1.5 py-0.5 rounded-full`, labels
  `block text-xs font-medium text-neutral-600 mb-1`, inputs
  `w-full border border-neutral-300 rounded px-3 py-2 text-sm`.
- **Client components:** `"use client"` solo donde haya estado o eventos.
- **Navegación:** `router.refresh()` tras mutaciones.
- **PDF:** componente en `lib/panel/pdf/`, invocado con `React.createElement`
  desde route.ts. Logo desde `public/icons/logo.svg`.

---

## 4. Criterios de aceptación

De la especificación funcional:

1. Crear y cerrar visita rutinaria en < 2 min sin reintroducir datos fijos.
2. Nº de temporada correcto sin intervención manual, sin huecos en enviados.
3. PDF visualmente equivalente al parte v1.1 (equivalencia alta — D2).
4. Parte enviado inmutable; corrección genera versión nueva sin modificar la
   original.
5. Borrador interrumpido conserva datos (autosave localStorage).
6. Secciones piscina/jardín según tipo de servicio de la ficha.
7. Histórico de parámetros consultable en la ficha de instalación.

---

## 5. Plan de pruebas

### 5.1 Pruebas de schema (tras fase 1)

- [ ] Migración ejecuta sin errores sobre BD limpia y sobre BD existente.
- [ ] Trigger impide UPDATE en versión con estado `enviada`.
- [ ] Trigger impide DELETE en versión con estado `enviada`.
- [ ] Trigger impide UPDATE en versión con estado `archivada`.
- [ ] UNIQUE parcial impide dos partes con mismo número en misma
      propiedad+año.
- [ ] UNIQUE parcial permite múltiples borradores sin número (NULL).
- [ ] UNIQUE borrador impide dos borradores activos en el mismo parte.
- [ ] Trigger de coherencia rechaza visita de propiedad distinta.
- [ ] CHECK rechaza estado `enviada` sin `enviada_at`.
- [ ] CHECK rechaza estado `finalizado` sin `snapshot_datos_fijos`.

### 5.2 Pruebas de API (tras fase 2)

- [ ] POST crear parte: precarga actuaciones de última visita enviada.
- [ ] POST crear parte: mediciones empiezan vacías.
- [ ] PUT autosave: vaciar campo incidencias lo persiste como NULL/vacío.
- [ ] PUT autosave: devuelve 409 si no hay borrador activo.
- [ ] POST finalizar: asigna número de temporada correcto (N+1).
- [ ] POST finalizar: construye snapshot con datos actuales.
- [ ] POST enviar: registra `enviada_at`, estado pasa a `enviada`.
- [ ] POST enviar: devuelve error si no está en estado `finalizado`.
- [ ] POST corrección: crea versión nueva con `corrige_version_id`.
- [ ] POST corrección: versión original queda `enviada`, no cambia.
- [ ] DELETE parte: solo funciona si todas las versiones son borrador.
- [ ] Todos los endpoints devuelven 401 sin sesión.

### 5.3 Pruebas de UI (tras fase 3)

- [ ] Formulario carga con actuaciones precargadas de última visita.
- [ ] Autosave guarda en localStorage y servidor tras 2s.
- [ ] Desconectar red → indicador "Sin conexión" → reconectar → se envía.
- [ ] Cerrar y reabrir borrador → banner de restauración si hay datos locales.
- [ ] Botón "Finalizar" congela formulario y muestra acciones de PDF/envío.
- [ ] Botón "Nuevo parte" no aparece si falta `ref_servicio`.

### 5.4 Pruebas de PDF (tras fase 4)

- [ ] `npm run build` pasa con `@react-pdf/renderer` instalado.
- [ ] PDF se genera y descarga correctamente.
- [ ] PDF con `?version=1` devuelve versión específica.
- [ ] Secciones N/A se imprimen para servicios no contratados.
- [ ] Logo BROWN aparece en cabecera.
- [ ] Firma del técnico aparece en bloque de conformidad.
- [ ] Leyenda de 48h sustituye al bloque de firma del titular.
- [ ] Textos largos paginan correctamente.

### 5.5 Caso de aceptación: Doñinos

- [ ] Crear instalación Doñinos con ref `260527-JD`, tipo `piscina`,
      tipo_cliente `particular`.
- [ ] Configurar firma del técnico en `/panel/config`.
- [ ] Crear parte, rellenar con los datos del parte real del 08/07/2026.
- [ ] Finalizar y generar PDF.
- [ ] Comparar visualmente con el PDF original: misma información, mismo
      orden, estética reconocible como "parte BROWN".
- [ ] Marcar como enviado.
- [ ] Verificar que el parte es inmutable.
- [ ] Crear corrección: verificar nueva versión, original intacta.

---

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| `@react-pdf/renderer` falla en build | D8: probar antes de fase 4. Si falla, volver al comité (no sustituir unilateralmente) |
| `renderToBuffer` lento en serverless (cold start) | Aceptable para un solo técnico. Si es problema, cachear con CDN edge |
| Pérdida de datos por corte de cobertura | Autosave localStorage + indicador visible |
| Numeración: contención en `FOR UPDATE` | Solo un técnico — no es un problema real |
| Firma pesada en snapshot | Comprimir a JPEG ≤20 KB en cliente antes de subir |
| Textos desbordan layout del PDF | `@react-pdf/renderer` soporta wrap automático; probar con textos largos |
