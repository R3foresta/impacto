import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, CalendarDays, Layers3, Link2, MapPin, Sprout } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { getSeedBankOverview, getSeedCollections, ImpactApiError } from '../api/impact'
import { MetricCard } from '../components/dashboard/metric-card'
import { EmptyState } from '../components/feedback/empty-state'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'
import { SeedBankFiltersForm } from '../components/seed-bank/seed-bank-filters'
import { SeedBankHero } from '../components/seed-bank/seed-bank-hero'
import { SeedCollectionCard } from '../components/seed-bank/seed-collection-card'
import { formatCount, formatDate } from '../lib/formatters'
import type { SeedBankFilters } from '../types/seed-bank'

const pageSize = 12
const validDate = (value: string | null) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value ? value : undefined
const validId = (value: string | null) => value && /^[1-9]\d*$/.test(value) ? value : undefined

export function SeedBankPage() {
  const [params, setParams] = useSearchParams()
  const pageValue = Number(params.get('page'))
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const blockchain = params.get('blockchain')
  const filters: SeedBankFilters = {
    q: params.get('q')?.trim() || undefined,
    speciesId: validId(params.get('speciesId')),
    locationId: validId(params.get('locationId')),
    from: validDate(params.get('from')),
    to: validDate(params.get('to')),
    blockchain: blockchain === 'with-link' || blockchain === 'without-link' ? blockchain : undefined,
    sort: params.get('sort') === 'date-asc' ? 'date-asc' : 'date-desc',
    page,
    pageSize,
  }
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to)
  const overviewQuery = useQuery({
    queryKey: ['impact', 'seed-bank', 'overview'],
    queryFn: ({ signal }) => getSeedBankOverview(signal),
    staleTime: 60_000,
  })
  const collectionsQuery = useQuery({
    queryKey: ['impact', 'seed-bank', 'collections', filters],
    queryFn: ({ signal }) => getSeedCollections(filters, signal),
    enabled: !invalidRange,
    staleTime: 60_000,
  })
  const overview = overviewQuery.data
  const collections = collectionsQuery.data
  const hasFilters = Boolean(filters.q || filters.speciesId || filters.locationId || filters.from || filters.to || filters.blockchain)
  const missingEndpoint = [overviewQuery.error, collectionsQuery.error].some((error) => error instanceof ImpactApiError && error.status === 404)

  function changePage(nextPage: number) {
    const next = new URLSearchParams(params)
    if (nextPage === 1) next.delete('page')
    else next.set('page', String(nextPage))
    setParams(next)
    document.getElementById('colecciones')?.scrollIntoView({ behavior: 'instant', block: 'start' })
    document.getElementById('collections-title')?.focus({ preventScroll: true })
  }

  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader />
      <SeedBankHero loading={overviewQuery.isPending} overview={overview} />
      <main className="mx-auto flex w-full max-w-[96rem] flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        {overview ? (
          <section aria-label="Resumen global del banco de semillas" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold uppercase tracking-[.15em] text-forest-700">El banco en cifras</p><p className="text-xs text-[var(--text)]">Totales de todas las recolecciones · Sin aplicar filtros</p></div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-5">
              <MetricCard Icon={Sprout} label="Especies recolectadas" value={formatCount(overview.summary.speciesCount)} />
              <MetricCard Icon={MapPin} label="Lugares de origen" value={formatCount(overview.summary.locationsCount)} />
              <MetricCard Icon={Link2} label="Con enlace de acuñación" value={formatCount(overview.summary.mintedCollectionsCount)} />
              <MetricCard Icon={CalendarDays} label="Última recolección" value={overview.summary.lastCollectionAt ? formatDate(overview.summary.lastCollectionAt) : 'Sin fecha publicada'} />
            </div>
          </section>
        ) : null}
        {overviewQuery.isError ? <ErrorState title="Resumen global no disponible" detail={missingEndpoint ? 'La fuente pública del banco de semillas todavía no está disponible.' : 'No se pudieron consultar los totales. Puedes volver a intentarlo.'} action={{ label: 'Reintentar resumen', onClick: () => void overviewQuery.refetch() }} /> : null}

        <section aria-labelledby="collections-title" className="space-y-6" id="colecciones">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[.15em] text-forest-700">De la recolección al futuro bosque</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.035em] text-forest-950 sm:text-4xl" id="collections-title" tabIndex={-1}>Banco de semillas</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text)]">Todas las recolecciones de semillas publicadas, con su cantidad, fecha y lugar de origen. Entra a cada registro para conocer su trazabilidad.</p></div>
            <span className="flex items-center gap-2 text-sm text-[var(--text)]"><Layers3 aria-hidden="true" className="size-4 text-forest-700" />{collections ? `${formatCount(collections.total)} ${hasFilters ? 'resultados' : 'recolecciones'}` : 'Registros de recolección'}</span>
          </div>

          <SeedBankFiltersForm
            filters={filters}
            hasFilters={hasFilters}
            key={params.toString()}
            onApply={setParams}
            onReset={() => setParams(new URLSearchParams())}
            overview={overview}
          />

          {invalidRange ? <ErrorState title="Revisa el rango de fechas" detail="La fecha final debe ser igual o posterior a la inicial." /> : collectionsQuery.isPending ? <LoadingState detail="Consultando recolecciones de semillas." /> : collectionsQuery.isError ? <ErrorState title="No se pudieron cargar las recolecciones" detail={missingEndpoint ? 'El banco mostrará los registros cuando la fuente pública esté disponible.' : 'La fuente pública no respondió correctamente. Intenta nuevamente.'} action={{ label: 'Reintentar recolecciones', onClick: () => void collectionsQuery.refetch() }} /> : collections ? (
            <>
              <p aria-live="polite" className="text-sm text-[var(--text)]" role="status">{collections.total > 0 && collections.items.length > 0 ? `Mostrando ${formatCount((collections.page - 1) * collections.pageSize + 1)}–${formatCount((collections.page - 1) * collections.pageSize + collections.items.length)} de ${formatCount(collections.total)} recolecciones` : 'Sin recolecciones en esta consulta'}</p>
              {collections.items.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{collections.items.map((collection) => <SeedCollectionCard collection={collection} key={collection.id} />)}</div> : <EmptyState title={page > 1 ? 'Esta página no tiene registros' : hasFilters ? 'No hay coincidencias' : 'Aún no hay recolecciones publicadas'} detail={hasFilters ? 'Prueba con otra especie, lugar o rango de fechas.' : 'Aquí aparecerán las semillas cuando se publiquen sus registros.'} action={page > 1 ? { label: 'Volver a la primera página', onClick: () => changePage(1) } : hasFilters ? { label: 'Ver todas las recolecciones', onClick: () => setParams(new URLSearchParams()) } : undefined} />}
              {collections.totalPages > 1 && collections.items.length > 0 ? <nav aria-label="Páginas de recolecciones" className="flex flex-wrap items-center justify-center gap-4 pt-4"><button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-forest-800 disabled:cursor-not-allowed disabled:opacity-40" disabled={collections.page <= 1} onClick={() => changePage(collections.page - 1)} type="button"><ArrowLeft aria-hidden="true" className="size-4" /> Anterior</button><span className="text-sm text-[var(--text)]">Página {formatCount(collections.page)} de {formatCount(collections.totalPages)}</span><button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-forest-800 disabled:cursor-not-allowed disabled:opacity-40" disabled={collections.page >= collections.totalPages} onClick={() => changePage(collections.page + 1)} type="button">Siguiente <ArrowRight aria-hidden="true" className="size-4" /></button></nav> : null}
            </>
          ) : null}
        </section>
        <footer className="border-t border-[var(--border)] pt-6 text-xs leading-6 text-[var(--text)]">Datos publicados por R3Foresta. Las cantidades recolectadas no equivalen a árboles plantados. Cada enlace de acuñación dirige al registro correspondiente en el explorador de Blockchain.</footer>
      </main>
    </div>
  )
}
