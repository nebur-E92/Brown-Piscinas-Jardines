# Rondas — Partes de visita v1

## T-001 — CODEX — 2026-07-17

**Entrada:** especificación funcional v1.0, plantilla PDF v1.1, parte real de
Doñinos y codebase actual.

**Alcance:** primera lectura técnica y propuesta de arquitectura para revisión
de Claude. No es un plan de implementación y no autoriza cambios de código.

### 1. Lectura del problema

El módulo no debe ser un editor de PDF. Debe registrar una intervención técnica
estructurada, conservar su historial y renderizar una salida estable. El PDF
limpio y el caso real confirman una plantilla fija de dos páginas y siete
secciones.

Hay una colisión de vocabulario importante: el sistema ya llama `visitas` a las
entradas de agenda. La nueva funcionalidad también habla de "registro de
visita", pero añade contenido técnico, autosave, versiones e inmutabilidad. No
conviene cargar todos esos conceptos en la tabla actual.

### 2. Límite de dominio propuesto

1. Mantener `visitas` como agenda y orden de trabajo.
2. Mantener `propiedades` como entidad instalación; extenderla, no crear una
   entidad paralela.
3. Crear `partes_visita` como agregado técnico ligado obligatoriamente a una
   `propiedad` y, cuando proceda, a una `visita` planificada.
4. Separar el parte lógico de sus versiones para que una corrección no mutile
   el documento enviado.

Relación propuesta:

```text
cliente
  └── propiedad/instalación
        ├── visitas de agenda
        └── parte_visita
              └── parte_version 1..n
                    ├── mediciones
                    └── actuaciones
```

Una visita puntual sin propiedad puede seguir existiendo en agenda, pero no
debe generar parte técnico v1 porque carece de instalación y datos fijos.

### 3. Modelo de datos inicial

Propuesta para que Claude la someta a crítica:

- Extender `propiedades` con referencia de servicio, tipo de cliente, técnico
  asignado y contexto de equipo.
- Extender `panel_users` con nombre profesional y firma. La firma no debe vivir
  en una carpeta pública.
- `partes_visita`: identidad lógica, propiedad, visita de agenda opcional, año y
  número de temporada.
- `partes_versiones`: número de versión, estado, fecha, horas, estados
  generales, incidencias, recomendaciones, stock, fecha de envío, versión de
  plantilla y snapshot de los datos fijos usados para generar el documento.
- `catalogo_actuaciones`: lista ordenada por ámbito (`piscina` o `jardin`) para
  cumplir que las actuaciones sean dato y no código.
- `parte_actuaciones`: estado `si/no/na` y detalle por versión.
- `parte_mediciones`: código de parámetro, valor, opción textual y observación
  por versión. Este formato facilita la tabla histórica sin añadir una columna
  por parámetro.

El snapshot por versión es necesario: si después cambia la dirección, la
referencia, el técnico o la firma, un parte enviado debe seguir reproduciendo
exactamente el contenido histórico.

La inmutabilidad no debería descansar solo en la interfaz. Las API deben
rechazar cualquier cambio sobre una versión enviada y conviene valorar una
protección adicional en base de datos.

### 4. Estados y numeración

La agenda y el parte necesitan estados distintos:

- `visitas`: programada, completada, cancelada.
- `partes_versiones`: borrador, enviada, archivada.

"Cerrar visita" puede capturar la hora de salida y marcar la visita de agenda
como completada, mientras el parte sigue editable como borrador. "Marcar como
enviado" inmoviliza la versión.

La numeración de temporada no debe contar borradores eliminados. Propongo
calcularla al crear el borrador con base en partes cerrados de la misma
instalación y año, y validarla de nuevo al cerrar dentro de una transacción. Se
necesita una restricción única para evitar duplicados. Claude debe revisar esta
semántica porque la especificación pide mostrar el número desde la creación,
pero también exige corrección tras borrar borradores.

### 5. Autosave y trabajo con mala cobertura

Para v1 no parece necesario convertir toda la web en PWA. La solución mínima
fiable sería:

- estado local inmediato;
- copia del borrador en `localStorage` por ID de parte;
- guardado remoto con debounce;
- indicador visible `Guardando / Guardado / Sin conexión`;
- reintento al recuperar conexión;
- restauración local al volver a abrir el mismo borrador.

El servidor debe aceptar actualizaciones idempotentes y detectar una versión
enviada antes de escribir. Como solo hay un técnico, no hace falta resolver
edición colaborativa compleja en v1.

### 6. Generación y envío del PDF

Para lograr equivalencia visual, mi preferencia inicial es usar la plantilla
limpia como fondo y superponer datos, casillas, textos y firma con `pdf-lib`.
Esto conserva con precisión las tablas y reduce el riesgo de diferencias
visuales frente a reconstruir las dos páginas con HTML o React PDF.

El bloque de conformidad de la segunda página debe cubrirse y sustituirse por la
leyenda aprobada de 48 horas.

Propuesta de flujo:

1. Endpoint protegido genera el PDF desde una versión concreta.
2. Vista previa en el panel.
3. El cliente web obtiene el archivo y usa `navigator.share({ files })` cuando
   esté disponible.
4. Fallback: descarga del PDF.
5. La acción de compartir no marca automáticamente el parte como enviado: el
   navegador no confirma que el destinatario lo haya recibido. Debe existir una
   acción explícita "Marcar como enviado", que registra fecha y hora.

En v1 puede regenerarse el PDF desde el snapshot inmutable y una versión fija
del renderizador. Guardar el binario en almacenamiento de objetos añadiría una
infraestructura que el proyecto no tiene; Claude debe valorar si la exigencia
probatoria justifica incorporarla ya.

### 7. Interfaz propuesta

- La acción "Nueva visita" debe partir de una propiedad concreta cuando se vaya
  a emitir parte.
- La ficha de cliente debería separar las visitas puntuales de cada historial
  de instalación.
- El formulario móvil debe priorizar controles de un toque, precarga desde el
  último parte cerrado y barra de acciones fija.
- Las mediciones siempre empiezan vacías.
- Las actuaciones y estados generales se precargan desde la última versión
  cerrada de la instalación.
- El histórico de parámetros debe estar en la ficha de instalación; una tabla
  comparativa satisface v1.

### 8. Riesgos detectados

- Confundir la visita de agenda con el parte técnico puede producir estados
  imposibles y rutas ambiguas.
- Generar el PDF desde datos vivos rompería la reproducción histórica.
- Guardar la firma como asset público expondría un dato sensible.
- Confiar solo en autosave remoto no cumple el requisito de cobertura irregular.
- Marcar como enviado al abrir la hoja nativa de compartir sería una afirmación
  que el navegador no puede demostrar.
- La plantilla limpia conserva el bloque antiguo de firma del titular; no puede
  usarse sin la sustitución indicada.

### 9. Revisión solicitada a Claude

Claude debe responder específicamente:

1. ¿Es correcta la separación `visitas` / `partes_visita` /
   `partes_versiones`, o propone un agregado más simple?
2. ¿Cómo resolvería la numeración de temporada al crear y eliminar borradores?
3. ¿Prefiere overlay sobre la plantilla con `pdf-lib` o un render completo?
4. ¿Dónde almacenaría la firma y, en su caso, el PDF enviado?
5. ¿La estrategia de autosave local/remoto cubre el criterio de aceptación sin
   introducir una PWA?
6. ¿Qué invariantes deberían protegerse en SQL además de en las API?
7. ¿Qué partes de esta propuesta deben decidirse por Rubén antes de redactar el
   plan?

**Salida:** propuesta inicial documentada, sin decisiones técnicas aprobadas y
sin cambios de código.

**Siguiente actor:** CLAUDE.

## T-002 — CLAUDE — 2026-07-17

**Entrada:** T-001 de Codex con propuesta de arquitectura, especificación
funcional v1.0, schema actual, codebase y PDFs documentados.

**Alcance:** revisión crítica de la propuesta de Codex, respuestas a las 7
preguntas planteadas y listado de decisiones que Rubén debe tomar antes de
redactar el plan de implementación.

### 1. Valoración general

La propuesta de Codex es sólida y está bien orientada. La separación
`visitas` (agenda) / `partes_visita` (registro técnico) / `partes_versiones`
(inmutabilidad) es la decisión más importante y está correctamente planteada.
Coincido en lo fundamental y solo difiero en detalles de implementación.

### 2. Respuestas a las 7 preguntas de Codex

#### P1. ¿Es correcta la separación visitas/partes_visita/partes_versiones?

**Sí, con un ajuste.** La separación en tres niveles es correcta:

- `visitas` = agenda/orden de trabajo (ya existe).
- `partes_visita` = identidad lógica del parte, ligado a propiedad.
- `partes_versiones` = cada versión inmutable del documento.

Sin embargo, propongo simplificar `parte_mediciones` y `parte_actuaciones`
como **JSONB dentro de `partes_versiones`** en lugar de tablas separadas.
Razones:

1. Solo hay un técnico y un formulario. No hay queries analíticas complejas
   que justifiquen normalizar mediciones en filas.
2. Las actuaciones y mediciones son parte integral del snapshot inmutable —
   tenerlas como JSONB en la versión garantiza que el documento se
   autorreconstruye sin joins.
3. El histórico de parámetros (tabla comparativa v1) se resuelve con una
   query `jsonb_array_elements` sobre las últimas N versiones enviadas de una
   instalación — viable y suficiente para v1.
4. Menos tablas = menos migraciones, menos API, menos superficie de error.

El `catalogo_actuaciones` sí merece tabla propia: es dato maestro que debe
poder editarse sin tocar código, como exige la especificación (interés
REPTON). Pero los registros del parte son snapshot, no FK al catálogo.

**Modelo propuesto:**

```
propiedades (extendida)
  ├── ref_servicio TEXT
  ├── tipo_cliente TEXT  -- particular/comunidad/casa_rural
  ├── tecnico_id UUID → panel_users
  └── contexto_equipo TEXT

panel_users (extendida)
  ├── nombre_profesional TEXT
  └── firma_path TEXT  -- ruta interna, nunca pública

catalogo_actuaciones
  ├── id, ambito (piscina/jardin), nombre, orden, activo

partes_visita
  ├── id UUID PK
  ├── propiedad_id UUID NOT NULL → propiedades
  ├── visita_id UUID → visitas (nullable)
  ├── anio SMALLINT NOT NULL
  ├── numero_temporada SMALLINT NOT NULL
  ├── created_at, updated_at
  └── UNIQUE(propiedad_id, anio, numero_temporada)

partes_versiones
  ├── id UUID PK
  ├── parte_id UUID NOT NULL → partes_visita
  ├── version SMALLINT NOT NULL DEFAULT 1
  ├── estado estado_parte NOT NULL DEFAULT 'borrador'
  │       -- borrador / enviada / archivada
  ├── fecha DATE NOT NULL
  ├── hora_entrada TIMESTAMPTZ
  ├── hora_salida TIMESTAMPTZ
  ├── mediciones JSONB  -- [{codigo, valor, opcion, obs}]
  ├── actuaciones JSONB  -- [{nombre, ambito, estado, detalle}]
  ├── estado_agua TEXT, estado_liner TEXT, estado_equipos TEXT,
  │   estado_jardin TEXT
  ├── cierre_preventivo BOOLEAN DEFAULT false
  ├── cierre_motivo TEXT
  ├── incidencias TEXT, recomendaciones TEXT, stock_titular TEXT
  ├── restos_vegetales TEXT  -- <=150L / >150L
  ├── snapshot_datos_fijos JSONB NOT NULL
  │       -- {direccion, ref, tipo_cliente, tecnico, firma_base64}
  ├── enviada_at TIMESTAMPTZ
  ├── plantilla_version TEXT DEFAULT 'v1.1'
  ├── created_at, updated_at
  └── UNIQUE(parte_id, version)
```

#### P2. ¿Cómo resolver la numeración de temporada?

El problema: la espec pide mostrar el número desde la creación, pero también
que sea correcto tras borrar borradores.

**Propuesta: asignar al crear, no recalcular.**

1. Al crear un borrador: `MAX(numero_temporada) + 1` para esa propiedad y
   año, dentro de una transacción con `SELECT ... FOR UPDATE` sobre
   `partes_visita` de esa propiedad.
2. Si se elimina un borrador, su número **no se reutiliza**. El siguiente
   parte recibe el siguiente correlativo. Esto evita huecos visibles en los
   documentos enviados (un parte enviado como nº 5 nunca puede tener un nº 4
   posterior).
3. La constraint `UNIQUE(propiedad_id, anio, numero_temporada)` previene
   duplicados.

Aceptar huecos es la solución más simple y segura. Renumerar borradores
activos tras un borrado crearía carreras de condición y confusión si ya se
ha comunicado un número al cliente. La espec dice "recalculado por el
sistema, nunca manual" — eso se cumple: el sistema lo calcula, el técnico no
lo teclea.

**Decisión para Rubén:** ¿aceptas huecos en la numeración (ej: visita 3, 5
si la 4 se borró en borrador)? La alternativa es renumerar borradores
activos al borrar uno, pero añade complejidad.

#### P3. ¿Overlay con pdf-lib o render completo?

**Prefiero render completo con `@react-pdf/renderer`**, no overlay.

Razones contra overlay con `pdf-lib`:

1. La plantilla PDF tiene coordenadas fijas pixel a pixel. Cualquier cambio
   futuro en la plantilla (nueva sección, cambio de fuente, nueva línea)
   obliga a recalcular todas las posiciones.
2. El bloque de conformidad del titular debe sustituirse completamente por la
   leyenda de 48h. Con overlay hay que cubrir el texto existente (rectángulo
   blanco) y escribir encima — frágil y feo.
3. Los textos libres (incidencias, recomendaciones) tienen longitud variable.
   Con overlay se desbordan o se truncan; con render completo fluyen.
4. `@react-pdf/renderer` ya está en el ecosistema React/Next.js, genera en
   servidor, y permite reusar componentes React para el formulario y la
   vista previa.

Razones a favor de render completo:

1. Control total del layout — las 7 secciones del parte se replican con
   componentes React que consumen los mismos datos del snapshot.
2. Mantenible por Rubén o futuros colaboradores sin conocer las coordenadas
   de un PDF binario.
3. La validación de aceptación (comparación lado a lado con el parte real de
   Doñinos) confirma fidelidad visual independientemente del método.

**Riesgo:** lograr la equivalencia visual exacta (tablas con bordes finos,
casillas con X, tipografía monoespaciada) requiere más trabajo inicial con
`@react-pdf/renderer` que con overlay. Pero es trabajo de una sola vez que
luego se mantiene trivialmente.

**Decisión para Rubén:** ¿equivalencia visual pixel-perfect con la plantilla
actual, o equivalencia funcional (misma información, mismo orden, estética
BROWN pero no necesariamente idéntica)?

#### P4. ¿Dónde almacenar la firma y el PDF enviado?

**Firma:** en `public/` no. Opciones v1 sin infraestructura nueva:

- Opción A: Base64 en la columna `firma_path` de `panel_users` (realmente
  sería `firma_base64`). Es un dato pequeño (~10-30 KB), solo hay un
  técnico, y ya queda embebido en el snapshot de la versión.
- Opción B: Archivo en el filesystem del servidor (`.next/server/` o
  equivalente en Vercel, que es efímero). No fiable en serverless.

**Recomiendo Opción A** para v1: base64 en BD. Es la más simple, funciona en
Vercel, y la firma ya se copia al snapshot al generar cada versión.

**PDF enviado:** no almacenar el binario en v1. El PDF se regenera bajo
demanda desde el snapshot inmutable + la versión del renderizador. La
reproducibilidad está garantizada por el `snapshot_datos_fijos` y
`plantilla_version`. Almacenar binarios requiere Vercel Blob o S3 — fuera
de alcance v1.

**Decisión para Rubén:** ¿base64 de la firma en BD te parece aceptable? ¿Y
no almacenar el PDF como archivo?

#### P5. ¿Autosave local/remoto cubre el criterio sin PWA?

**Sí, con matices.** La estrategia de Codex (localStorage + debounce + retry)
es correcta y suficiente para v1. Detalle:

1. `localStorage` por `parte_version_id` como buffer ante cortes.
2. Guardado remoto con debounce (2-3 segundos).
3. Indicador `Guardado / Guardando... / Sin conexión` visible.
4. Al abrir un borrador: si hay datos locales más recientes que el servidor,
   ofrecer restaurar (no sobrescribir silenciosamente).
5. `navigator.onLine` + `online`/`offline` events para el indicador.

No es PWA, no es offline-first, pero cubre el criterio: "un borrador
interrumpido conserva los datos introducidos". El técnico vuelve a la zona
con cobertura y los datos siguen ahí.

**Un matiz importante:** el formulario debe guardar estado en React
(`useState`/`useReducer`) y solo sincronizar con localStorage y servidor. No
leer de localStorage en cada render. La fuente de verdad en sesión es el
estado React; localStorage es backup entre sesiones.

#### P6. ¿Qué invariantes proteger en SQL además de en las API?

Coincido con Codex en que la inmutabilidad no debe descansar solo en la API.
Protecciones SQL recomendadas:

1. **Trigger `BEFORE UPDATE` en `partes_versiones`:** si `OLD.estado =
   'enviada'`, rechazar el UPDATE con excepción. Esto impide que un bug en
   la API o una query manual mutile un parte enviado.
2. **Trigger `BEFORE DELETE` en `partes_versiones`:** impedir DELETE si
   `estado = 'enviada'`.
3. **CHECK constraint** en `partes_versiones`: `enviada_at IS NOT NULL` solo
   si `estado = 'enviada'`.
4. **UNIQUE(propiedad_id, anio, numero_temporada)** en `partes_visita`:
   ya mencionado.
5. **UNIQUE(parte_id, version)** en `partes_versiones`: previene versiones
   duplicadas.
6. `partes_visita.propiedad_id NOT NULL` — un parte siempre tiene
   instalación, a diferencia de una visita de agenda.

Los triggers no necesitan ser sofisticados: un `RAISE EXCEPTION` en PL/pgSQL
es suficiente. Son la última barrera de integridad.

#### P7. ¿Qué debe decidir Rubén antes del plan?

Enumero las decisiones abiertas que bloquean la redacción del plan:

### 3. Decisiones pendientes para Rubén

| # | Pregunta | Opciones | Recomendación Claude |
|---|----------|----------|---------------------|
| D1 | ¿Numeración con huecos o renumeración al borrar? | A: huecos / B: renumerar borradores activos | A: huecos |
| D2 | ¿Equivalencia visual pixel-perfect o funcional? | A: pixel-perfect / B: funcional (misma info, estilo BROWN) | B: funcional |
| D3 | ¿Render PDF con @react-pdf/renderer o overlay pdf-lib? | A: react-pdf / B: overlay | A: react-pdf (coherente con D2=B) |
| D4 | ¿Firma como base64 en BD? | A: sí / B: archivo en servidor | A: base64 |
| D5 | ¿Almacenar el PDF binario en v1? | A: sí (necesita Vercel Blob/S3) / B: no, regenerar bajo demanda | B: regenerar |
| D6 | ¿Mediciones/actuaciones como JSONB o tablas normalizadas? | A: JSONB en partes_versiones / B: tablas separadas | A: JSONB |
| D7 | ¿Extensión de `propiedades` o nueva entidad `instalaciones`? | A: extender propiedades / B: tabla nueva | A: extender |
| D8 | ¿Nombre de la dependencia PDF? | @react-pdf/renderer (BSD) — ~2.5 MB en node_modules | Confirmar |

### 4. Puntos de acuerdo con Codex (no requieren decisión)

- Separación `visitas` (agenda) / `partes_visita` / `partes_versiones`: **sí**.
- `catalogo_actuaciones` como tabla maestra: **sí**.
- Snapshot de datos fijos en cada versión: **sí**.
- Autosave localStorage + debounce + retry: **sí**.
- Inmutabilidad de versiones enviadas con triggers SQL: **sí**.
- Compartir vía `navigator.share()` + acción explícita "Marcar enviado": **sí**.
- Acción "Nueva visita" parte de propiedad cuando hay parte: **sí**.
- No PWA en v1: **sí**.

### 5. Un riesgo adicional no mencionado por Codex

La constraint XOR actual en `visitas` (`cliente_id XOR propiedad_id`) es
correcta para la agenda, pero implica que una visita de agenda con
`propiedad_id` puede generar parte, mientras que una con solo `cliente_id`
no. Esto debe documentarse claramente en la UI: el botón "Generar parte" solo
aparece si la visita tiene propiedad asociada, o se accede desde la ficha
de propiedad. No es un cambio de schema, es una regla de UI.

### Preguntas

No tengo preguntas técnicas adicionales para Codex. Las 8 decisiones listadas
son para Rubén. Con ellas resueltas, Codex y yo podemos redactar el plan de
implementación.

**Salida:** revisión técnica completada, 8 decisiones sometidas a Rubén, sin
cambios de código ni plan redactado.

**Siguiente actor:** RUBÉN.

## T-003 — CLAUDE — 2026-07-17

**Entrada:** decisiones de Rubén comunicadas verbalmente. Codex no pudo
persistirlas por fallo de sandbox. Claude registra las 8 decisiones.

**Alcance:** registro formal de decisiones en `DECISIONES.md` y transición
de estado.

### Decisiones registradas

Rubén aprobó las 8 decisiones con una modificación en D5 respecto a la
recomendación original de Claude:

| ID | Recomendación original | Decisión de Rubén |
|---|---|---|
| D1 | Huecos en numeración | **Sin huecos; número provisional hasta cerrar** |
| D2 | Funcional | **Equivalencia visual alta, no pixel-perfect** |
| D3 | @react-pdf/renderer | Confirmado |
| D4 | Firma base64 en BD | Confirmado |
| D5 | No almacenar binario, regenerar | **PDF bajo demanda; datos en BD como fuente de verdad; copia manual en Google Drive; sin API Drive en v1** |
| D6 | JSONB | Confirmado |
| D7 | Extender propiedades | Confirmado |
| D8 | Dependencia autorizada | **Sujeta a prueba de build** |

**Nota sobre D1:** la decisión de Rubén cambia la semántica. El número de
temporada se muestra como provisional en borradores y se confirma (sin
huecos) al marcar como enviada, dentro de una transacción. Esto es más
complejo que la propuesta de huecos pero garantiza una secuencia limpia en
los documentos que recibe el cliente. El plan deberá detallar la mecánica.

**Nota sobre D5:** Rubén decidió que la web conserva datos estructurados,
no el binario. El PDF se genera bajo demanda y el técnico lo guarda
manualmente en Google Drive (compartir/descargar). Esto elimina la necesidad
de Vercel Blob, S3 o BYTEA.

Las 8 decisiones están registradas en `DECISIONES.md` con detalle completo.

### Siguiente paso

El debate técnico está resuelto. El siguiente paso es la redacción de
`PLAN_IMPLEMENTACION.md`. Rubén decide quién lo redacta (Codex o Claude) y
quién lo revisa. El plan no autoriza código hasta que Rubén lo apruebe.

**Salida:** decisiones registradas, estado movido a `PLAN_EN_REDACCION`
pendiente de que Rubén asigne redactor.

**Siguiente actor:** RUBÉN.

## T-004 — CLAUDE — 2026-07-17

**Entrada:** 8 decisiones aprobadas, asignación de Rubén (Claude redacta,
Codex revisa e implementa).

**Alcance:** redacción del plan de implementación.

### Plan redactado

Creado `.agents/PLAN_IMPLEMENTACION.md` con:

- **5 fases** independientes, cada una con su commit:
  1. Schema y datos maestros (migración + seed catálogo)
  2. API de partes (10 endpoints)
  3. UI del formulario (con autosave)
  4. Generación de PDF (@react-pdf/renderer)
  5. Histórico de parámetros + campos nuevos en propiedades
- **18 archivos nuevos, 4 modificados**, con lista explícita por fase.
- Lista de archivos intocables.
- Lógica de numeración sin huecos (D1): provisional al crear, definitiva al
  enviar con `FOR UPDATE`.
- Snapshot JSONB con datos fijos + firma base64 en cada versión.
- Triggers de inmutabilidad en SQL.
- Autosave: React state → localStorage → servidor con debounce.
- Criterios de aceptación mapeados desde la especificación.

### Notas para Codex

- Las fases están diseñadas para implementarse por tramos si los tokens son
  un factor. Cada fase deja build verde.
- El stub de PDF en fase 2 permite que la UI sea funcional antes de
  implementar el render.
- La dependencia @react-pdf/renderer debe probarse en build antes de avanzar
  a fase 4 (D8). Si falla, el plan indica `pdfmake` como alternativa.

**Salida:** `PLAN_IMPLEMENTACION.md` redactado, pendiente revisión de Codex.

**Siguiente actor:** CODEX.

## T-005 — CODEX — 2026-07-17

**Entrada:** `PLAN_IMPLEMENTACION.md` v1 redactado por Claude en T-004.

**Alcance:** revisión crítica del plan. No se modifica ningún archivo ni
código. Codex no pudo escribir este turno por fallo de sandbox; Claude lo
transcribe fielmente.

### Veredicto

No aprobado. La arquitectura general es válida, pero hay 8 bloqueos que
Claude debe corregir antes de someter el plan a Rubén.

### Bloqueo 1 — Schema fuera de la fuente de verdad

El plan crea `schema-partes.sql` y declara intocable `schema-panel.sql`,
contradiciendo `AGENTS.md` línea 33 ("Fuente de verdad del schema:
`scripts/schema-panel.sql`"). Debe actualizarse `schema-panel.sql`, aunque
además pueda existir una migración separada para ejecución incremental.

### Bloqueo 2 — Numeración no funcional

Las queries `MAX`/`COUNT ... FOR UPDATE` del plan no son válidas en
PostgreSQL (FOR UPDATE requiere una tabla base, no un agregado). Además, un
número provisional con constraint `NOT NULL UNIQUE` puede colisionar entre
borradores. Debe bloquearse la fila de la instalación y asignar el número
definitivo (nullable hasta entonces) únicamente al enviar el primer parte.
Las correcciones conservan el número del parte original.

### Bloqueo 3 — Corrección e inmutabilidad se contradicen

El plan pretende convertir una versión enviada en archivada (cambiar estado
`enviada` → `archivada`), pero el trigger impide cualquier UPDATE sobre una
versión con estado `enviada`. La versión original debe permanecer intacta
con estado `enviada`; la corrección la referencia desde una fila nueva en
`partes_versiones`.

### Bloqueo 4 — Falta configuración de datos fijos

Solo existe `NuevaPropiedadForm` que crea propiedades pero no las edita.
Tampoco hay interfaz ni API para cargar nombre profesional y firma del
técnico. Sin eso no se puede preparar la instalación de Doñinos ni insertar
la firma desde el panel.

### Bloqueo 5 — Flujo PDF/envío inconsistente

El plan permite compartir el PDF antes de asignar el número definitivo. El
cliente podría recibir un documento con número provisional. Hace falta
congelar datos y número antes de producir el PDF compartible, pero registrar
`enviada_at` solo cuando Rubén confirme el envío. Probablemente requiere un
estado interno intermedio (ej: `finalizado` entre `borrador` y `enviada`).

### Bloqueo 6 — Autosave con COALESCE impide borrar valores

El patrón `COALESCE` del repo impide vaciar campos: si el técnico borra el
texto de incidencias, `COALESCE(null, old_value)` conserva el contenido
anterior. El autosave debe reemplazar el borrador completo o distinguir
explícitamente entre `null` (no enviado) y cadena vacía (borrado
intencionalmente).

### Bloqueo 7 — Faltan invariantes y versionado de PDF

Debe impedirse:
- Más de un borrador activo por parte.
- Más de un parte por visita de agenda.
- Asociación visita/instalación incorrecta (visita de propiedad A ligada a
  parte de propiedad B).

La ruta PDF debe aceptar un parámetro de versión concreta para poder
consultar versiones anteriores archivadas.

### Bloqueo 8 — Alcance de archivos y pruebas incompleto

El plan dice 14 archivos nuevos pero enumera 18. Omite `package-lock.json`,
el editor de instalación y la configuración del técnico. No hay pruebas
definidas para: numeración, inmutabilidad, precarga, recuperación local,
autenticación ni caso Doñinos. Si `@react-pdf/renderer` falla, no se puede
sustituir por `pdfmake` sin volver al comité (es un cambio de decisión D3).

### Observaciones menores

- Aclarar límites de texto y paginación en el PDF.
- Usar el logo real `public/icons/logo.svg`, no un base64 genérico.
- Evitar JSX directo dentro de `route.ts`; importar el componente PDF.

**Salida:** plan no aprobado, 8 bloqueos documentados. Sin cambios en
archivos ni código.

**Siguiente actor:** CLAUDE.

## T-006 — CLAUDE — 2026-07-17

**Entrada:** T-005 de Codex con 8 bloqueos sobre el plan v1.

**Alcance:** aceptación de los bloqueos y redacción del plan v2 corregido.

### Valoración

Los 8 bloqueos son legítimos. Acepto todos sin excepción:

1. **Schema:** correcto, `schema-panel.sql` es la fuente de verdad.
2. **Numeración:** la query era incorrecta y el UNIQUE prematuro.
3. **Inmutabilidad:** el trigger es coherente, mi flujo no lo era.
4. **Configuración:** falta evidente que impedía el caso de prueba.
5. **Flujo PDF/envío:** el estado intermedio es necesario.
6. **Autosave COALESCE:** error de diseño, no se puede reusar ese patrón.
7. **Invariantes:** omisiones reales.
8. **Conteo y pruebas:** descuido en la contabilidad y ausencia de plan de
   pruebas.

Plan v2 publicado como reescritura completa de `PLAN_IMPLEMENTACION.md`.

**Salida:** plan v2 redactado, pendiente segunda revisión de Codex.

**Siguiente actor:** CODEX.
