# Banco público de semillas: contrato para el backend

Estado: **implementado en frontend y NestJS; integración anónima verificada con la API local de lectura**.
Fecha: 21 de octubre de 2026.

La nueva pestaña vive en `/semillas`; las fichas, en `/semillas/:id`.
La ruta operativa `/api/recolecciones` está protegida por `InternalActorGuard`
y filtra la lista por cuenta. No sirve como fuente global anónima.
El banco incorpora su proyección de recolecciones bajo `/api/v1/impact/seed-bank`.
No se deben quitar los guards ni usar credenciales internas desde este portal.

## Endpoints públicos

| GET | Respuesta | Uso |
| --- | --- | --- |
| `/api/v1/impact/seed-bank` | `seedBankOverviewResponseSchema` | Totales globales y opciones completas para filtros. |
| `/api/v1/impact/seed-bank/collections` | `seedCollectionsResponseSchema` | Lista global paginada, con filtros. |
| `/api/v1/impact/seed-bank/collections/:id` | `seedCollectionDetailResponseSchema` | Ficha pública, fotos y Blockchain. |
| `/api/v1/impact/seed-bank/collections/:id/photos/:photoId` | `image/jpeg` | Fotografía sanitizada de recolección validada. |

Esquemas ejecutables: [`src/types/seed-bank.ts`](src/types/seed-bank.ts).
Consumo: [`src/api/impact.ts`](src/api/impact.ts).

Los endpoints son de lectura anónima: sin Bearer, cookies, `x-auth-id`,
rol ni restricción por organización/recolector. La web usa `credentials: omit`.
Configurar CORS para el origen del portal si se sirven desde dominios distintos.

## Universo de datos y cantidades

- Fuente `recoleccion`, exclusivamente `tipo_material = SEMILLA`; excluir
  esquejes. El alcance es global, no solo los registros propios ni los de una
  organización, vivero o página de resultados.
- Incluir todas las recolecciones destinadas a consulta pública, aunque no
  tengan NFT, saldo o validación. No filtrar implícitamente por `VALIDADO`,
  cantidad disponible, `token_id` o `blockchain_url`. El contrato admite los
  cuatro estados actuales y los muestra con su estado real. Si existen datos
  internos que deban excluirse, definir explícitamente esa regla de publicación;
  el frontend no puede deducirla. Listado, detalle, filtros y resumen deben
  compartir exactamente el mismo universo público.
- Exponer una proyección explícita, sin devolver `select('*')`: nada de JWT,
  correo, teléfono, identidad de cuenta o notas internas. Publicar solamente
  observaciones y fotografías aptas para consulta pública. El identificador,
  nombre y coordenadas de ubicación corresponden a su proyección pública.
- `cantidad_inicial_canonica`: cantidad histórica recolectada.
- `saldo_actual`: saldo operativo calculado por la fuente de verdad. `null`
  significa no disponible; `0` significa cero real. No sustituir saldo ausente
  por cantidad inicial ni inferirlo de cantidades de lotes.
- Unidades canónicas: `G` y `UNIDAD`. Normalizar `KG` a `G` en el backend según
  su política existente. No sumar peso y conteo ni convertir gramos a semillas.
  La web muestra gramos como kg a partir de 1000 g, conservando su significado.
- `summary.totalsByUnit` contiene una entrada por unidad presente, con
  `collected` (suma histórica) y `available` (suma de saldos). Si no se conoce el
  saldo de todos los registros de esa unidad, devolver `available: null`, sin
  presentar una suma parcial como saldo total. Sin datos, usar `[]`.
- `summary.collectionsCount`, `speciesCount` y `locationsCount` son conteos
  globales, deduplicados por ID; ubicaciones nulas no cuentan.
- `summary.mintedCollectionsCount`: registros con acuñación y enlace público
  de explorador disponible. No contarlos por estado `VALIDADO` solamente.
- `summary.lastCollectionAt`: fecha máxima de recolección o `null` si no existe.
- `generatedAt` es el corte/generación de la respuesta, no fecha de recolección
  ni fecha de acuñación. Formato ISO con zona horaria.

## GET /seed-bank

```json
{
  "success": true,
  "data": {
    "summary": {
      "collectionsCount": 0,
      "speciesCount": 0,
      "locationsCount": 0,
      "mintedCollectionsCount": 0,
      "lastCollectionAt": null,
      "totalsByUnit": []
    },
    "filters": { "species": [], "locations": [] },
    "generatedAt": "2026-10-21T19:00:00Z"
  }
}
```

Cada entrada de `totalsByUnit` tiene `{ unit: "G" | "UNIDAD", collected:
number, available: number | null }`.

`filters.species`: `{ id, commonName: string | null, scientificName: string |
null }[]`. `filters.locations`: `{ id, name: string }[]`.
Las opciones se calculan sobre todo el universo público, independientemente de
la paginación o filtros actuales de la lista.

## GET /seed-bank/collections

| Parámetro | Tipo | Comportamiento |
| --- | --- | --- |
| `q` | string, máximo 150 caracteres | Buscar por código, nombre común o científico. |
| `speciesId` | ID positivo | Filtrar por planta. |
| `locationId` | ID positivo | Filtrar por ubicación pública. |
| `from`, `to` | `YYYY-MM-DD` | Rango inclusivo sobre `fecha` de recolección; validar desde ≤ hasta. |
| `blockchain` | `with-link`, `without-link` | Presencia del enlace público de explorador. |
| `sort` | `date-desc` (default), `date-asc` | Ordenar por `fecha` y, para empates, por `id` en el mismo sentido. |
| `page` | entero ≥ 1 (default 1) | Página solicitada. |
| `pageSize` | entero 1–100 (default 12) | Tamaño de página. |

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 12,
    "total": 0,
    "totalPages": 0
  }
}
```

Aplicar filtros **antes** de contar y paginar. `total` y `totalPages` describen
la consulta completa; los totales del resumen permanecen globales. No devolver
solo la primera página de la ruta interna ni agregarla en el navegador.

## Registro público y detalle

Cada `items[]` devuelve exactamente la siguiente proyección. Este ejemplo es
**ficticio** y describe el formato, no las cantidades reales de R3Foresta:

```json
{
  "id": 123,
  "codigo_trazabilidad": "EJEMPLO-REC-123",
  "tipo_material": "SEMILLA",
  "fecha": "2026-10-20",
  "cantidad_inicial_canonica": 2500,
  "unidad_canonica": "G",
  "saldo_actual": 1800,
  "estado_registro": "VALIDADO",
  "planta": {
    "id": 10,
    "nombre_comun_principal": "Especie de ejemplo",
    "nombre_cientifico": null
  },
  "ubicacion": {
    "id": 5,
    "nombre": "Lugar de ejemplo",
    "division": null,
    "pais": "Bolivia",
    "latitud": null,
    "longitud": null
  },
  "blockchain": null
}
```

Resolver nombres de planta con los snapshots históricos de la recolección y el
fallback del catálogo existente; usar los identificadores originales para filtrar.
`ubicacion` y `blockchain` pueden ser `null`. Todos los campos anulables del
esquema se devuelven explícitamente como `null` cuando no estén disponibles.

Cuando existe información de Blockchain, `blockchain` contiene:

```json
{
  "explorer_url": "https://explorador.example/token/contrato/instance/42",
  "token_id": "42",
  "transaction_hash": "0x...",
  "network": "Nombre de la red real",
  "minted_at": null
}
```

Los cinco campos admiten `null`. `explorer_url` debe provenir del enlace de
acuñación real (`blockchain_url` si es un explorador HTTP(S) válido). No
transformar `ipfs://...`, un gateway de metadatos o una fotografía en un supuesto
enlace de acuñación. No inventar red, hash ni fecha de mint: el servicio actual
puede tener estos datos incompletos. El portal no acuña, conecta wallets ni
requiere una billetera para consultar el explorador.

El detalle responde `{ success: true, data: { ...registro, metodo,
observaciones_publicas, fotos, generatedAt } }`, donde:

- `metodo`: nombre del método o `null`.
- `observaciones_publicas`: texto aprobado para publicación o `null`.
- `fotos`: `{ id, url, descripcion: string | null }[]`, URL HTTP(S)
  públicas o rutas sanitizadas del backend
  `/api/v1/impact/seed-bank/collections/:id/photos/:photoId`;
  `[]` si no hay imágenes publicables. El portal resuelve las rutas relativas
  contra `VITE_API_URL`, para permitir dominios distintos.
- `generatedAt`: ISO con zona horaria.

Un ID inexistente/no público devuelve 404; sin coincidencias en la lista,
200 con `items: []`. Errores devuelven HTTP 4xx/5xx, nunca 200 con datos vacíos
para ocultar un fallo de base de datos.

## Criterios de aceptación de integración

1. Con navegador sin sesión, las tres rutas devuelven datos sin credenciales.
2. Aparecen registros de distintos recolectores y viveros, incluyendo los que
   carecen de enlace de acuñación. Los esquejes nunca aparecen.
3. Las sumas globales cubren todas las páginas. Peso y conteo permanecen separados.
4. Buscar, filtrar y paginar conservan conteos coherentes y orden estable.
5. El ID de una tarjeta abre la misma cantidad, especie, fecha y lugar en detalle.
6. El explorador abre el NFT correcto; la ausencia del enlace no oculta el registro.
7. Vacío, errores y saldos ausentes se distinguen de un cero real.

## Verificación disponible

`npm run build` valida TypeScript y la compilación. Las pruebas en
`tests/seed-bank.test.mjs` y `tests/seed-bank-browser.mjs` usan datos ficticios
para validar el contrato y los flujos del frontend. La integración real se
comprobó adicionalmente con `tests/seed-bank-live.mjs` y
`tests/seed-bank-live-browser.mjs`, contra la API local NestJS de solo lectura
en el puerto 3306 y el Supabase configurado, sin escribir datos.

Comandos de pruebas: `npm test` y `npm run test:seed-bank:browser`.
Para el segundo, iniciar Vite en el puerto 5181 y disponer de Playwright;
`PLAYWRIGHT_MODULE` puede apuntar a una instalación existente. Evidencia y
limitaciones: [`artifacts/seed-bank/README.md`](artifacts/seed-bank/README.md).


## Integración comprobada el 21 de octubre de 2026

- 131 recolecciones consultadas anónimamente, recorriendo todas las páginas.
- Resumen y listado cubren el mismo universo; cantidades históricas y saldos
  conciliados por unidad, sin mezclar G y UNIDAD.
- Detalle, especie, fechas inclusivas, código de trazabilidad y filtros de
  acuñación comprobados con respuestas reales.
- Flujo real del navegador: inventario, paginación, detalle, enlace de mint y
  dos fotos sanitizadas desde la API en otro origen.
- Pantallas de 1440, 390 y 320 px sin desbordamiento, sin errores JavaScript ni
  autenticación en las peticiones JSON.
- Estas verificaciones corresponden al código local y a la fuente configurada.
  No confirman el despliegue público de Render/Vercel.

Las evidencias agregadas, sin registros individuales, están en
`artifacts/seed-bank/live-api-results.json` y
`artifacts/seed-bank/live-browser-results.json`.

Para repetir la lectura explícita:

```bash
SEED_BANK_API_URL=http://127.0.0.1:3306 npm run test:seed-bank:live
REVIEW_URL=http://127.0.0.1:5181 npm run test:seed-bank:live-browser
```

La segunda requiere Playwright y un frontend cuyo `VITE_API_URL` apunte al
backend que se está verificando. Las imágenes relativas se resuelven contra
ese origen. La prueba no conecta wallets ni ejecuta acuñaciones.
