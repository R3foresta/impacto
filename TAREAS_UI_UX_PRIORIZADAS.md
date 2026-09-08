# Tareas prioritarias de UI y UX — R3Foresta Impacto

Estado: preparadas, pendientes de activación. Ninguna implementación autorizada en esta ronda.

## Fuentes aceptadas

- «Analizar apariencia responsive», tarea Codex `01a081f0-e83a-7bc3-893e-bb1bbbe562c0`, asociada a `/Users/pabloandresfernandezcari/Projects/r3foresta-impacto`.
- «Analiza UI UX de impacto», tarea Codex `01a081f0-0cce-7523-a834-5d1e40b2fbf2`, asociada a `/Users/pabloandresfernandezcari/Documents/Codex/2026-09-08/en-report-hero-tsx-src-components`.
- Fecha de ambos análisis: 8 de septiembre de 2026. Se utilizaron sus conclusiones; no se repitieron la auditoría, la navegación ni el contraste externo.

## Selección y orden

Este lote concentra el esfuerzo en precisión de la información, acceso a las acciones y visibilidad de una discrepancia territorial. «20 %» se usa como criterio de concentración por impacto, no como una estimación matemática de esfuerzo o retorno.

1. T01: precisión de indicadores y estado del CO₂.
2. T04: advertencia territorial; puede avanzar en paralelo con T01.
3. T03: navegación disponible en anchos reducidos; puede avanzar en paralelo con T01 y T04.
4. T02: composición del hero, después de integrar T01.

T01 y T02 comparten el hero y su tarjeta: no editarlos simultáneamente. T02 es responsable de la composición y del CSS del hero. T03 es responsable del header y su navegación; cualquier ajuste de CSS global debe coordinarse con T02. T04 se limita al módulo del mapa.

Las rutas indicadas son puntos de entrada procedentes del inventario de los análisis, no una instrucción de modificar todos esos archivos. Al activar una tarea, tocar solo lo necesario.

## Regla de activación

Los encargos que siguen describen trabajo futuro. Los agentes deben permanecer en espera hasta una instrucción posterior explícita del usuario. No iniciar ahora lectura de código, nueva investigación, cambios, pruebas, commits, PR ni despliegues.

Al activar, trabajar sobre la versión vigente del proyecto y respetar los cambios previos del usuario. En esta sesión ya existía una modificación local en `src/components/dashboard/report-hero.tsx`; no debe descartarse ni sustituirse por una versión antigua. El worktree creado para registrar una tarea no establece por sí solo la base definitiva de implementación. T02 requiere además el resultado integrado de T01.

La lectura técnica mínima para implementar y la validación dirigida posterior sí formarán parte de cada encargo cuando se active. Las conclusiones de UI/UX ya están establecidas; no volver a auditar todo el producto.

## Fuera de este primer lote

Evolución temporal e histórico de monitoreo, nuevos filtros de seguimiento, metodología o cálculo de carbono, reorganización completa del reporte, eliminación masiva de duplicaciones, nueva taxonomía de evidencias, cambios de backend y pulido transversal de plurales/fechas. Solo corregir redacción local necesaria para las cuatro tareas.

## T01 — Precisar indicadores y estado del CO₂

- Estado: pendiente de activación.
- Prioridad: P1.
- Responsable: Agente de contenido e indicadores.
- Dependencias: Sin dependencia. Completar antes de T02.
- Origen: «Analiza UI UX de impacto»: prioridades 1 y 2 y puntos 1–2 de su orden de implementación.
- Puntos de entrada: `src/components/dashboard/report-hero.tsx`, `src/components/dashboard/impact-overview-card.tsx`, `src/components/dashboard/impact-summary.tsx`, `src/components/dashboard/restoration-performance.tsx`.

**Problema:** El reporte presenta supervivencia como si fuera actual y comprobada; el estado del CO₂ queda relegado a una aclaración metodológica.

**Alcance futuro:**

1. Cambiar las afirmaciones existentes por lenguaje acorde con la fuente: «árboles reportados vivos», «supervivencia reportada» y un titular equivalente a «X árboles plantados; Y figuran vivos en el último registro». Mantener los valores procedentes de los datos.
2. Separar el corte del reporte de la fecha del registro. Conservar «Última actividad» si ese es el significado del campo disponible; usar «Última observación» solo si la fuente identifica expresamente una observación de supervivencia. Si esa fecha no existe, indicar su ausencia sin deducirla del corte.
3. Aclarar junto al indicador existente cuándo la pérdida es una diferencia calculada. No convertir la falta de registros de mortalidad en una afirmación de cero pérdidas.
4. Mostrar «CO₂ capturado · No disponible» en el resumen principal con una explicación breve de la metodología y validación pendientes, usando el estado real publicado. No exigir llegar a Monitoreo para entender su ausencia.
5. Conservar los estados sin plantaciones y sin fechas, y aplicar el mismo lenguaje en los indicadores ya existentes del resumen y monitoreo.

**Criterios de aceptación:**

- [ ] Ningún texto modificado equipara supervivencia reportada con supervivencia actual verificada ni fecha de generación con observación.
- [ ] Los conteos y porcentajes siguen procediendo de las mismas fuentes; cada dato derivado tocado queda identificado como tal.
- [ ] El estado de CO₂ se encuentra en el resumen principal, sin presentar 0 como sustituto de un dato no disponible.
- [ ] Una organización sin plantaciones, sin monitoreo o sin fecha sigue mostrando un estado comprensible, sin afirmaciones inventadas.
- [ ] La entrega enumera los textos cambiados y comprueba los estados disponibles; no necesita servicios, fórmulas ni campos de backend nuevos.

**Fuera de alcance:** Cálculo de carbono, certificación, cambios en API, nueva taxonomía transversal, evolución temporal y ajustes de composición del hero.

**Validación futura:** Al activarse: revisión dirigida de los textos y estados con datos disponibles o fixtures locales claramente identificados; ejecutar las comprobaciones existentes que correspondan a los componentes modificados.


## T02 — Adaptar el hero a pantallas bajas

- Estado: pendiente de activación.
- Prioridad: P1.
- Responsable: Agente de composición responsive.
- Dependencias: Después de T01, con su contenido ya integrado.
- Origen: «Analizar apariencia responsive»: recomendación de variante por altura; «Analiza UI UX de impacto»: prioridad 3.
- Puntos de entrada: `src/components/dashboard/report-hero.tsx`, `src/components/dashboard/impact-overview-card.tsx`, `src/index.css`.

**Problema:** La combinación de escritorio ancho y poca altura útil deja el CTA principal fuera del primer pantallazo o pegado al borde.

**Alcance futuro:**

1. Adaptar la composición a la altura útil del viewport: ajustar moderadamente tamaño del H1, separaciones y rellenos, conservando la identidad visual.
2. Compactar la tarjeta lateral en pantallas bajas, priorizando avance y acceso al territorio; trasladar o compactar evidencia y procedencia sin volverlos inaccesibles.
3. Mantener el CTA «Ver impacto» visible al cargar la página. Incorporar los textos y el estado de CO₂ entregados por T01 antes de ajustar el espacio.
4. Conservar la composición normal en vistas altas y el flujo natural por scroll. Elegir el umbral por comportamiento; 760–800 px son referencias propuestas, no un valor obligatorio.

**Criterios de aceptación:**

- [ ] En 1427 × 757 px CSS, al inicio del reporte, «Ver impacto» queda íntegro dentro del viewport y conserva al menos 24 px libres debajo; objetivo de margen: 24–32 px.
- [ ] Comprobar también 1280 × 757 y 1024 × 757 px CSS, una vista alta de 1440 × 900 y una vista móvil de 390 × 844 como cobertura de regresión.
- [ ] No hay recortes, solapamientos ni desbordamiento horizontal; la información secundaria sigue disponible mediante scroll.
- [ ] No se utilizan transform: scale(), zoom global ni una altura fija que fuerce el recorte del contenido.
- [ ] La jerarquía y legibilidad se conservan con zoom del navegador al 125 %; no se ocultan el estado de CO₂ ni los calificadores metodológicos de T01 para hacer espacio.

**Fuera de alcance:** Rediseño completo, cambios en identidad visual, alteración del header, modificación de cálculos y reorganización de todas las secciones.

**Validación futura:** Al activarse: capturas comparables en los viewports de aceptación y comprobación de posición del CTA. Es validación del cambio, no una nueva auditoría UX.


## T03 — Mantener accesible la navegación de secciones

- Estado: pendiente de activación.
- Prioridad: P1.
- Responsable: Agente de navegación y accesibilidad.
- Dependencias: Independiente de T01 y T04. Coordinar cualquier cambio excepcional en CSS global con T02.
- Origen: «Analiza UI UX de impacto»: prioridad 4 y recomendaciones de accesibilidad; «Analizar apariencia responsive»: composición del header.
- Puntos de entrada: `src/components/layout/portal-header.tsx`, `src/pages/company-dashboard-page.tsx`.

**Problema:** A 1024 px de ancho efectivo desaparecen las pestañas sin alternativa, dejando al usuario sin navegación principal.

**Alcance futuro:**

1. Ofrecer una alternativa compacta cuando se ocultan las pestañas de escritorio. Opción de trabajo: control «Secciones» con los seis destinos actuales; mantener una solución accesible y pequeña.
2. Conservar acceso a Resumen, Impacto, Monitoreo, Campañas, Mapa y Evidencia, además de la acción existente para cambiar de cliente.
3. Reflejar la sección actual mediante estilo visual y aria-current, tanto al seguir enlaces como al desplazarse por el reporte.
4. Mantener teclado, foco visible y títulos de destino visibles bajo el header fijo. Si se implementa un menú desplegable, permitir cierre con Escape y retorno del foco al control.

**Criterios de aceptación:**

- [ ] A 1024 px de ancho los seis destinos están disponibles; la alternativa también existe en cualquier ancho donde desaparece la navegación de escritorio.
- [ ] El recorrido completo se puede operar con teclado, sin atrapamiento ni pérdida de foco, y el control comunica su estado abierto/cerrado si corresponde.
- [ ] Solo la sección correspondiente queda marcada como actual de forma visual y accesible; «Resumen» no permanece seleccionado de manera fija.
- [ ] Al activar cada destino su título queda visible bajo el header; no se introduce un segundo desplazamiento compensatorio.
- [ ] Comprobar 1024 × 757, 1280 × 757, 1427 × 757 y 390 × 844 px CSS, sin desbordamiento del header ni pérdida de «Cambiar cliente».

**Fuera de alcance:** Nuevo selector de organizaciones, cambio de rutas, renombrado de secciones, reordenamiento del reporte y rediseño general del header.

**Validación futura:** Al activarse: recorrido de los seis destinos con ratón y teclado, prueba de scroll y del menú en los anchos donde se ocultan las pestañas. Usar estilos locales; cualquier necesidad de CSS compartido se coordina con T02.


## T04 — Destacar registros fuera del polígono

- Estado: pendiente de activación.
- Prioridad: P1.
- Responsable: Agente de territorio y mapa.
- Dependencias: Independiente de T01, T02 y T03, limitada al módulo territorial.
- Origen: «Analiza UI UX de impacto»: prioridad 6 y punto 3 de su orden de implementación.
- Puntos de entrada: `src/components/map/impact-map.tsx`, `src/components/map/lazy-impact-map.tsx`.

**Problema:** La comprobación «Dentro del área: 0 de 1» comunica de forma neutral una discrepancia territorial relevante.

**Alcance futuro:**

1. Convertir el resultado existente de puntos fuera del polígono en una advertencia visible al entrar en la sección del mapa.
2. Construir el mensaje con los datos de la comprobación territorial existente: «N registros de plantación están fuera del polígono publicado», con singular/plural correcto.
3. Ofrecer una acción para localizar o abrir el registro afectado mediante los detalles ya disponibles; si hay varios, permitir identificar cuáles son.
4. Distinguir el estado mediante texto y un icono o forma además del color. Conservar los filtros y la leyenda.
5. Presentar la discrepancia sin atribuir una causa: no afirmar que hubo plantación incorrecta, fraude o error GPS. La precisión GPS, actualización del polígono o vinculación son posibilidades, no diagnósticos.

**Criterios de aceptación:**

- [ ] Para el caso analizado, con 1 punto comparable y 0 dentro, se muestra una advertencia de 1 registro fuera del polígono, sin tener que interpretar el contador.
- [ ] El número se obtiene de los datos, nunca de un valor fijo; el mensaje y la selección corresponden al ámbito territorial mostrado.
- [ ] Si todos los puntos comparables están dentro, no aparece la advertencia de fuera de área.
- [ ] Si falta polígono, coordenadas válidas o información suficiente, se informa que la comprobación no está disponible; no se clasifica la ausencia como un punto fuera.
- [ ] La acción lleva al registro correcto y la advertencia es comprensible sin depender del color; no cambian las coordenadas, polígonos ni el algoritmo geoespacial.

**Fuera de alcance:** Nuevo motor geoespacial, corrección automática de datos, cambios de backend, flujo para reportar incidencias, alertas globales en el hero y rediseño del mapa.

**Validación futura:** Al activarse: comprobar los estados fuera/dentro/no comparable y la acción al registro con los datos o fixtures disponibles; verificar que los filtros existentes siguen funcionando.

## Registro de tareas en Codex

La aplicación aceptó las cuatro solicitudes de creación. En la última consulta todavía estaba preparando sus worktrees y no había devuelto IDs definitivos. No se enviaron instrucciones de implementación ni de continuación automática. Cada encargo exige confirmar su recepción y permanecer en espera.

| Encargo | Título solicitado | Estado al preparar el lote | Identificador de creación |
|---|---|---|---|
| T01 | Pendiente 01 · Precisar indicadores y estado del CO₂ | Creación en cola; pendiente de activación | `client-new-thread:025e2f8b-25a9-4f0f-b636-e9aaf57ed5ca` |
| T02 | Pendiente 02 · Adaptar el hero a pantallas bajas | Creación en cola; pendiente de activación | `client-new-thread:9e0220e7-e505-4bea-b2ff-f5d752535e1f` |
| T03 | Pendiente 03 · Mantener accesible la navegación de secciones | Creación en cola; pendiente de activación | `client-new-thread:ce7b29f8-17c2-4ea0-914f-b5eb5d2a0b0b` |
| T04 | Pendiente 04 · Destacar registros fuera del polígono | Creación en cola; pendiente de activación | `client-new-thread:91063117-08eb-4dc2-a6a6-1215a7102ba1` |

Los identificadores de creación no son IDs definitivos de tareas. No deben usarse con herramientas que requieran un threadId. Las tarjetas adjuntas en la conversación permiten seguir la creación.

