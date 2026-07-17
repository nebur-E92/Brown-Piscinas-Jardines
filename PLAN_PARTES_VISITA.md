# Plan técnico — Módulo de Partes de Visita

**Panel de control BROWN Piscinas & Jardines**
Basado en: ESPEC. FUNCIONAL partes de visita v1 (16/07/2026)
Estado: propuesta técnica para revisión cruzada (Codex) y aprobación de Rubén.

---

## 1. Lectura del spec sobre el codebase real

El panel actual es una app Next.js 14 (App Router, TypeScript, Tailwind) en Vercel:

- **Persistencia**: `@vercel/kv` (Redis/Upstash) con fallback a ficheros
  (`lib/qrStore.ts`). No hay base de datos relacional ni ORM.
- **Autenticación**: `middleware.ts` protege `/analitica-qr` con token en
  query/cookie o HTTP Basic. No hay sistema de usuarios.
- **PDF**: no existe ninguna librería de generación de PDF.
- **Panel**: la única superficie de administración es `/analitica-qr`.

El módulo pide entidades relacionales (cliente → instalación → visita →
versión de parte), inmutabilidad probatoria, contadores recalculables y
consultas de historial. Eso desborda lo que KV hace bien.

## 2. Decisiones técnicas propuestas

| Tema | Propuesta | Motivo |
|---|---|---|
| Almacenamiento | **Vercel Postgres (Neon) + Drizzle ORM** | Relaciones, transacciones (nº de visita de temporada), consultas de historial, inmutabilidad verificable. KV se mantiene solo para lo ya existente (QR). |
| Generación PDF | **`@react-pdf/renderer`** reconstruyendo la plantilla v1.1 como componentes | Puro JS (compatible con serverless de Vercel, sin Chromium), layout estable y data-driven; las secciones N/A se imprimen, no se ocultan. Validación lado a lado con el parte real de Doñinos 08/07/2026. |
| Autenticación | Reutilizar el patrón de `middleware.ts` ampliando el matcher a `/panel/:path*` y `/api/panel/:path*` | Un solo técnico (Rubén); no se necesita multiusuario en v1. |
| Estructura de rutas | Nuevo espacio `/panel` (fichas, visitas, partes) dejando `/analitica-qr` intacto | El módulo "extiende, no duplica": el panel crece como área propia. |
| Resiliencia en campo | Autosave del borrador en `localStorage` + sincronización al servidor con reintentos | Cumple el criterio 5 (borrador interrumpido no pierde datos) sin necesidad de PWA completa en v1. |
| Actuaciones como dato | Tabla `catalogo_actuaciones` (sector piscina/jardín) sembrada con la lista v1 | Requisito REPTON: la lista es dato, no código; generalizable sin refactor. |
| Firma del técnico | Imagen almacenada en el perfil del técnico (asset privado), insertada al renderizar | Según spec §7. |

**Decisiones que requieren acción de Rubén (fuera del código):**

1. Provisionar Vercel Postgres en el proyecto (o autorizar alternativa).
2. Facilitar la imagen de firma y el parte real de Doñinos como referencia.
3. Añadir la cláusula de conformidad tácita a la plantilla de contrato (§8 del spec).

## 3. Fases

### Fase 0 — Cierre técnico y fundaciones
Confirmar las decisiones del §2, provisionar Postgres, instalar Drizzle y
`@react-pdf/renderer`, ampliar `middleware.ts`, esqueleto de `/panel`.
**Entregable:** panel vacío protegido + conexión a BD funcionando en preview.

### Fase 1 — Modelo de datos y fichas
Esquema: `clientes`, `instalaciones` (datos fijos §4.1, tipo de servicio,
contexto de equipo), `catalogo_actuaciones`, `tecnicos` (firma), `visitas`,
`visita_parametros`, `visita_actuaciones`, `partes` (versiones PDF). CRUD de
fichas de cliente/instalación en `/panel`.
**Entregable:** ficha de Doñinos (ref. 260527-JD) creada con datos reales.

### Fase 2 — Registro de visitas
Flujo §5 completo: "Nueva visita" → borrador con datos fijos precargados,
nº de temporada calculado en servidor (transaccional, robusto ante borradores
eliminados — criterio 2), precarga de actuaciones/estado desde la última
visita cerrada (parámetros de agua siempre en blanco — §4.4), botones
Iniciar/Cerrar visita con horas editables, formulario móvil-primero con
autosave local y sincronización.
**Entregable:** registrar una visita rutinaria en < 2 minutos (criterio 1).

### Fase 3 — Generación del PDF
Plantilla v1.1 como componentes react-pdf: cabecera con logo, 7 secciones,
rangos RD 742/2013 fijos, secciones no contratadas en N/A, leyenda de
conformidad tácita (§8), firma automática, nombre
`BROWN-PARTE-{ref}-{AAAAMMDD}-v{n}.pdf`, vista previa en el panel.
**Entregable:** PDF equivalente lado a lado al parte real de Doñinos (criterio 3).

### Fase 4 — Estados, inmutabilidad y envío
Máquina de estados borrador → enviada (inmutable). Corrección = nueva versión
que referencia y archiva la anterior (criterio 4), sin edición silenciosa.
Descarga + Web Share API (compartir nativo móvil), registro de fecha/hora de
envío que activa el plazo de 48 h.
**Entregable:** un parte enviado no puede editarse; v2 conserva v1 consultable.

### Fase 5 — Historial y consulta
Listado cronológico de visitas por instalación (fecha, nº temporada, estado,
PDF) y tabla comparativa de evolución de parámetros (cloro, pH, temperatura)
en una sola vista; gráfica solo si sobra tiempo (no bloqueante).
**Entregable:** criterio 7 cumplido.

### Fase 6 — Validación y cierre
Reproducir íntegro el parte de Doñinos 08/07/2026 en el sistema y comparar el
PDF con el original; recorrer los 7 criterios de aceptación; prueba de campo
real con el móvil; revisión cruzada final.
**Entregable:** checklist de aceptación firmado por Rubén.

## 4. Modelos recomendados por fase

Recomendación para las sesiones de Claude Code (y el papel de Codex en tu
flujo habitual de revisión cruzada). Precios por millón de tokens
(entrada/salida): Opus 4.8 $5/$25 · Sonnet 5 $3/$15 (promo $2/$10 hasta
31/08/2026) · Haiku 4.5 $1/$5 · Fable 5 $10/$50.

| Fase | Modelo recomendado | Por qué |
|---|---|---|
| 0 — Cierre técnico y fundaciones | **Claude Opus 4.8** (effort high) + revisión cruzada con **Codex** | Decisiones de arquitectura con consecuencias en todas las fases; es donde más rinde el modelo más capaz y la revisión cruzada. |
| 1 — Modelo de datos y fichas | **Claude Sonnet 5** | Esquema y CRUD bien especificados por el spec; Sonnet 5 rinde a nivel casi-Opus en código rutinario a menor coste. Si prefieres una única sesión larga y autónoma, Opus 4.8. |
| 2 — Registro de visitas | **Claude Opus 4.8** (effort high/xhigh) | La fase más delicada: lógica de precarga, contador transaccional, autosave resiliente a cortes y UX móvil. Errores aquí cuestan caros en campo. |
| 3 — Generación del PDF | **Claude Opus 4.8** | Fidelidad visual iterativa contra el parte v1.1 (comparación de capturas): la visión de alta resolución y la verificación visual son punto fuerte de Opus 4.7+. |
| 4 — Estados e inmutabilidad | **Claude Sonnet 5** | Reglas cerradas y verificables; poco margen de ambigüedad. |
| 5 — Historial y consulta | **Claude Sonnet 5**; retoques menores con **Haiku 4.5** | Vistas de lectura sencillas sobre el esquema ya asentado. |
| 6 — Validación y cierre | **Claude Opus 4.8** + revisión cruzada con **Codex** | Verificación end-to-end contra los criterios de aceptación; mismo tándem que en Fase 0. |

**Notas:**

- **Fable 5** queda como reserva: si una fase se atasca (p. ej. la fidelidad
  del PDF o una condición de carrera en el autosave), una sesión puntual con
  Fable 5 puede resolverlo, asumiendo su coste premium ($10/$50). No lo
  recomiendo por defecto para este módulo.
- **Codex** mantiene su papel habitual: revisión cruzada de plan (Fase 0) y de
  resultado (Fase 6), más revisiones de diff intermedias si alguna fase toca
  algo sensible (inmutabilidad, contador de temporada).
- Dentro de cada sesión de Claude Code, especifica la tarea completa al inicio
  (spec + fase + criterios de aceptación de esa fase): los modelos 4.7+ rinden
  mejor con el objetivo íntegro por delante que con instrucciones goteadas.

## 5. Orden y dependencias

```
F0 ──► F1 ──► F2 ──► F3 ──► F4 ──► F6
              └────────────► F5 ──┘
```

F5 solo depende de F1–F2 y puede solaparse con F3–F4. F6 cierra contra el
caso real de Doñinos (§13 del spec).
