# Fuentes — Partes de visita v1

## Documentos funcionales

### Especificación

- Archivo: `../ESPEC-FUNCIONAL-partes-visita-v1.md`
- Versión: 1.0
- Fecha: 16/07/2026
- Función: alcance funcional y criterios de aceptación.

### Plantilla limpia

- Archivo: `../BROWN-PARTE-VISITA-v1_1.pdf`
- Páginas: 2
- SHA-256:
  `03E2AB95A777C8669C080D47688EE1C0788503C024B315320DE9E3FDEA33EAE1`
- Contenido: plantilla v1.1 sin rellenar, con siete secciones.

### Caso real de Doñinos

- Archivo: `../BROWN-PARTE-VISITA-v1_1 (1).pdf`
- Páginas: 2
- SHA-256:
  `1BAB19D77CE9F6DE5FA6D8AF0B5CA44024CE1FA7EF29EEB31D71068DCB79D009`
- Contenido: parte cumplimentado de la instalación de Doñinos, referencia
  `260527-JD`, fecha 08/07/2026.

Los PDF no son duplicados. El primero es la plantilla visual y el segundo es el
caso de aceptación real.

## Verificación visual realizada por Codex

Se revisaron las dos páginas de ambos PDF el 17/07/2026.

- La maqueta es A4, dos páginas, monocroma y basada en tablas.
- Mantiene siempre siete secciones: datos, parámetros, piscina, jardín, estado,
  incidencias y conformidad.
- El caso real confirma la convención de marcar casillas con una `X`, el uso de
  texto libre en detalles, los estados N/A y la firma insertada del técnico.
- El bloque actual de conformidad aún contiene firma del titular. La
  especificación funcional ordena sustituirlo por la leyenda de conformidad
  tácita de 48 horas.
- El PDF real permite reproducir los datos de prueba indicados en la
  especificación.

## Fuentes del codebase inspeccionadas

- `scripts/schema-panel.sql`
- `app/api/panel/visitas/route.ts`
- `app/api/panel/visitas/[id]/route.ts`
- `app/api/panel/propiedades/route.ts`
- `app/api/panel/propiedades/[id]/route.ts`
- `app/(panel)/panel/clientes/[id]/page.tsx`
- `app/(panel)/panel/agenda/page.tsx`
- `app/(panel)/panel/agenda/nueva/_components/NuevaVisitaForm.tsx`
- `middleware.ts`
- `lib/panel/db.ts`
- `package.json`

## Hechos técnicos confirmados

- `propiedades` ya representa instalaciones y admite varias por cliente.
- `visitas` ya representa trabajo planificado en agenda, con estados
  `programada`, `completada` y `cancelada`.
- Una visita puede estar anclada a una propiedad o directamente a un cliente.
- No existe infraestructura de PDF, firma, almacenamiento de documentos ni
  compartir archivos.
- El panel y sus API están protegidos por sesión.
- La ficha de cliente ya muestra propiedades e historial de visitas.
