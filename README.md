# impacto

Portal de transparencia de R3Foresta. El backend NestJS es la fuente de verdad.

El portal consume el contrato público de impacto:

- `GET /api/v1/impact/organizations`
- `GET /api/v1/impact/organizations/:organizationId/dashboard`
- `GET /api/v1/impact/organizations/:organizationId/campaigns/:campaignId`
- `GET /api/v1/impact/organizations/:organizationId/monitoring-timeline`
- `GET /api/v1/impact/organizations/:organizationId/evidence`

Las respuestas se validan con Zod antes de llegar a las vistas y sus tipos
TypeScript se infieren desde los mismos esquemas.

El **Banco de semillas** público está en `/semillas`, con fichas en
`/semillas/:id`. Permite consultar cantidades por unidad, saldo, especies,
ubicaciones, fechas y enlaces de acuñación sin iniciar sesión.
Los endpoints públicos y su contrato están documentados en
[`BANCO_SEMILLAS_API.md`](BANCO_SEMILLAS_API.md). La integración anónima se
verificó con la API NestJS local de lectura y sus datos configurados, sin
modificar registros. El frontend distingue falta de disponibilidad de un
inventario vacío y no incorpora datos simulados en producción.

La documentación de integración y las revisiones futuras no bloqueantes están
en `DATOS_PENDIENTES_HOME_IMPACTO.md`.

```bash
npm install
npm run dev
```

En desarrollo, Vite redirige `/api` al backend NestJS en `http://localhost:3000`.
Define `VITE_API_URL` en `.env.local` únicamente si necesitas usar otro origen.

Las rutas relativas de fotografías públicas se resuelven contra el origen de la
API configurada, también en resúmenes, campañas, registros y galerías. Las URLs
absolutas publicadas conservan su destino. No se requieren credenciales para
estas imágenes. Regresión de dominios distintos: `tests/impact-media.test.mjs`.

```bash
npm run check
npm run build
```
