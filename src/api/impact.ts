import { z } from 'zod'
import {
  impactCompaniesResponseSchema,
  impactCompanyDashboardSchema,
  type ImpactCompaniesResponse,
  type ImpactCompanyDashboard,
  type ImpactEntityId,
} from '../types/impact'

const impactApiNamespace = '/api/v1/impact'
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const sameOriginBaseUrl = typeof window === 'undefined' ? '' : window.location.origin
const impactApiBaseUrl = (configuredApiBaseUrl || sameOriginBaseUrl).replace(
  /\/+$/,
  '',
)

type ImpactApiErrorOptions = {
  endpoint: string
  status?: number
  cause?: unknown
}

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

type ResponseBody = {
  value: unknown
  isJson: boolean
  isEmpty: boolean
}

async function readResponseBody(response: Response): Promise<ResponseBody> {
  const text = await response.text()

  if (!text.trim()) {
    return { value: undefined, isJson: false, isEmpty: true }
  }

  try {
    return { value: JSON.parse(text) as unknown, isJson: true, isEmpty: false }
  } catch {
    return { value: text, isJson: false, isEmpty: false }
  }
}

function getErrorDetail(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return undefined
  }

  const message = (payload as Record<string, unknown>).message

  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message)) {
    const details = message.filter(
      (item): item is string => typeof item === 'string',
    )

    return details.length > 0 ? details.join('; ') : undefined
  }

  return undefined
}

function formatValidationError(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join('.') || 'response'}: ${issue.message}`)
    .join('; ')
}

function getImpactApiUrl(path: string): string {
  return `${impactApiBaseUrl}${impactApiNamespace}${path}`
}

async function requestImpact<T>(
  endpoint: string,
  schema: z.ZodType<T>,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(getImpactApiUrl(endpoint), {
      headers: { Accept: 'application/json' },
    })
  } catch (cause) {
    throw new ImpactApiError(`Unable to reach Impact API at ${endpoint}.`, {
      endpoint,
      cause,
    })
  }

  const body = await readResponseBody(response)

  if (!response.ok) {
    const statusText = response.statusText ? ` ${response.statusText}` : ''
    const detail = getErrorDetail(body.value)
    const suffix = detail ? `: ${detail}` : ''

    throw new ImpactApiError(
      `Impact API request to ${endpoint} failed with ${response.status}${statusText}${suffix}.`,
      { endpoint, status: response.status },
    )
  }

  if (!body.isJson) {
    const responseType = body.isEmpty ? 'an empty response' : 'a non-JSON response'

    throw new ImpactApiError(
      `Impact API returned ${responseType} for ${endpoint}.`,
      { endpoint, status: response.status },
    )
  }

  const parsed = schema.safeParse(body.value)

  if (!parsed.success) {
    throw new ImpactApiError(
      `Impact API response for ${endpoint} does not match the expected contract: ${formatValidationError(parsed.error)}.`,
      { endpoint, status: response.status, cause: parsed.error },
    )
  }

  return parsed.data
}

export function getImpactCompanies(): Promise<ImpactCompaniesResponse> {
  return requestImpact('/companies', impactCompaniesResponseSchema)
}

export function getImpactCompanyDashboard(
  companyId: ImpactEntityId,
): Promise<ImpactCompanyDashboard> {
  const encodedCompanyId = encodeURIComponent(String(companyId))

  return requestImpact(
    `/companies/${encodedCompanyId}/dashboard`,
    impactCompanyDashboardSchema,
  )
}
