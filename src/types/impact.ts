import { z } from 'zod'

const idSchema = z.number().int().positive()
const nonNegativeIntegerSchema = z.number().int().nonnegative()
const nonNegativeNumberSchema = z.number().finite().nonnegative()
const nullableTextSchema = z.string().nullable()
const nullableDateSchema = z.string().date().nullable()
const nullableTimestampSchema = z.string().datetime({ offset: true }).nullable()

function isSafePublicUrl(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//')) return true

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const publicUrlSchema = z.string().refine(isSafePublicUrl, {
  message: 'URL must use http(s) or be a same-origin path.',
})

export const impactOrganizationSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  logo: publicUrlSchema.nullable(),
  description: nullableTextSchema,
})
export type ImpactOrganization = z.infer<typeof impactOrganizationSchema>

export const impactMetricsSchema = z.object({
  treesTarget: nonNegativeIntegerSchema,
  treesPlantedInitial: nonNegativeIntegerSchema,
  treesReplanted: nonNegativeIntegerSchema,
  treesAliveReported: nonNegativeIntegerSchema,
  progressPct: z.number().finite().min(0).max(100).nullable(),
  survivalPct: z.number().finite().min(0).max(100).nullable(),
  hectares: nonNegativeNumberSchema,
})
export type ImpactMetrics = z.infer<typeof impactMetricsSchema>

export const impactSpeciesSchema = z.object({
  id: idSchema,
  commonName: nullableTextSchema,
  scientificName: nullableTextSchema,
  quantity: nonNegativeIntegerSchema,
})
export type ImpactSpecies = z.infer<typeof impactSpeciesSchema>

export const impactEvidenceSchema = z.object({
  id: idSchema,
  plantingRecordId: idSchema,
  campaignId: idSchema,
  subcampaignId: idSchema,
  publicTraceabilityCode: nullableTextSchema,
  title: nullableTextSchema,
  imageUrl: publicUrlSchema,
  takenAt: nullableTimestampSchema,
  isPrimary: z.boolean(),
  species: z.array(impactSpeciesSchema),
})
export type ImpactEvidence = z.infer<typeof impactEvidenceSchema>

export const impactPlantingPointSchema = z.object({
  id: idSchema,
  campaignId: idSchema,
  subcampaignId: idSchema,
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  plantedAt: z.string().date(),
  treesPlanted: nonNegativeIntegerSchema,
  replacement: z.boolean(),
  withinArea: z.boolean(),
  distanceToAreaMeters: nonNegativeNumberSchema.nullable(),
  evidenceCount: nonNegativeIntegerSchema,
})
export type ImpactPlantingPoint = z.infer<typeof impactPlantingPointSchema>

const geoJsonPositionSchema = z.array(z.number().finite()).min(2)
const geoJsonLinearRingSchema = z.array(geoJsonPositionSchema)

export const geoJsonPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(geoJsonLinearRingSchema),
})
export type GeoJsonPolygon = z.infer<typeof geoJsonPolygonSchema>

export const impactAreaSchema = z.object({
  campaignId: idSchema,
  subcampaignId: idSchema,
  name: z.string().trim().min(1),
  locationName: nullableTextSchema,
  hectares: nonNegativeNumberSchema,
  polygon: geoJsonPolygonSchema.nullable(),
})
export type ImpactArea = z.infer<typeof impactAreaSchema>

export const impactLocationSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  subcampaignsCount: nonNegativeIntegerSchema,
})
export type ImpactLocation = z.infer<typeof impactLocationSchema>

export const impactCampaignCardSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  type: z.string().trim().min(1),
  description: nullableTextSchema,
  status: z.string().trim().min(1),
  plannedStartDate: nullableDateSchema,
  plannedEndDate: nullableDateSchema,
  subcampaignsCount: nonNegativeIntegerSchema,
  plantingRecordsCount: nonNegativeIntegerSchema,
  evidenceCount: nonNegativeIntegerSchema,
  impact: impactMetricsSchema,
  locations: z.array(impactLocationSchema),
  evidencePreview: z.array(impactEvidenceSchema),
})
export type ImpactCampaignCard = z.infer<typeof impactCampaignCardSchema>

export const impactSpeciesMixItemSchema = z.object({
  speciesId: idSchema,
  commonName: nullableTextSchema,
  scientificName: nullableTextSchema,
  taxonomyId: nullableTextSchema,
  ecologicalCategory: nullableTextSchema,
  origin: z.enum(['NATIVE', 'INTRODUCED', 'URBAN_TOLERANT', 'UNKNOWN']),
  quantity: nonNegativeIntegerSchema,
  quantityStage: z.literal('PLANTED'),
})
export type ImpactSpeciesMixItem = z.infer<typeof impactSpeciesMixItemSchema>

export const impactPlantingRecordSchema = z.object({
  id: idSchema,
  subcampaignId: idSchema,
  plantedAt: z.string().date(),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  treesPlanted: nonNegativeIntegerSchema,
  replacement: z.boolean(),
  withinArea: z.boolean(),
  distanceToAreaMeters: nonNegativeNumberSchema.nullable(),
  species: z.array(impactSpeciesSchema),
  evidence: z.array(impactEvidenceSchema),
})
export type ImpactPlantingRecord = z.infer<typeof impactPlantingRecordSchema>

export const impactSubcampaignSchema = z.object({
  id: idSchema,
  campaignId: idSchema,
  name: z.string().trim().min(1),
  description: nullableTextSchema,
  status: z.string().trim().min(1),
  maintenancePhase: z.string().trim().min(1),
  location: z.object({ id: idSchema, name: nullableTextSchema }),
  hectares: nonNegativeNumberSchema,
  impact: impactMetricsSchema,
  polygon: geoJsonPolygonSchema.nullable(),
  plantingRecordsCount: nonNegativeIntegerSchema,
  evidenceCount: nonNegativeIntegerSchema,
})
export type ImpactSubcampaign = z.infer<typeof impactSubcampaignSchema>

export const impactAttributionSchema = z.object({
  label: z.literal('Impacto asociado'),
  method: z.literal('CAMPAIGN_ASSOCIATION'),
  quantified: z.literal(false),
  note: z.string().trim().min(1),
})

export const impactMapSchema = z.object({
  plantingPoints: z.array(impactPlantingPointSchema),
  areas: z.array(impactAreaSchema),
})
export type ImpactMapData = z.infer<typeof impactMapSchema>

export const impactMonitoringTimelinePointSchema = z.object({
  date: z.string().date(),
  campaignId: idSchema,
  monitoringRecordId: idSchema,
  treesMonitored: nonNegativeIntegerSchema,
  treesAlive: nonNegativeIntegerSchema,
  deathsNew: nonNegativeIntegerSchema,
  deathsAccumulated: nonNegativeIntegerSchema,
  replacementsNew: nonNegativeIntegerSchema,
  replacementsAccumulated: nonNegativeIntegerSchema,
  source: z.enum(['PLANTING_INITIAL', 'PLANTING_REPLACEMENT', 'MORTALITY_REPORT']),
})
export type ImpactMonitoringTimelinePoint = z.infer<typeof impactMonitoringTimelinePointSchema>

export const impactOrganizationsResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(impactOrganizationSchema),
})

export const impactDashboardSchema = z.object({
  success: z.literal(true),
  data: z.object({
    organization: impactOrganizationSchema,
    attribution: impactAttributionSchema,
    summary: impactMetricsSchema.extend({
      campaignsCount: nonNegativeIntegerSchema,
      subcampaignsCount: nonNegativeIntegerSchema,
      locationsCount: nonNegativeIntegerSchema,
      plantingRecordsCount: nonNegativeIntegerSchema,
      evidenceCount: nonNegativeIntegerSchema,
      lastActivityAt: nullableTimestampSchema,
    }),
    campaigns: z.array(impactCampaignCardSchema),
    map: impactMapSchema,
    speciesMix: z.array(impactSpeciesMixItemSchema),
    evidencePreview: z.array(impactEvidenceSchema),
    generatedAt: z.string().datetime({ offset: true }),
  }),
})
export type ImpactDashboardResponse = z.infer<typeof impactDashboardSchema>
export type ImpactDashboard = ImpactDashboardResponse['data']

export const impactCampaignDetailSchema = z.object({
  success: z.literal(true),
  data: z.object({
    organization: impactOrganizationSchema,
    campaign: impactCampaignCardSchema,
    subcampaigns: z.array(impactSubcampaignSchema),
    plantingRecords: z.array(impactPlantingRecordSchema),
    map: impactMapSchema,
    evidence: z.array(impactEvidenceSchema),
    generatedAt: z.string().datetime({ offset: true }),
  }),
})
export type ImpactCampaignDetailResponse = z.infer<typeof impactCampaignDetailSchema>
export type ImpactCampaignDetail = ImpactCampaignDetailResponse['data']

export const impactMonitoringTimelineResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    organization: impactOrganizationSchema,
    campaignId: idSchema.nullable(),
    points: z.array(impactMonitoringTimelinePointSchema),
    dataAvailability: z.object({
      plantingRecordsCount: nonNegativeIntegerSchema,
      mortalityReportsCount: nonNegativeIntegerSchema,
      hasMortalityMonitoring: z.boolean(),
    }),
    generatedAt: z.string().datetime({ offset: true }),
  }),
})
export type ImpactMonitoringTimelineResponse = z.infer<typeof impactMonitoringTimelineResponseSchema>
export type ImpactMonitoringTimeline = ImpactMonitoringTimelineResponse['data']

export const impactEvidenceGalleryResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(impactEvidenceSchema),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive().max(100),
    total: nonNegativeIntegerSchema,
    totalPages: nonNegativeIntegerSchema,
  }),
})
export type ImpactEvidenceGalleryResponse = z.infer<typeof impactEvidenceGalleryResponseSchema>
export type ImpactEvidenceGallery = ImpactEvidenceGalleryResponse['data']

export type ImpactEvidenceFilters = {
  page?: number
  pageSize?: number
  campaignId?: number
  speciesId?: number
  from?: string
  to?: string
}
