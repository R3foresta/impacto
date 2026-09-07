import type {
  ImpactLocation,
  ImpactStatus,
  ImpactVerificationStatus,
  Money,
} from '../types/impact'

const unavailableValue = 'Sin dato verificado'

export function formatCount(value: number | null | undefined): string {
  return value == null ? unavailableValue : new Intl.NumberFormat('es-BO').format(value)
}

export function formatMoney(value: Money | null | undefined): string {
  if (!value) {
    return unavailableValue
  }

  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: value.currency,
    maximumFractionDigits: 0,
  }).format(value.amount)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return unavailableValue
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatStatus(status: ImpactStatus | null | undefined): string {
  if (!status) {
    return unavailableValue
  }

  return status.label ?? status.code.replaceAll('_', ' ')
}

export function formatVerification(
  status: ImpactVerificationStatus | null | undefined,
): string {
  const labels: Record<ImpactVerificationStatus, string> = {
    verified: 'Verificado',
    partially_verified: 'Verificación parcial',
    pending_verification: 'Pendiente de verificación',
    not_available: 'Sin verificación disponible',
  }

  return status ? labels[status] : unavailableValue
}

export function formatLocation(location: ImpactLocation): string {
  const parts = [
    location.communityName,
    location.municipality,
    location.region,
    location.country,
  ].filter((part): part is string => Boolean(part))

  return parts.join(' · ') || location.name
}

export { unavailableValue }
