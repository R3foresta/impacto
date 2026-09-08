# impacto

Portal de transparencia de R3Foresta. El backend NestJS es la fuente de verdad.

El portal consume el contrato público de impacto:

- `GET /api/v1/impact/organizations`
- `GET /api/v1/impact/organizations/:organizationId/dashboard`
- `GET /api/v1/impact/organizations/:organizationId/campaigns/:campaignId`

Las respuestas se validan con Zod antes de llegar a las vistas y sus tipos
TypeScript se infieren desde los mismos esquemas.

```bash
npm install
npm run dev
```

En desarrollo, Vite redirige `/api` al backend NestJS en `http://localhost:3000`.
Define `VITE_API_URL` en `.env.local` únicamente si necesitas usar otro origen.

```bash
npm run check
npm run build
```
