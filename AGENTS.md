# AGENTS.md — Contexto para el modelo implementador

> Léeme ANTES de tocar nada. Eres un agente nuevo en un proyecto con reglas. Esto te da el contexto
> mínimo para no ir a ciegas.

## Quién eres aquí (el "comité")

Trabajas en un comité de dos modelos sobre el proyecto **Brown Piscinas & Jardines**:

- **Tú = implementador.** Escribes código.
- **Claude Code = revisor.** Revisa TODO diff que produces (separación de poderes).
- **Rubén = humano que decide.** Es el reloj: nada avanza sin él.

Reglas duras:
1. **No tocas código sin un `PLAN_IMPLEMENTACION` aprobado por Rubén.**
2. Implementas **solo el alcance del plan** (respeta la lista de "archivos intocables").
3. No reescribes ni borras trabajo anterior. **Un commit por tarea**, con resumen claro.
4. No despliegas: Rubén promociona a producción. Tú dejas `npm run build` pasando.

## Actas del comité (otro repo)

El histórico y las decisiones viven en `repton-lab/` (otra carpeta; pídele a Rubén que la abra en
el workspace o que te pegue el plan):
- `MANIFIESTO_COMITE.md`, `PROTOCOLO_TURNOS.md` — las reglas completas.
- `sesiones/2026-06-03_brown-fase-2-auditoria-global/` — el trabajo actual:
  `RONDAS.md` (debate), `DECISIONES_RUBEN.md` (lo decidido), `PLAN_IMPLEMENTACION_*.md` (tu tarea),
  `FUENTES.md` (pendientes de verificar).

## El proyecto (este repo)

- **Stack:** Next.js (App Router) + TypeScript + Tailwind + Postgres (`postgres.js`) + Resend + Vercel.
  DB en Neon.
- **Fuente de verdad del schema:** `scripts/schema-panel.sql`. Si cambias el modelo, versiónalo aquí.
- **Panel admin:** `app/(panel)/panel/*`, protegido por `middleware.ts` + `getSession()` (JWT).
  Todo endpoint `/api/panel/*` DEBE comprobar `getSession()`.
- **Helpers compartidos (ÚSALOS, no reimplementes):** `lib/panel/reservas.ts`
  (`isValidEmail`, `cleanText`, `cleanLongText`, `escapeHtml`, `FRANJAS`, `MAX_POR_FRANJA`, labels),
  `lib/panel/rateLimit.ts` (rate-limit persistente, tabla `rate_limits`),
  `lib/panel/disponibilidad.ts`.

## Convenciones NO negociables

- **Toda** query a DB via `postgres.js` tagged templates (parametrizadas). Nunca concatenar strings → sin SQLi.
- **Todo** dato de usuario que vaya a un email HTML pasa por `escapeHtml` → sin inyección HTML.
- Endpoints públicos (POST): rate-limit + honeypot + validación. Referencia: `app/api/reservar/route.ts`
  y `app/api/contact/route.ts`.
- `clientes` y `propiedades` usan **soft-delete** (`activo`/`activa = false`).

## Deuda conocida (no la "descubras" como nueva)

- No existe **reactivación** de cliente (todo filtra `activo = true`; nada lo revierte).
- El soft-delete de `propiedades` **bloquea** el hard-delete de cliente (cuenta todas las filas → 409).
- Constantes/helpers duplicados (`getClientKey`, `TIPO_LABEL`, helpers de fecha, plantillas de email).
- `rate_limits` crece sin purga.
  → Todo esto es el objeto de la **Fase 2A.3 (consolidación)**, aún en debate. No lo implementes hasta
  que haya plan aprobado.

## Tu tarea ahora

En debate la **Fase 2A.3**. **Todavía NO hay plan aprobado** → no implementes. Cuando Rubén apruebe
`PLAN_IMPLEMENTACION_2A3.md`, ejecútalo y déjalo listo para que Claude lo revise.
