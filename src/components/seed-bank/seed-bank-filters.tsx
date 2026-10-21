import { Search, SlidersHorizontal } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import type { SeedBankFilters, SeedBankOverview } from '../../types/seed-bank'

type SeedBankFiltersProps = {
  filters: SeedBankFilters
  overview?: SeedBankOverview
  hasFilters: boolean
  onApply: (params: URLSearchParams) => void
  onReset: () => void
}

export function SeedBankFiltersForm({ filters, overview, hasFilters, onApply, onReset }: SeedBankFiltersProps) {
  // Keep selections stable while the independently loaded catalogue arrives.
  const [speciesId, setSpeciesId] = useState(filters.speciesId ?? '')
  const [locationId, setLocationId] = useState(filters.locationId ?? '')

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const fromValue = values.get('from')
    const from = typeof fromValue === 'string' ? fromValue : ''
    const toControl = form.elements.namedItem('to')
    if (!(toControl instanceof HTMLInputElement)) return
    toControl.setCustomValidity(from && toControl.value && from > toControl.value
      ? 'La fecha final debe ser igual o posterior a la inicial.'
      : '')
    if (!form.reportValidity()) return

    const next = new URLSearchParams()
    for (const [key, value] of values.entries()) {
      const normalized = typeof value === 'string' ? value.trim() : ''
      if (normalized && !(key === 'sort' && normalized === 'date-desc')) next.set(key, normalized)
    }
    onApply(next)
  }

  return (
    <form className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6" onSubmit={applyFilters}>
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-forest-950">
        <SlidersHorizontal aria-hidden="true" className="size-4" /> Explora las recolecciones
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--text)]" htmlFor="seed-search">Buscar</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-[var(--text)]" />
            <input className="filter-control pl-10! text-sm" defaultValue={filters.q} id="seed-search" maxLength={150} name="q" placeholder="Especie o código de trazabilidad" type="search" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--text)]" htmlFor="seed-species">Especie</label>
          <select className="filter-control text-sm" id="seed-species" name="speciesId" onChange={(event) => setSpeciesId(event.target.value)} value={speciesId}>
            <option value="">Todas las especies</option>
            {speciesId && !overview?.filters.species.some((species) => String(species.id) === speciesId)
              ? <option value={speciesId}>Especie #{speciesId}</option>
              : null}
            {overview?.filters.species.map((species) => (
              <option key={species.id} value={species.id}>{species.commonName ?? species.scientificName ?? `Especie #${species.id}`}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--text)]" htmlFor="seed-location">Lugar de origen</label>
          <select className="filter-control text-sm" id="seed-location" name="locationId" onChange={(event) => setLocationId(event.target.value)} value={locationId}>
            <option value="">Todos los lugares</option>
            {locationId && !overview?.filters.locations.some((location) => String(location.id) === locationId)
              ? <option value={locationId}>Lugar #{locationId}</option>
              : null}
            {overview?.filters.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--text)]" htmlFor="seed-blockchain">Acuñación en Blockchain</label>
          <select className="filter-control text-sm" defaultValue={filters.blockchain ?? ''} id="seed-blockchain" name="blockchain">
            <option value="">Todos los registros</option>
            <option value="with-link">Con enlace de acuñación</option>
            <option value="without-link">Sin enlace de acuñación</option>
          </select>
        </div>
      </div>
      <div className="mt-4 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <div className="min-w-0 space-y-1.5">
          <label className="block text-xs font-medium text-[var(--text)]" htmlFor="seed-from">Recolectadas desde</label>
          <input className="filter-control min-w-0 text-sm" defaultValue={filters.from} id="seed-from" name="from" onInput={(event) => {
            const to = event.currentTarget.form?.elements.namedItem('to')
            if (to instanceof HTMLInputElement) to.setCustomValidity('')
          }} type="date" />
        </div>
        <div className="min-w-0 space-y-1.5">
          <label className="block text-xs font-medium text-[var(--text)]" htmlFor="seed-to">Hasta</label>
          <input className="filter-control min-w-0 text-sm" defaultValue={filters.to} id="seed-to" name="to" onInput={(event) => event.currentTarget.setCustomValidity('')} type="date" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[var(--text)]" htmlFor="seed-sort">Ordenar por</label>
          <select className="filter-control text-sm" defaultValue={filters.sort} id="seed-sort" name="sort">
            <option value="date-desc">Más recientes primero</option>
            <option value="date-asc">Más antiguas primero</option>
          </select>
        </div>
        <div className="flex min-h-11 items-center gap-4">
          <button className="min-h-11 rounded-xl bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700" type="submit">Aplicar filtros</button>
          {hasFilters ? <button className="min-h-11 text-sm font-medium text-forest-700 underline underline-offset-4" onClick={onReset} type="button">Limpiar</button> : null}
        </div>
      </div>
    </form>
  )
}
