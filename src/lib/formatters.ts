const unavailableValue = 'Sin dato verificado'

export function formatCount(value: number | null | undefined): string {
  return value == null ? unavailableValue : new Intl.NumberFormat('es-BO').format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return unavailableValue
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    // A planting date is a calendar day, not midnight UTC converted to local
    // time (which would display the previous day in Bolivia).
    ...(/^\d{4}-\d{2}-\d{2}$/.test(value) ? { timeZone: 'UTC' } : {}),
  }).format(new Date(value))
}

export function formatPercentage(value: number | null | undefined): string {
  return value == null
    ? 'Sin datos'
    : `${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(value)} %`
}

export function formatHectares(value: number): string {
  return `${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 4 }).format(value)} ha`
}

export function formatCode(value: string): string {
  return value.replaceAll('_', ' ').toLocaleLowerCase('es-BO')
}

export { unavailableValue }
