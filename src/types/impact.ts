import { z } from 'zod'

const nonEmptyTextSchema = z.string().trim().min(1)
const optionalTextSchema = nonEmptyTextSchema.nullable().optional()
const optionalTimestampSchema = z.string().datetime({ offset: true }).nullable().optional()
const optionalDateSchema = z.string().date().nullable().optional()
const optionalCountSchema = z.number().int().nonnegative().nullable().optional()

function isSafeNavigationUrl(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//')) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const optionalUrlSchema = nonEmptyTextSchema
  .refine(isSafeNavigationUrl, {
    message: 'URL must use http(s) or be a same-origin path.',
  })
  .nullable()
  .optional()

export const impactEntityIdSchema = z.union([
  nonEmptyTextSchema,
  z.number().int().positive(),
])

export type ImpactEntityId = z.infer<typeof impactEntityIdSchema>

export const impactStatusCodeSchema = z.enum([
  'planned',
  'active',
  'in_progress',
  'completed',
  'paused',
  'at_risk',
  'cancelled',
  'unknown',
])

export type ImpactStatusCode = z.infer<typeof impactStatusCodeSchema>

export const impactStatusSchema = z.object({
  code: impactStatusCodeSchema,
  label: optionalTextSchema,
  detail: optionalTextSchema,
  updatedAt: optionalTimestampSchema,
})

export type ImpactStatus = z.infer<typeof impactStatusSchema>

export const impactVerificationStatusSchema = z.enum([
  'verified',
  'partially_verified',
  'pending_verification',
  'not_available',
])

export type ImpactVerificationStatus = z.infer<
  typeof impactVerificationStatusSchema
>

export const impactSourceReferenceKindSchema = z.enum([
  'traceability_record',
  'evidence',
  'report',
  'external_reference',
])

export const impactSourceReferenceSchema = z.object({
  id: impactEntityIdSchema,
  kind: impactSourceReferenceKindSchema,
  label: nonEmptyTextSchema,
  url: optionalUrlSchema,
})

export type ImpactSourceReference = z.infer<
  typeof impactSourceReferenceSchema
>

export const impactVerificationSchema = z.object({
  status: impactVerificationStatusSchema,
  verifiedAt: optionalTimestampSchema,
  sourceReferences: z.array(impactSourceReferenceSchema).optional(),
  note: optionalTextSchema,
}).superRefine((verification, context) => {
  const hasVerificationClaim =
    verification.status === 'verified' ||
    verification.status === 'partially_verified'
  const hasSources = (verification.sourceReferences?.length ?? 0) > 0

  if (hasVerificationClaim && !hasSources) {
    context.addIssue({
      code: 'custom',
      path: ['sourceReferences'],
      message: 'A verification claim requires at least one source reference.',
    })
  }
})

export type ImpactVerification = z.infer<typeof impactVerificationSchema>

export const moneySchema = z.object({
  amount: z.number().finite().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
})

export type Money = z.infer<typeof moneySchema>

export const companySchema = z.object({
  id: impactEntityIdSchema,
  name: nonEmptyTextSchema,
  legalName: optionalTextSchema,
  logoUrl: optionalUrlSchema,
  currentStatus: impactStatusSchema.nullable().optional(),
  verification: impactVerificationSchema.nullable().optional(),
  updatedAt: optionalTimestampSchema,
})

export type Company = z.infer<typeof companySchema>

export const impactSummarySchema = z.object({
  totalContribution: moneySchema.nullable().optional(),
  treesFunded: optionalCountSchema,
  treesPlanted: optionalCountSchema,
  treesAlive: optionalCountSchema,
  projectsInvolved: optionalCountSchema,
  currentStatus: impactStatusSchema.nullable().optional(),
  asOf: optionalTimestampSchema,
  verification: impactVerificationSchema.nullable().optional(),
})

export type ImpactSummary = z.infer<typeof impactSummarySchema>

export const organizationRoleSchema = z.enum([
  'implementer',
  'community_partner',
  'technical_partner',
  'funder',
  'monitoring_partner',
  'other',
])

export const responsibleOrganizationSchema = z.object({
  id: impactEntityIdSchema,
  name: nonEmptyTextSchema,
  role: organizationRoleSchema.nullable().optional(),
})

export type ResponsibleOrganization = z.infer<
  typeof responsibleOrganizationSchema
>

export const impactProjectSchema = z.object({
  id: impactEntityIdSchema,
  name: nonEmptyTextSchema,
  description: optionalTextSchema,
  ecosystem: optionalTextSchema,
  currentStatus: impactStatusSchema.nullable().optional(),
  locationIds: z.array(impactEntityIdSchema).optional(),
  species: z.array(nonEmptyTextSchema).optional(),
  responsibleOrganizations: z.array(responsibleOrganizationSchema).optional(),
  totalContribution: moneySchema.nullable().optional(),
  treesFunded: optionalCountSchema,
  treesPlanted: optionalCountSchema,
  treesAlive: optionalCountSchema,
  plantingDate: optionalDateSchema,
  verification: impactVerificationSchema.nullable().optional(),
})

export type ImpactProject = z.infer<typeof impactProjectSchema>

export const impactCoordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
})

export type ImpactCoordinates = z.infer<typeof impactCoordinatesSchema>

export const impactLocationSchema = z.object({
  id: impactEntityIdSchema,
  name: nonEmptyTextSchema,
  country: optionalTextSchema,
  region: optionalTextSchema,
  municipality: optionalTextSchema,
  communityName: optionalTextSchema,
  ecosystem: optionalTextSchema,
  coordinates: impactCoordinatesSchema.nullable().optional(),
  projectIds: z.array(impactEntityIdSchema).optional(),
  currentStatus: impactStatusSchema.nullable().optional(),
  verification: impactVerificationSchema.nullable().optional(),
})

export type ImpactLocation = z.infer<typeof impactLocationSchema>

export const impactTimelineStageSchema = z.enum([
  'collection',
  'nursery',
  'allocation',
  'planting',
  'monitoring',
  'other',
])

export const impactTimelineEventSchema = z.object({
  id: impactEntityIdSchema,
  stage: impactTimelineStageSchema,
  title: nonEmptyTextSchema,
  description: optionalTextSchema,
  status: impactStatusSchema,
  occurredAt: optionalTimestampSchema,
  projectId: impactEntityIdSchema.nullable().optional(),
  locationId: impactEntityIdSchema.nullable().optional(),
  evidenceIds: z.array(impactEntityIdSchema).optional(),
  verification: impactVerificationSchema.nullable().optional(),
})

export type ImpactTimelineEvent = z.infer<typeof impactTimelineEventSchema>

export const impactEvidenceTypeSchema = z.enum([
  'photo',
  'document',
  'geolocation',
  'monitoring_record',
  'certificate',
  'other',
])

export const impactEvidenceSchema = z.object({
  id: impactEntityIdSchema,
  type: impactEvidenceTypeSchema,
  title: nonEmptyTextSchema,
  description: optionalTextSchema,
  url: optionalUrlSchema,
  capturedAt: optionalTimestampSchema,
  projectId: impactEntityIdSchema.nullable().optional(),
  locationId: impactEntityIdSchema.nullable().optional(),
  timelineEventId: impactEntityIdSchema.nullable().optional(),
  currentStatus: impactStatusSchema.nullable().optional(),
  verification: impactVerificationSchema.nullable().optional(),
})

export type ImpactEvidence = z.infer<typeof impactEvidenceSchema>

export const impactCompaniesResponseSchema = z.object({
  companies: z.array(companySchema),
})

export type ImpactCompaniesResponse = z.infer<
  typeof impactCompaniesResponseSchema
>

export const impactCompanyDashboardSchema = z.object({
  company: companySchema,
  summary: impactSummarySchema,
  projects: z.array(impactProjectSchema),
  locations: z.array(impactLocationSchema),
  timeline: z.array(impactTimelineEventSchema),
  evidence: z.array(impactEvidenceSchema),
  generatedAt: optionalTimestampSchema,
})

export type ImpactCompanyDashboard = z.infer<
  typeof impactCompanyDashboardSchema
>
