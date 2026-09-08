# Estado de integración y endpoints pendientes del portal de impacto

Fecha de revisión: 8 de septiembre de 2026.

Este documento contrasta el contrato público del backend con lo que utiliza el portal. Separa lo que ya está disponible de lo que todavía necesita soporte de API para evitar cifras inventadas, estados de verificación inferidos o atribuciones financieras que el modelo actual no respalda.

Base URL pública: `/api/v1/impact`

## Endpoints disponibles e integrados

### 1. Organizaciones e identidad visual

```http
GET /api/v1/impact/organizations
```

Devuelve `id`, `name`, `logo` y `description` por organización activa. El campo `logo` ya es suficiente para identificar visualmente a la empresa: el portal lo usa en las tarjetas de selección, el encabezado y la portada del reporte. Si es `null` o la imagen no carga, la interfaz muestra las iniciales de la organización.

No se necesita un endpoint adicional para logos. Sí conviene que el backend mantenga URLs públicas estables y una regla explícita de publicación de organizaciones para evitar que datos de prueba aparezcan en el selector público.

### 2. Dashboard por organización

```http
GET /api/v1/impact/organizations/:organizationId/dashboard
```

Entrega:

- organización y logo;
- atribución como “Impacto asociado”;
- meta, plantación inicial, reposiciones, árboles vivos reportados, avance, supervivencia y hectáreas;
- campañas y subcampañas;
- ubicaciones, puntos GPS y polígonos;
- registros, vista previa de evidencias y última actividad.

### 3. Detalle de campaña

```http
GET /api/v1/impact/organizations/:organizationId/campaigns/:campaignId
```

Entrega registros de plantación con especies, cantidades, GPS y evidencia. El portal reutiliza esta consulta para mostrar el detalle de campaña y, mientras no exista un agregado específico, para calcular la mezcla de especies.

## Verificación del API local

La API se verificó en `http://localhost:3000` el 8 de septiembre de 2026. Las cifras son una fotografía de comprobación y no están escritas en el frontend.

| Organización | Logo | Campañas | Meta | Plantación inicial | Reposiciones | Vivos | Supervivencia | Hectáreas | Evidencias |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Banexcoin | Disponible | 1 | 140 | 10 | 0 | 10 | 100% | 6,4666 | 1 |
| Ema Verde | Disponible | 1 | 290 | 160 | 0 | 160 | 100% | 2,3221 | 3 |
| Cocacola | Disponible | 1 | 0 | 0 | 0 | 0 | Sin dato | 0 | 0 |
| ONG de Prueba | No disponible | 0 | 0 | 0 | 0 | 0 | Sin dato | 0 | 0 |
| ONG de Prueba 61 | No disponible | 0 | 0 | 0 | 0 | 0 | Sin dato | 0 | 0 |

## Funcionalidad cubierta en el frontend

1. Selector visual de organizaciones con logo destacado y respaldo por iniciales.
2. Identidad de la organización visible en el encabezado y la portada del reporte.
3. Supervivencia por campaña y total ponderado, con referencia visual de 80%.
4. Mortandad acumulada derivada como `max(0, plantación inicial + reposiciones - árboles vivos reportados)`.
5. Reposiciones acumuladas reportadas directamente por la API.
6. Mezcla real de especies y cantidades sumadas desde el detalle de campaña.
7. Mapa con polígonos, puntos GPS y filtros locales por campaña.
8. Anexo visual con evidencia, fecha, campaña, registro, cantidad y GPS cuando el punto está publicado.

## Endpoints y campos todavía pendientes

### P1. Serie histórica de monitoreo

La tarjeta actual solo puede mostrar el balance acumulado al corte. Para dibujar líneas históricas reales hace falta:

```http
GET /api/v1/impact/organizations/:organizationId/monitoring-timeline?campaignId=:campaignId
```

Respuesta mínima propuesta:

```ts
interface MonitoringTimelinePoint {
  date: string;
  campaignId: number;
  monitoringRecordId: number;
  treesMonitored: number;
  treesAlive: number;
  deathsNew: number;
  deathsAccumulated: number;
  replacementsNew: number;
  replacementsAccumulated: number;
  source: string;
}
```

El parámetro `campaignId` debería ser opcional; sin él, la serie debe representar el total de la organización con cortes comparables y orden estable por fecha.

### P1. Evidencia pública verificable

Conviene enriquecer `ImpactEvidence` en el dashboard, detalle y futura galería. Campos mínimos:

```ts
interface ImpactEvidenceVerification {
  publicTraceabilityCode: string;
  species: Array<{
    id: number;
    commonName: string | null;
    scientificName: string | null;
    quantity: number;
  }>;
  gpsValidation: {
    status: 'PENDING' | 'VALID' | 'REJECTED' | 'NOT_APPLICABLE';
    validatedAt: string | null;
    validatorPublicName: string | null;
  };
  photoVerification: {
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    verifiedAt: string | null;
  };
  integrity: {
    status: 'PENDING' | 'VERIFIED' | 'NOT_AVAILABLE';
    publicReference: string | null;
  };
  blockchainAnchor: {
    status: 'PENDING' | 'ANCHORED' | 'NOT_APPLICABLE';
    network: string | null;
    transactionUrl: string | null;
  };
}
```

El frontend no debe convertir la existencia de una coordenada o una imagen en etiquetas como “GPS validado”, “foto verificada” o “blockchain anclado”. Los nombres de responsables solo deben publicarse cuando exista consentimiento y una regla de privacidad.

### P2. Mezcla de especies agregada y clasificación ecológica

Para evitar una consulta por campaña y permitir agrupaciones respaldadas, agregar al dashboard:

```ts
interface SpeciesMixItem {
  speciesId: number;
  commonName: string | null;
  scientificName: string | null;
  taxonomyId: string | null;
  ecologicalCategory: string | null;
  origin: 'NATIVE' | 'INTRODUCED' | 'URBAN_TOLERANT' | 'UNKNOWN';
  quantity: number;
  quantityStage: 'PLANNED' | 'DELIVERED' | 'PLANTED' | 'ALIVE_REPORTED';
}
```

Campo propuesto en el dashboard: `speciesMix: SpeciesMixItem[]`.

También se necesita normalizar sinónimos para que una misma especie no aparezca duplicada.

### P2. Galería completa y paginada

El dashboard solo devuelve una vista previa. Para habilitar “Ver galería completa” hace falta:

```http
GET /api/v1/impact/organizations/:organizationId/evidence?page=1&pageSize=24&campaignId=:campaignId&speciesId=:speciesId&from=:date&to=:date
```

Respuesta mínima:

```ts
interface PaginatedEvidence {
  items: ImpactEvidence[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

El orden debe ser estable, por ejemplo `takenAt DESC, id DESC`, y la respuesta debe aplicar la política pública antes de contar o devolver evidencias.

### P3. Atribución cuantificada y visibilidad pública

El modelo actual solo registra `organización ↔ campaña`; no guarda una cuota de árboles, hectáreas o financiamiento por organización. Hasta que exista una regla cuantificada, la interfaz debe mantener “Impacto asociado” y nunca “Impacto financiado exclusivamente”.

Se necesitan reglas explícitas de publicación para organizaciones, campañas, evidencias y precisión geográfica. La recomendación es filtrar en backend mediante un campo equivalente a `visibleInImpactPortal`, sin exponer registros no publicables al cliente.

Cuando exista atribución cuantificada, el objeto `attribution` debería indicar como mínimo método, unidad, cantidad, periodo y fuente de asignación.

### P4. CO₂ proyectado, monitoreado y certificado

No hay datos públicos suficientes para mostrar captura de CO₂. Antes de publicar cualquier cifra se deben separar tres capas: proyección interna, resultado monitoreado y resultado certificado.

Cada valor requiere unidad, periodo, metodología y versión, factores por especie/edad/área, supuestos de supervivencia, fecha de corte, incertidumbre y entidad verificadora. La capa certificada también necesita estándar, proyecto o registro, seriales y estado de retiro de créditos.

Endpoint sugerido cuando la metodología esté cerrada:

```http
GET /api/v1/impact/organizations/:organizationId/carbon-impact
```

## Orden recomendado para backend

1. Serie histórica de monitoreo y estados verificables de evidencia.
2. Regla explícita de publicación para organizaciones, campañas, evidencia y geografía.
3. Agregado `speciesMix` con clasificación ecológica.
4. Galería pública paginada.
5. Atribución cuantificada.
6. CO₂ solo después de cerrar metodología y validación externa.
