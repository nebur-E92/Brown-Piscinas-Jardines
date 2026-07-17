# POSICIÓN CONSOLIDADA — Sesión: Arquitectura del sistema de comité

**Estado: BORRADOR — PENDIENTE DE APROBACIÓN FORMAL DE RUBÉN**

Sesión cerrada en fondo tras 5 rondas. Convergencia total entre ChatGPT y
Claude. Este documento consolida los acuerdos y contiene el texto de decisión
propuesto. Nada de lo aquí recogido tiene efecto hasta la aprobación explícita
de Rubén (commit de decisión).

---

## 1. Principios acordados

| ID | Principio |
|---|---|
| R05-A01 | Git es infraestructura invisible para los modelos. |
| R05-A02 | Cada intervención se genera una sola vez. |
| R05-A03 | El registro no se confunde con la aprobación. |
| R05-A04 | El contexto de cada ronda es incremental, no el historial completo por defecto. |
| R05-A05 | El historial íntegro (`RONDAS.md`) se conserva como fuente auditable. |
| R05-A06 | Escribano organiza y persiste; no delibera ni decide. |

## 2. Taxonomía de commits (R05-P01)

- **Commit de registro**: conserva estado, ronda o metadatos.
- **Commit de decisión**: materializa una autorización de Rubén.
- **Commit de implementación**: registra cambios técnicos realizados conforme a
  una decisión previa.

Git no es la autoridad: solo conserva el rastro. La autoridad reside en Rubén y
en las decisiones explícitas registradas.

## 3. Identificadores estables por ítem (R05-P02)

Formato: `R05-A02`, `R05-D01`, `R05-P03`, `R05-R01`, donde el prefijo es la
ronda (`R05`), la letra la categoría (`A` acuerdo, `D` desacuerdo, `P`
propuesta, `R` riesgo) y el número el ordinal dentro de esa categoría y ronda.

- Los IDs los asigna Escribano en el momento del registro, de forma
  determinista y secuencial; los modelos no se autoasignan IDs.
- El estado de sesión referencia estos IDs y copia o condensa campos
  declarados; no reinterpreta contenido.

## 4. Válvula de escape: solicitud de rondas íntegras (R05-P03)

Un modelo puede solicitar la inyección íntegra de una o varias rondas por ID
cuando declare que el estado compacto es insuficiente para razonar con
seguridad. La solicitud debe indicar qué ronda necesita, por qué la necesita y
qué riesgo existe si no se consulta. Solicitud y resolución quedan registradas.

## 5. Escribano no deliberativo (R05-A06, desarrollo)

Escribano organiza, registra y prepara contexto. No convierte interpretaciones
propias en decisiones ni introduce contenido deliberativo en el historial.

## 6. Enmienda del plan de Escribano 2 (R05-P04)

Esta decisión **enmienda el plan aprobado de Escribano 2**. La revisión es una
puerta bloqueante: antes de cualquier implementación, Codex debe revisar y
actualizar el plan conforme a:

- la política de commits (§2);
- el papel de Git (§1, R05-A01);
- la estructura del estado de sesión (§3);
- la relación entre ronda, registro y decisión (§1, R05-A02/A03);
- la extracción determinista del resultado estructurado.

**Pendiente de verificación técnica (R05-R01)**: el mecanismo concreto de
captura (modo no interactivo, flags disponibles en Codex CLI, formato exacto de
salida estructurada) no queda cerrado en esta sesión. Lo que sí queda cerrado
es el principio: Escribano 2 no debe depender de una captura frágil de terminal
interactiva si existe una vía más estable, verificable y automatizable.

---

## 7. Texto de decisión propuesto para Rubén

> Se aprueba la modificación del sistema de comité para separar pensamiento,
> registro, persistencia y control de versiones.
>
> A partir de esta decisión, Git pasa a ser infraestructura invisible para los
> modelos. Las rondas se generan una sola vez y Escribano las registra
> automáticamente. Los commits se clasifican como commits de registro, decisión
> o implementación.
>
> Cada ronda recibirá contexto incremental, no el historial completo por
> defecto. `RONDAS.md` seguirá siendo el historial íntegro y auditable. El
> estado de sesión utilizará identificadores estables por ítem para conservar
> trazabilidad.
>
> Escribano no tendrá autoridad deliberativa: organizará, registrará y
> preparará contexto, pero no convertirá interpretaciones propias en
> decisiones.
>
> Cualquier modelo podrá solicitar rondas íntegras por ID cuando justifique que
> el contexto compacto es insuficiente.
>
> Esta decisión enmienda el plan de Escribano 2. Antes de implementar, deberá
> actualizarse el plan y devolverse a Codex para revisión cruzada.

## 8. Archivos afectados por la decisión

- `PROTOCOLO_TURNOS.md`
- `MANIFIESTO_COMITE.md`
- Plan aprobado de Escribano 2
- Documentación interna de Escribano (gestión de rondas, estado de sesión,
  commits)

*Nota: estos documentos no residen en este repositorio; residen en el entorno
donde opera el comité. Este borrador debe trasladarse allí junto con la
decisión de Rubén.*

## 9. Próximos pasos

1. Rubén aprueba (o modifica) el texto de decisión del §7 → commit de decisión.
2. Codex revisa y actualiza el plan de Escribano 2 → revisión cruzada.
3. Solo entonces, Claude Code implementa → commits de implementación.
