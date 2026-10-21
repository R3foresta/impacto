import type { SeedCollection, SeedUnit } from '../types/seed-bank'

export function formatSeedQuantity(value: number | null, unit: SeedUnit): string {
  if (value === null) return 'Sin dato de saldo'
  // Mass and counts are never combined or converted into an estimated seed count.
  const kilograms = unit === 'G' && value >= 1000
  const amount = kilograms ? value / 1000 : value
  const formatted = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 6 }).format(amount)
  return `${formatted} ${unit === 'UNIDAD' ? 'unidades' : kilograms ? 'kg' : 'g'}`
}

export function seedSpeciesName(item: SeedCollection): string {
  return item.planta.nombre_comun_principal ?? item.planta.nombre_cientifico ?? 'Especie sin nombre publicado'
}

export function seedLocationName(item: SeedCollection): string {
  if (!item.ubicacion) return 'Ubicación no publicada'
  return [item.ubicacion.nombre, item.ubicacion.division, item.ubicacion.pais].filter(Boolean).join(', ') || 'Ubicación no publicada'
}

export const seedRecordLabels: Record<SeedCollection['estado_registro'], string> = {
  BORRADOR: 'Borrador',
  PENDIENTE_VALIDACION: 'Pendiente de validación',
  VALIDADO: 'Validado',
  RECHAZADO: 'Rechazado',
}

// The API may serve sanitized photographs from a different origin than the SPA.
export function resolveSeedPhotoUrl(value: string, apiBaseUrl: string): string {
  return new URL(value, apiBaseUrl).href
}
