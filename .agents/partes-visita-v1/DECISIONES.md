# Decisiones — Partes de visita v1

## Estado

Ocho decisiones técnicas aprobadas por Rubén el 2026-07-17.
Plan v2 aprobado posteriormente en sesión manual. Código autorizado e implementado.

La especificación funcional y las reglas de `AGENTS.md` son vinculantes. Las
propuestas de `RONDAS.md` no lo son hasta que Rubén las acepte y queden
registradas aquí.

## Registro

| ID | Fecha | Decisión | Estado |
|---|---|---|---|
| D1 | 2026-07-17 | Numeración sin huecos; número provisional hasta cerrar | Aprobada |
| D2 | 2026-07-17 | Equivalencia visual alta, no pixel-perfect | Aprobada |
| D3 | 2026-07-17 | Render PDF con @react-pdf/renderer | Aprobada |
| D4 | 2026-07-17 | Firma del técnico como base64 en BD | Aprobada |
| D5 | 2026-07-17 | PDF bajo demanda, datos en BD, copia manual en Drive | Aprobada |
| D6 | 2026-07-17 | Mediciones y actuaciones como JSONB en partes_versiones | Aprobada |
| D7 | 2026-07-17 | Extender propiedades (no crear tabla instalaciones) | Aprobada |
| D8 | 2026-07-17 | @react-pdf/renderer autorizada, sujeta a prueba de build | Aprobada |

## Detalle

### D1 — Numeración de temporada sin huecos

Número provisional al crear el borrador. Se recalcula y confirma al cerrar
(marcar como enviada). Los borradores eliminados no dejan huecos en la
secuencia final de partes enviados.

Implica: la numeración definitiva se asigna en una transacción al cambiar
estado a `enviada`, no al crear el borrador.

### D2 — Equivalencia visual alta

El PDF generado debe reproducir la estructura, secciones, orden y estilo
general del parte v1.1 (cabecera BROWN, tablas, casillas). No se exige
coincidencia pixel-perfect con la plantilla original. El criterio de
aceptación es reconocimiento visual inmediato como "parte BROWN".

### D3 — @react-pdf/renderer

Render completo del PDF con componentes React. No overlay sobre la plantilla
binaria. Coherente con D2 (equivalencia visual alta, no pixel-perfect).

### D4 — Firma base64 en BD

La firma del técnico se almacena como texto base64 en `panel_users`. Se copia
al `snapshot_datos_fijos` de cada versión de parte al generarla. No se
almacena en el filesystem ni en `public/`.

### D5 — PDF bajo demanda, datos en BD, copia manual en Drive

- La web conserva los **datos estructurados** (versiones, mediciones,
  actuaciones, snapshot) como fuente de verdad.
- El PDF **no se almacena** como binario en la BD ni en almacenamiento de
  objetos.
- El PDF se **genera bajo demanda** desde el snapshot inmutable.
- El técnico guarda una **copia manual** en Google Drive mediante
  compartir/descargar. Sin integración con la API de Google Drive en v1.

### D6 — JSONB para mediciones y actuaciones

`mediciones` y `actuaciones` son campos JSONB dentro de `partes_versiones`.
No tablas normalizadas separadas. Son parte del snapshot inmutable.

El `catalogo_actuaciones` sí es tabla maestra independiente (dato, no código).

### D7 — Extender propiedades

Se añaden columnas a la tabla `propiedades` existente (`ref_servicio`,
`tipo_cliente`, `tecnico_id`, `contexto_equipo`). No se crea una tabla
`instalaciones` separada.

### D8 — @react-pdf/renderer autorizada

Dependencia aprobada para incorporar al proyecto. La aprobación definitiva
queda sujeta a que pase la prueba de build (`npm run build`) sin errores.
