import { z } from 'zod'

const count = z.number().int().nonnegative()
const quantity = z.number().finite().nonnegative()
const id = z.number().int().positive()
const text = z.string().trim().min(1)
const timestamp = z.string().datetime({ offset: true })
const publicUrl = z.string().url().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}, 'Se requiere un enlace HTTP(S) público.')

// Sanitized photo routes are relative to the API, not the portal's origin.
const seedPhotoUrl = z.union([
  publicUrl,
  z.string().regex(/^\/api\/v1\/impact\/seed-bank\/collections\/[1-9]\d*\/photos\/[1-9]\d*$/),
])

export const seedUnitSchema = z.enum(['G', 'UNIDAD'])
export type SeedUnit = z.infer<typeof seedUnitSchema>

export const seedCollectionSchema = z.object({
  id,
  codigo_trazabilidad: text,
  tipo_material: z.literal('SEMILLA'),
  fecha: z.string().date(),
  cantidad_inicial_canonica: quantity,
  unidad_canonica: seedUnitSchema,
  saldo_actual: quantity.nullable(),
  estado_registro: z.enum(['BORRADOR', 'PENDIENTE_VALIDACION', 'VALIDADO', 'RECHAZADO']),
  planta: z.object({
    id,
    nombre_comun_principal: text.nullable(),
    nombre_cientifico: text.nullable(),
  }),
  ubicacion: z.object({
    id,
    nombre: text.nullable(),
    division: text.nullable(),
    pais: text.nullable(),
    latitud: z.number().finite().min(-90).max(90).nullable(),
    longitud: z.number().finite().min(-180).max(180).nullable(),
  }).nullable(),
  blockchain: z.object({
    // The backend supplies an explorer URL, never an IPFS metadata URL.
    explorer_url: publicUrl.nullable(),
    token_id: text.nullable(),
    transaction_hash: text.nullable(),
    network: text.nullable(),
    minted_at: timestamp.nullable(),
  }).nullable(),
})
export type SeedCollection = z.infer<typeof seedCollectionSchema>

export const seedBankOverviewResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    summary: z.object({
      collectionsCount: count,
      speciesCount: count,
      locationsCount: count,
      mintedCollectionsCount: count,
      lastCollectionAt: z.string().date().nullable(),
      totalsByUnit: z.array(z.object({
        unit: seedUnitSchema,
        collected: quantity,
        available: quantity.nullable(),
      })).refine((items) => new Set(items.map((item) => item.unit)).size === items.length, 'Las unidades deben ser únicas.'),
    }),
    filters: z.object({
      species: z.array(z.object({ id, commonName: text.nullable(), scientificName: text.nullable() })),
      locations: z.array(z.object({ id, name: text })),
    }),
    generatedAt: timestamp,
  }),
})
export type SeedBankOverview = z.infer<typeof seedBankOverviewResponseSchema>['data']

export const seedCollectionsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(seedCollectionSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
    total: count,
    totalPages: count,
  }),
})
export type SeedCollectionPage = z.infer<typeof seedCollectionsResponseSchema>['data']

export const seedCollectionDetailResponseSchema = z.object({
  success: z.literal(true),
  data: seedCollectionSchema.extend({
    metodo: text.nullable(),
    observaciones_publicas: text.nullable(),
    fotos: z.array(z.object({ id, url: seedPhotoUrl, descripcion: text.nullable() })),
    generatedAt: timestamp,
  }),
})
export type SeedCollectionDetail = z.infer<typeof seedCollectionDetailResponseSchema>['data']

export type SeedBankFilters = {
  q?: string
  speciesId?: string
  locationId?: string
  from?: string
  to?: string
  blockchain?: 'with-link' | 'without-link'
  sort?: 'date-desc' | 'date-asc'
  page?: number
  pageSize?: number
}
