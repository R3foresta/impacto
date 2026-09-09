# Estado de integración y revisiones futuras del portal de impacto

Fecha de revisión: 9 de septiembre de 2026.

El portal y el backend ya funcionan con el contrato público de impacto. Este
documento registra la integración actual y unos pocos detalles a revisar más
adelante; no representan fallas ni bloquean la operación actual.

Contrato de referencia del backend:
[`impact-portal.md`](../R3foresta/Backend-r3foresta/documentacion/frontend/impact-portal.md).

Base URL pública: `/api/v1/impact`

## Endpoints activos e integrados

| Endpoint | Uso en el portal |
| --- | --- |
| `GET /organizations` | Selector de organizaciones e identidad visual. |
| `GET /organizations/:organizationId/dashboard` | Resumen, campañas, mapa, vista previa de evidencia y `speciesMix`. |
| `GET /organizations/:organizationId/campaigns/:campaignId` | Detalle de campaña bajo demanda. |
| `GET /organizations/:organizationId/monitoring-timeline` | Historial de plantación, reposiciones y, cuando existen, eventos de mortandad reportada. |
| `GET /organizations/:organizationId/evidence` | Galería pública paginada, con filtros por campaña, especie y fecha. |

## Comportamiento actual del portal

1. La mezcla de especies proviene directamente del dashboard, sin pedir el
   detalle de todas las campañas para calcularla en el navegador.
2. El historial solo se presenta como monitoreo publicado cuando
   `hasMortalityMonitoring` es `true`. Si no hay eventos de mortandad, se
   identifica como historial de plantaciones y reposiciones, sin inferir una
   inspección de supervivencia.
3. La galería muestra únicamente evidencia pública, incorpora el código de
   trazabilidad disponible y pagina sus resultados. Un resultado vacío muestra
   un estado vacío, nunca “página 1 de 0”.
4. La interfaz usa “Impacto asociado” y no atribuye financiamiento exclusivo a
   una organización.
5. No se muestran estados de GPS validado, fotografía verificada, integridad,
   anclaje blockchain ni captura de CO₂: el contrato público todavía no aporta
   datos suficientes para esas afirmaciones.

## Revisiones futuras no bloqueantes

| Tema | Situación actual, que funciona | Revisión futura sugerida |
| --- | --- | --- |
| Regla de publicación | La API publica organizaciones activas y las campañas asociadas, junto con sus datos geográficos y evidencia pública. | Si se necesita una curaduría independiente de “organización activa”, incorporar una regla explícita de publicación en el backend antes de ocultar o publicar organizaciones concretas. |
| Galería sin resultados | El backend puede responder `totalPages: 0`; el portal lo trata como una galería vacía y no presenta paginación inválida. | Mantener este caso cubierto si el contrato de paginación cambia o se agregan enlaces directos a una página. |

## Datos que permanecen fuera de alcance

- atribución cuantificada de árboles, hectáreas o financiamiento por
  organización;
- clasificación ecológica de especies y taxonomía normalizada;
- validación pública de GPS o fotografías, integridad y anclaje blockchain;
- CO₂ proyectado, monitoreado o certificado.

Esos temas requieren reglas públicas y datos verificables adicionales; no se
deben inferir desde las coordenadas, fotografías o cantidades existentes.
