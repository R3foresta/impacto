# Datos y endpoints pendientes para la página de impacto

Fecha de revisión: 8 de septiembre de 2026.

Este documento separa lo que ya entrega la API pública de impacto de lo que falta para reproducir completamente los módulos de monitoreo y evidencia de la página de inicio. La interfaz no debe inventar cifras ni convertir una asociación de campaña en una atribución financiera exclusiva.

## Datos que ya tenemos y que la página utiliza

Endpoint principal:

`GET /api/v1/impact/organizations/:organizationId/dashboard`

- Resumen: meta de árboles, plantación inicial, reposiciones, árboles vivos reportados, avance, supervivencia, hectáreas, campañas, subcampañas, ubicaciones, registros, evidencias y última actividad.
- Campañas: nombre, estado, fechas, contadores y los mismos indicadores de impacto por campaña.
- Mapa: polígonos, puntos GPS, cantidad plantada, condición dentro/fuera del área y evidencias por registro.
- Evidencias: identificador, registro de plantación, campaña, subcampaña, imagen, fecha y marca de imagen principal.

Endpoint de detalle que la página usa para sumar especies registradas:

`GET /api/v1/impact/organizations/:organizationId/campaigns/:campaignId`

- Registros de plantación con especie, nombre común, nombre científico y cantidad.
- La consulta se reutiliza con la misma clave de caché que el detalle de campaña.

### Cifras comprobadas en el API local

Estas cifras son una fotografía de verificación, no valores escritos en el frontend:

| Organización | Campañas | Meta | Plantación inicial | Reposiciones | Vivos | Supervivencia | Hectáreas | Evidencias |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Banexcoin | 1 | 140 | 10 | 0 | 10 | 100% | 6,4666 | 1 |
| Ema Verde | 1 | 290 | 160 | 0 | 160 | 100% | 2,3221 | 3 |
| Cocacola | 1 | 0 | 0 | 0 | 0 | Sin dato | 0 | 0 |

## Lo implementado con esos datos

1. Supervivencia por campaña y total ponderado, con una referencia visual de 80%.
2. Mortandad acumulada derivada como `max(0, plantación inicial + reposiciones - árboles vivos reportados)`.
3. Reposiciones acumuladas reportadas directamente por la API.
4. Mezcla real de especies y cantidades sumadas desde los detalles de campaña.
5. Anexo visual con identificador de evidencia, fecha, campaña, registro, cantidad y GPS cuando el punto correspondiente está publicado.

## Datos que faltan para completar la referencia

### 1. Serie histórica de mortandad y reposiciones

Falta una serie temporal para dibujar líneas acumuladas reales. El API debería entregar, por campaña y para el total de la organización:

- fecha de corte o fecha del evento;
- árboles monitoreados;
- árboles vivos;
- muertes nuevas y acumuladas;
- reposiciones nuevas y acumuladas;
- fuente del dato y registro de monitoreo que lo respalda.

Propuesta: incorporar `monitoringTimeline` al dashboard o exponer un endpoint de lectura como:

`GET /api/v1/impact/organizations/:organizationId/monitoring-timeline`

### 2. Clasificación ecológica de especies

La API entrega especie y cantidad, pero no permite agrupar con respaldo en categorías como “nativa altoandina”, “nativa de valle” o “tolerante urbana”. Se necesita:

- identificador taxonómico estable;
- categoría de origen/ecorregión;
- condición nativa, introducida o tolerante urbana;
- sinónimos normalizados para evitar duplicados;
- indicación de si la cantidad es planificada, entregada, plantada o viva.

Conviene devolver un agregado `speciesMix` en el dashboard para evitar una llamada por campaña cuando aumente el volumen.

### 3. Evidencia verificable enriquecida

Para mostrar exactamente las fichas de la referencia faltan campos públicos y estados verificables:

- código público de trazabilidad, en lugar de generarlo desde el ID;
- especie o especies del registro ya agregadas en cada evidencia;
- responsable público y regla de privacidad para mostrarlo;
- estado de validación GPS y quién/cuándo lo validó;
- estado de verificación de la fotografía;
- estado de anclaje blockchain, transacción o enlace público de consulta;
- estado de integridad/inmutabilidad del archivo;
- vivero o lote público cuando la evidencia corresponda a esa etapa.

No se deben fabricar etiquetas como “GPS validado”, “foto verificada” o “blockchain anclado” a partir de la mera existencia de una coordenada o una imagen.

### 4. Galería completa y paginación

El dashboard devuelve una vista previa. Para un botón “Ver galería completa” hacen falta:

- endpoint público paginado por organización;
- total, página, tamaño y orden estable;
- filtros por campaña, fecha, especie y tipo de evidencia;
- política explícita de qué evidencias son publicables.

Propuesta:

`GET /api/v1/impact/organizations/:organizationId/evidence?page=1&pageSize=24`

### 5. CO₂ proyectado, monitoreado y certificado

Todavía no hay un dato público suficiente para mostrar captura de CO₂. Antes de publicar cualquier cifra se necesita separar:

- CO₂ proyectado internamente;
- CO₂ monitoreado con evidencia;
- CO₂ certificado por un tercero.

Cada valor debe incluir unidad, periodo, metodología y versión, factores por especie/edad/área, supuestos de supervivencia, fecha de corte, incertidumbre y entidad verificadora. Para la capa certificada también hacen falta estándar, proyecto/registro, seriales y estado de retiro de créditos cuando corresponda.

### 6. Atribución exacta y visibilidad pública

La relación actual es `organización ↔ campaña`; no guarda una cuota de árboles, hectáreas o financiamiento por organización. Hasta que exista una regla cuantificada, la interfaz debe decir “impacto asociado” y no “impacto financiado exclusivamente”.

También sigue siendo necesaria una regla explícita de publicación, por ejemplo `visible_en_impact_portal`, para campañas, evidencias y precisión geográfica.

## Prioridad recomendada para backend

1. Serie de monitoreo y estados de verificación de evidencia.
2. Agregado `speciesMix` con clasificación ecológica.
3. Galería pública paginada.
4. Regla de atribución cuantificada y visibilidad.
5. CO₂ solo después de cerrar metodología y validación externa.
