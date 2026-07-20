# Comité manual BROWN

Este directorio es el único espacio para artefactos de colaboración entre Codex,
Claude Code y Rubén dentro de este repositorio.

La sesión es manual: Rubén abre ambos modelos en terminal y decide cuándo cede el
turno. No se usa Escribano ni ningún automatismo de orquestación hasta nueva
decisión expresa de Rubén.

## Regla de ubicación

Todo documento de debate, fuente, captura, PDF de referencia, plan, revisión,
acta o relevo generado por los modelos debe vivir bajo `.agents/`.

No se crearán `sesiones/`, `planes/`, `revisiones/` ni archivos equivalentes en
la raíz o en carpetas de la aplicación. `AGENTS.md` en la raíz es la única
excepción: actúa como punto de entrada convencional para las reglas del repo.

Los archivos temporales se guardan en `.agents/.tmp/`, están ignorados por Git y
deben borrarse al terminar la tarea que los creó.

## Estructura

```text
.agents/
├── README.md
├── ESTADO.md
├── ESPEC-FUNCIONAL-partes-visita-v1.md
├── PLAN_IMPLEMENTACION.md
├── BROWN-PARTE-VISITA-v1_1.pdf
├── BROWN-PARTE-VISITA-v1_1 (1).pdf
└── partes-visita-v1/
    ├── FUENTES.md
    ├── RONDAS.md
    └── DECISIONES.md
```

Se crearán solo cuando corresponda:

- `PLAN_IMPLEMENTACION.md`: propuesta técnica revisada y sometida a Rubén.
- `REVISION_CLAUDE.md`: revisión del diff tras la implementación.

## Protocolo de turnos

1. Antes de intervenir, el modelo lee `AGENTS.md`, este archivo, `ESTADO.md`,
   las fuentes de la sesión y el último turno de `RONDAS.md`.
2. Solo escribe el modelo que tenga el turno indicado en `ESTADO.md`.
3. Cada intervención se añade al final de `RONDAS.md`. No se reescriben turnos
   anteriores.
4. El turno termina con conclusiones, dudas concretas y el siguiente actor.
5. El modelo actualiza `ESTADO.md` al ceder el turno.
6. Rubén resuelve las decisiones. Se registran en `DECISIONES.md` con fecha y
   alcance.
7. El debate no autoriza cambios de código. Solo un
   `PLAN_IMPLEMENTACION.md` marcado como aprobado por Rubén desbloquea la
   implementación.
8. Tras implementar, Claude revisa el diff completo antes de que Rubén decida
   sobre commit, push o promoción a producción.

## Formato de turno

```markdown
## T-XXX — ACTOR — AAAA-MM-DD

**Entrada:** estado recibido.
**Alcance:** qué se revisa en este turno.

### Análisis
...

### Propuesta o revisión
...

### Preguntas
...

**Salida:** estado dejado.
**Siguiente actor:** CODEX | CLAUDE | RUBÉN.
```

## Estados del trabajo

```text
DEBATE_TECNICO
  -> PENDIENTE_DECISION_RUBEN
  -> PLAN_EN_REDACCION
  -> PLAN_EN_REVISION
  -> PLAN_PENDIENTE_APROBACION
  -> PLAN_APROBADO
  -> IMPLEMENTACION
  -> REVISION_CLAUDE
  -> LISTO_PARA_RUBEN
  -> CERRADO
```

No se salta de `DEBATE_TECNICO` a `IMPLEMENTACION`.
