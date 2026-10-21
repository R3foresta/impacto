import { z } from 'zod'

import { resolveSeedPhotoUrl } from '../lib/seed-bank'
import {
  impactCampaignDetailSchema,
  impactDashboardSchema,
  impactEvidenceGalleryResponseSchema,
  impactMonitoringTimelineResponseSchema,
  impactOrganizationsResponseSchema,
  type ImpactCampaignDetail,
  type ImpactDashboard,
  type ImpactEvidenceFilters,
  type ImpactEvidenceGallery,
  type ImpactMonitoringTimeline,
  type ImpactOrganization,
} from '../types/impact'

import {
  seedBankOverviewResponseSchema,
  seedCollectionDetailResponseSchema,
  seedCollectionsResponseSchema,
  type SeedBankFilters,
} from '../types/seed-bank'

const impactApiNamespace = '/api/v1/impact'
const configuredApiBaseUrl =
  import.meta.env.VITE_API_URL?.trim() ??
  import.meta.env.VITE_API_BASE_URL?.trim()
const sameOriginBaseUrl = typeof window === 'undefined' ? '' : window.location.origin
const impactApiBaseUrl = (configuredApiBaseUrl || sameOriginBaseUrl).replace(/\/+$/, '')

type ImpactApiErrorOptions = { endpoint: string; status?: number; cause?: unknown }

export class ImpactApiError extends Error {
  readonly endpoint: string
  readonly status: number | undefined

  constructor(message: string, options: ImpactApiErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'ImpactApiError'
    this.endpoint = options.endpoint
    this.status = options.status
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text.trim()) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function getErrorDetail(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return undefined

  const message = (payload as Record<string, unknown>).message
  if (typeof message === 'string') return message
  if (!Array.isArray(message)) return undefined

  const details = message.filter((item): item is string => typeof item === 'string')
  return details.length > 0 ? details.join('; ') : undefined
}

function formatValidationError(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join('.') || 'response'}: ${issue.message}`)
    .join('; ')
}

async function requestImpact<T>(endpoint: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${impactApiBaseUrl}${impactApiNamespace}${endpoint}`, {
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      signal,
    })
  } catch (cause) {
    throw new ImpactApiError(`Unable to reach Impact API at ${endpoint}.`, {
      endpoint,
      cause,
    })
  }

  const body = await readResponseBody(response)
  if (!response.ok) {
    const detail = getErrorDetail(body)
    throw new ImpactApiError(
      `Impact API request to ${endpoint} failed with ${response.status}${detail ? `: ${detail}` : ''}.`,
      { endpoint, status: response.status },
    )
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new ImpactApiError(
      `Impact API response for ${endpoint} does not match the expected contract: ${formatValidationError(parsed.error)}.`,
      { endpoint, status: response.status, cause: parsed.error },
    )
  }
  return parsed.data
}

const encodeId = (id: number | string) => encodeURIComponent(String(id))

export async function getImpactOrganizations(): Promise<ImpactOrganization[]> {
  const response = await requestImpact('/organizations', impactOrganizationsResponseSchema)
  return response.data
}

export async function getImpactOrganizationDashboard(
  organizationId: number | string,
): Promise<ImpactDashboard> {
  const response = await requestImpact(
    `/organizations/${encodeId(organizationId)}/dashboard`,
    impactDashboardSchema,
  )
  return response.data
}

export async function getImpactCampaignDetail(
  organizationId: number | string,
  campaignId: number | string,
): Promise<ImpactCampaignDetail> {
  const response = await requestImpact(
    `/organizations/${encodeId(organizationId)}/campaigns/${encodeId(campaignId)}`,
    impactCampaignDetailSchema,
  )
  return response.data
}

export async function getImpactMonitoringTimeline(
  organizationId: number | string,
  campaignId?: number,
): Promise<ImpactMonitoringTimeline> {
  const params = new URLSearchParams()
  if (campaignId !== undefined) params.set('campaignId', String(campaignId))
  const suffix = params.size > 0 ? `?${params.toString()}` : ''
  const response = await requestImpact(
    `/organizations/${encodeId(organizationId)}/monitoring-timeline${suffix}`,
    impactMonitoringTimelineResponseSchema,
  )
  return response.data
}

export async function getImpactEvidenceGallery(
  organizationId: number | string,
  filters: ImpactEvidenceFilters = {},
): Promise<ImpactEvidenceGallery> {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : ''
  const response = await requestImpact(
    `/organizations/${encodeId(organizationId)}/evidence${suffix}`,
    impactEvidenceGalleryResponseSchema,
  )
  return response.data
}

export async function getSeedBankOverview(signal?: AbortSignal) {
  const response = await requestImpact('/seed-bank', seedBankOverviewResponseSchema, signal)
  return response.data
}

export async function getSeedCollections(filters: SeedBankFilters, signal?: AbortSignal) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const response = await requestImpact(
    `/seed-bank/collections?${params.toString()}`,
    seedCollectionsResponseSchema,
    signal,
  )
  return response.data
}

export async function getSeedCollection(id: string, signal?: AbortSignal) {
  const response = await requestImpact(
    `/seed-bank/collections/${encodeId(id)}`,
    seedCollectionDetailResponseSchema,
    signal,
  )
  return {
    ...response.data,
    fotos: response.data.fotos.map((photo) => ({
      ...photo,
      url: resolveSeedPhotoUrl(photo.url, impactApiBaseUrl),
    })),
  }
}
