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

Define `VITE_API_URL` en `.env.local` para conectar el backend. Sin esa variable, el portal usa el mismo origen.

```bash
npm run check
npm run build
```
