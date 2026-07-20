# Especificación funcional — Módulo de Partes de Visita
**Panel de control BROWN Piscinas & Jardines**
Versión 1.0 — 16/07/2026
Referencia visual: PARTE DE VISITA TÉCNICA v1.1 (PDF actual)

> Documento funcional. No prescribe stack, esquema de base de datos ni librerías.
> La implementación técnica se decide en sesión con Claude Code sobre el codebase existente.

---

## 1. Objetivo

Eliminar el rellenado manual del PDF de parte de visita. Los datos fijos del cliente se introducen una sola vez en su ficha; en cada visita solo se registran los datos específicos de esa visita. El sistema genera el parte en PDF con el formato actual (v1.1) y permite enviarlo al cliente.

## 2. Principio rector

El parte no es un documento: es un **registro de visita** que se renderiza como PDF. El documento es una salida, no la fuente de verdad.

## 3. Actores

- **Técnico (Rubén):** registra visitas desde el móvil en campo o desde escritorio.
- **Cliente (titular):** recibe el parte. No accede al panel en esta versión.

---

## 4. Datos por origen

### 4.1 Datos fijos — viven en la ficha de instalación
Se rellenan una vez y se precargan en cada parte:

- Instalación (dirección)
- Referencia de servicio (ej. 260527-JD)
- Tipo de cliente: particular / comunidad / casa rural
- Técnico asignado (por defecto: Rubén Herrero García)
- Tipo de servicio contratado: piscina / jardín / ambos → determina qué secciones del parte se muestran
- Contexto de equipo (texto libre u opcional estructurado): tipo de cloración, modelo de clorador, dosificadora, tipo de revestimiento. No se imprime en el parte; sirve como referencia del técnico al rellenarlo.

**Nota de integración:** si el panel ya tiene entidad cliente/instalación, este módulo la **extiende**, no la duplica. Un cliente puede tener varias instalaciones.

### 4.2 Datos calculados — nunca se teclean
- **Fecha:** por defecto la del día, editable.
- **Hora de entrada / salida:** botones "Iniciar visita" y "Cerrar visita" las capturan automáticamente; editables a posteriori.
- **Nº de visita de temporada:** visitas previas de esa instalación en el año natural + 1. Recalculado por el sistema, nunca manual.

### 4.3 Datos de visita — lo único que se rellena en campo
Estructura idéntica al parte v1.1:

**Parámetros del agua (si servicio incluye piscina):**
- Cloro libre, cloro combinado, pH, temperatura (numéricos)
- Turbidez visual: clara / ligeramente turbia / turbia
- Cianúrico: medido / no medido; valor solo si medido
- Observación por parámetro (texto corto opcional)
- Los rangos óptimos (RD 742/2013) son fijos de la plantilla, no se introducen.

**Actuaciones en piscina:** lista de actuaciones con estado Sí / No / N/A y campo de detalle (producto, dosis, texto libre). Lista v1: limpieza skimmers, limpieza fondo, adición de cloro, ajuste pH, algicida, floculante, revisión filtración/bomba, revisión dosificadora, retrolavado, otros tratamientos.

**Actuaciones en jardín (si servicio incluye jardín):** inspección césped, corte, recorte de bordes, soplado, retirada de restos, revisión de riego, otras. Más el campo de restos vegetales: ≤ 150 L / > 150 L (+30 €).

**Estado general:** agua (óptimo/aceptable/deficiente/crítico), liner (sin/con incidencias), equipos (correcto/avería/comunicada), jardín (óptimo/aceptable/deficiente), cierre preventivo (no / sí + motivo).

**Incidencias y recomendaciones:** tres campos de texto libre — incidencias observadas, recomendaciones hasta próxima visita, productos que debe tener en stock el titular.

### 4.4 Requisito funcional clave: precarga desde la última visita
Al crear una visita nueva, todas las actuaciones y el estado general se **precargan con los valores de la última visita cerrada** de esa instalación. Los parámetros del agua NO se precargan (siempre en blanco: son mediciones). El técnico solo modifica lo que cambia. Objetivo: registrar una visita rutinaria en menos de 2 minutos.

---

## 5. Flujo principal

1. Ficha de instalación → botón **"Nueva visita"**.
2. El sistema crea la visita en estado **borrador**: datos fijos precargados, nº de temporada calculado, actuaciones precargadas de la última visita.
3. El técnico pulsa "Iniciar visita" (captura hora de entrada), rellena parámetros y ajusta actuaciones durante o después del trabajo.
4. "Cerrar visita" captura hora de salida. La visita puede seguir editándose en borrador.
5. Botón **"Generar parte"** → el sistema produce el PDF y muestra vista previa.
6. Botón **"Enviar al cliente"** → la visita pasa a estado **enviada**.

Un borrador puede guardarse a medias y retomarse (cobertura móvil irregular en parcelas: el formulario no puede perder datos por un corte).

## 6. Estados y reglas de inmutabilidad

- **Borrador:** editable sin restricción. Puede eliminarse.
- **Enviada:** **inmutable.** Es un documento con valor probatorio frente al cliente.
- **Corrección:** si un parte enviado contiene un error, se genera una **nueva versión** (parte v2 de la misma visita) que referencia y sustituye a la anterior. La versión anterior queda archivada y consultable. Nunca edición silenciosa.

## 7. Generación del PDF

- Salida visualmente equivalente al parte v1.1 actual: cabecera con logo BROWN, las 7 secciones, tipografía y estilo de tabla de la casa.
- Las secciones de piscina o jardín que no apliquen al servicio contratado se imprimen con sus casillas en N/A (no se ocultan: el formato del documento es estable).
- Nombre de archivo normalizado: `BROWN-PARTE-{ref_servicio}-{AAAAMMDD}-v{n}.pdf`.
- Firma del técnico: imagen de firma almacenada en el perfil del técnico, insertada automáticamente.

## 8. Conformidad del titular

Decisión funcional v1: **conformidad tácita, no firma en pantalla.**

- El bloque "Conforme — el titular" del PDF se sustituye por una leyenda: *"Parte remitido al titular el {fecha}. Se entiende conforme salvo comunicación en contrario en el plazo de 48 horas."*
- Requiere respaldo en el contrato de mantenimiento (cláusula de conformidad tácita). Acción fuera del sistema: añadirla a la plantilla de contrato BROWN.
- La captura de firma táctil in situ queda explícitamente **fuera de alcance v1** (candidata a v2).

## 9. Envío al cliente

- Canal v1: **compartir/adjuntar manualmente** — el sistema genera el PDF y ofrece descarga + botón de compartir (WhatsApp/email nativos del móvil). El envío automatizado (email desde el sistema, WhatsApp API) queda para v2.
- Al marcar "enviado", el sistema registra fecha y hora de envío (dato que activa el plazo de conformidad tácita).

## 10. Historial y consulta

- En la ficha de instalación: listado cronológico de visitas con fecha, nº de temporada, estado y acceso al PDF.
- Vista de evolución de parámetros (cloro, pH, temperatura) por instalación a lo largo de la temporada. Uso: detección de derivas (ej. pH ascendente sostenido = agotamiento de reactivo de la dosificadora). En v1 basta tabla comparativa; gráfica es deseable, no bloqueante.

## 11. Fuera de alcance v1

- Firma táctil del titular
- Envío automatizado por email/WhatsApp desde el sistema
- Acceso del cliente a un portal
- Facturación derivada de los partes (suplemento restos vegetales se registra, no se factura)
- Configuración de plantillas de actuaciones por sector (interés REPTON: la lista de actuaciones debe implementarse como dato, no como código, para que esta generalización sea posible sin refactor)

## 12. Criterios de aceptación

1. Dado un cliente con ficha completa, crear y cerrar una visita rutinaria (sin incidencias, actuaciones iguales a la anterior) requiere **menos de 2 minutos** y ninguna reintroducción de datos fijos.
2. El nº de visita de temporada es correcto sin intervención manual, incluso tras eliminar borradores.
3. El PDF generado es visualmente equivalente al parte v1.1 (validación: comparación lado a lado con un parte real, ej. Doñinos 08/07/2026).
4. Un parte enviado no puede editarse; su corrección genera versión nueva y conserva la anterior.
5. Un borrador interrumpido (cierre de app, pérdida de cobertura) conserva los datos introducidos.
6. Las secciones piscina/jardín se comportan según el tipo de servicio de la ficha.
7. El histórico de parámetros de una instalación es consultable en una sola vista.

## 13. Datos de prueba

Usar la instalación real de Doñinos (ref. 260527-JD) y el parte del 08/07/2026 como caso de validación: sus valores rellenados deben poder reproducirse íntegramente en el sistema y el PDF resultante debe ser equivalente al original.
