import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Camera, ChevronLeft, ChevronRight, Expand, MapPin, RotateCcw } from 'lucide-react'

import { getImpactEvidenceGallery } from '../../api/impact'
import { formatCount, formatDate } from '../../lib/formatters'
import type {
  ImpactCampaignCard,
  ImpactEvidence,
  ImpactEvidenceFilters,
  ImpactPlantingPoint,
  ImpactSpeciesMixItem,
} from '../../types/impact'
import { EvidenceViewer } from '../evidence/evidence-viewer'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

type EvidenceListProps = {
  organizationId?: number
  evidence?: ImpactEvidence[]
  totalCount?: number
  plantingPoints?: ImpactPlantingPoint[]
  campaigns?: Pick<ImpactCampaignCard, 'id' | 'name'>[]
  speciesMix?: ImpactSpeciesMixItem[]
}

type GalleryFilterState = {
  campaignId: string
  speciesId: string
  from: string
  to: string
}

const initialFilters: GalleryFilterState = {
  campaignId: '',
  speciesId: '',
  from: '',
  to: '',
}

export function EvidenceList({
  campaigns = [],
  organizationId,
  evidence: staticEvidence = [],
  plantingPoints = [],
  speciesMix = [],
  totalCount = staticEvidence.length,
}: EvidenceListProps) {
  const [filters, setFilters] = useState<GalleryFilterState>(initialFilters)
  const [page, setPage] = useState(1)
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null)
  const requestFilters: ImpactEvidenceFilters = {
    page,
    pageSize: 24,
    campaignId: toOptionalNumber(filters.campaignId),
    speciesId: toOptionalNumber(filters.speciesId),
    from: filters.from || undefined,
    to: filters.to || undefined,
  }
  const isRemoteGallery = organizationId !== undefined
  const galleryQuery = useQuery({
    queryKey: [
      'impact',
      'evidence-gallery',
      String(organizationId ?? 'campaign-detail'),
      requestFilters.page,
      requestFilters.pageSize,
      requestFilters.campaignId ?? null,
      requestFilters.speciesId ?? null,
      requestFilters.from ?? null,
      requestFilters.to ?? null,
    ],
    queryFn: () => getImpactEvidenceGallery(organizationId ?? 0, requestFilters),
    enabled: isRemoteGallery,
    staleTime: 60_000,
  })
  const gallery = galleryQuery.data
  const evidence = gallery?.items ?? staticEvidence
  const evidenceTotal = gallery?.total ?? totalCount
  const pointByPlantingRecord = new Map(plantingPoints.map((point) => [point.id, point]))
  const campaignNameById = new Map(campaigns.map((campaign) => [campaign.id, campaign.name]))
  const filtered = filters.campaignId || filters.speciesId || filters.from || filters.to

  function updateFilter(field: keyof GalleryFilterState, value: string) {
    setFilters((current) => ({ ...current, [field]: value }))
    setPage(1)
    setSelectedEvidenceId(null)
  }

  function resetFilters() {
    setFilters(initialFilters)
    setPage(1)
    setSelectedEvidenceId(null)
  }

  return (
    <section aria-labelledby="evidence-title" className="scroll-mt-28 pb-8" id="evidencia">
      <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700">
            <span className="mr-3 font-mono text-stone-500">05</span>Evidencia publicada
          </p>
          <h2
            className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--text-h)] sm:text-5xl"
            id="evidence-title"
          >
            Anexo visual · {formatCount(evidenceTotal)} evidencias
          </h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[var(--text)]">
          Cada imagen conserva su vínculo con el registro de plantación y el archivo publicado.
          {isRemoteGallery
            ? 'Puedes filtrar la galería por campaña, especie o fecha de captura.'
            : 'Cuando el punto está incluido en el API, también se muestra la coordenada y la cantidad registrada.'}
        </p>
      </div>

      {isRemoteGallery ? <fieldset className="mt-9 grid gap-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-5 sm:grid-cols-2 lg:grid-cols-5 sm:p-6">
        <legend className="sr-only">Filtros de evidencia</legend>
        <FilterField label="Campaña">
          <select
            aria-label="Filtrar evidencia por campaña"
            className="filter-control"
            onChange={(event) => updateFilter('campaignId', event.target.value)}
            value={filters.campaignId}
          >
            <option value="">Todas las campañas</option>
            {campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
          </select>
        </FilterField>
        <FilterField label="Especie">
          <select
            aria-label="Filtrar evidencia por especie"
            className="filter-control"
            onChange={(event) => updateFilter('speciesId', event.target.value)}
            value={filters.speciesId}
          >
            <option value="">Todas las especies</option>
            {speciesMix.map((species) => (
              <option key={species.speciesId} value={species.speciesId}>
                {species.commonName ?? species.scientificName ?? `Especie ${species.speciesId}`}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Desde">
          <input
            aria-label="Filtrar evidencia desde una fecha"
            className="filter-control"
            onChange={(event) => updateFilter('from', event.target.value)}
            type="date"
            value={filters.from}
          />
        </FilterField>
        <FilterField label="Hasta">
          <input
            aria-label="Filtrar evidencia hasta una fecha"
            className="filter-control"
            onChange={(event) => updateFilter('to', event.target.value)}
            type="date"
            value={filters.to}
          />
        </FilterField>
        <div className="flex items-end">
          <Button className="w-full" disabled={!filtered} onClick={resetFilters} variant="outline">
            <RotateCcw aria-hidden="true" /> Limpiar filtros
          </Button>
        </div>
      </fieldset> : null}

      {isRemoteGallery && galleryQuery.isPending ? (
        <div aria-live="polite" className="mt-9"><EmptyState detail="Consultando las evidencias publicadas." title="Cargando galería" /></div>
      ) : null}

      {isRemoteGallery && galleryQuery.isError ? (
        <div className="mt-9"><EmptyState detail="No fue posible cargar la galería pública. Intenta nuevamente." title="Galería no disponible" /></div>
      ) : null}

      {(!isRemoteGallery || gallery) && evidence.length === 0 ? (
        <div className="mt-9">
          <EmptyState
            detail={filtered ? 'No hay evidencias publicadas que coincidan con los filtros seleccionados.' : 'No hay fotografías publicadas para este impacto.'}
            title="Sin evidencia disponible"
          />
        </div>
      ) : null}

      {(!isRemoteGallery || gallery) && evidence.length > 0 ? (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {evidence.map((item) => {
              const point = pointByPlantingRecord.get(item.plantingRecordId)
              const campaignName = campaignNameById.get(item.campaignId) ?? `Campaña ${item.campaignId}`

              return (
                <article
                  className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white shadow-[0_16px_45px_rgba(23,47,35,0.06)]"
                  key={item.id}
                >
                  <button
                    aria-label={`Ver detalle de ${item.title ?? `evidencia ${item.id}`}`}
                    className="group relative isolate block aspect-[4/3] w-full overflow-hidden bg-forest-950 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                    onClick={() => setSelectedEvidenceId(item.id)}
                    type="button"
                  >
                    <img
                      alt={item.title ?? `Evidencia de plantación ${item.plantingRecordId}`}
                      className="absolute inset-0 -z-10 size-full object-cover transition duration-500 group-hover:scale-[1.035]"
                      loading="lazy"
                      src={item.imageUrl}
                    />
                    <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,28,19,0.06)_35%,rgba(5,28,19,0.82)_100%)]" />
                    <span className="flex h-full flex-col justify-between p-4 text-white">
                      <span className="flex items-start justify-between gap-3">
                        <span className="rounded-lg border border-white/16 bg-black/30 px-2.5 py-1.5 font-mono text-xs backdrop-blur-md">
                          Evidencia · {item.id}
                        </span>
                        <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-forest-950 shadow-sm">
                          <Expand aria-hidden="true" className="size-4" /> Ver detalle
                        </span>
                      </span>
                      {point ? (
                        <span className="inline-flex items-center gap-2 font-mono text-xs text-white/86">
                          <MapPin aria-hidden="true" className="size-3.5 text-[#7bd39e]" />
                          {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                        </span>
                      ) : null}
                    </span>
                  </button>

                  <div className="p-5">
                    <h3 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-[var(--text-h)]">
                      {item.title ?? 'Evidencia de plantación'}
                    </h3>
                    <dl className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)] text-sm">
                      {point ? <EvidenceFact label="Cantidad" value={`${formatCount(point.treesPlanted)} árboles`} /> : null}
                      <EvidenceFact label="Fecha" value={formatDate(item.takenAt)} />
                      <EvidenceFact label="Campaña" value={campaignName} />
                      <EvidenceFact label="Trazabilidad" value={item.publicTraceabilityCode ?? 'No disponible'} />
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {point ? <Badge className="border-[#dce7dd] bg-[#f1f6f1] text-forest-800" variant="outline">GPS disponible</Badge> : null}
                      <Badge variant="outline">Archivo publicado</Badge>
                      {item.isPrimary ? <Badge variant="secondary">Evidencia principal</Badge> : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="mt-8 flex flex-col gap-4 border-t border-[var(--border)] pt-5 text-sm text-[var(--text)] sm:flex-row sm:items-center sm:justify-between">
            <p>Mostrando {formatCount(evidence.length)} de {formatCount(evidenceTotal)} evidencias · ordenadas por fecha</p>
            {gallery && gallery.totalPages > 0 ? (
              <div className="flex items-center gap-2">
                <Button aria-label="Página anterior" disabled={gallery.page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} size="icon-sm" variant="outline">
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <span aria-live="polite" className="min-w-24 text-center text-xs text-stone-500">Página {gallery.page} de {gallery.totalPages}</span>
                <Button aria-label="Página siguiente" disabled={gallery.page >= gallery.totalPages} onClick={() => setPage((current) => current + 1)} size="icon-sm" variant="outline">
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            ) : null}
            <p className="inline-flex items-center gap-2 text-xs text-stone-500"><Camera aria-hidden="true" className="size-3.5" /> Archivo publicado disponible en cada tarjeta</p>
          </div>
          <EvidenceViewer
            campaigns={campaigns}
            evidence={evidence}
            onClose={() => setSelectedEvidenceId(null)}
            onSelect={setSelectedEvidenceId}
            plantingPoints={plantingPoints}
            selectedEvidenceId={selectedEvidenceId}
          />
        </>
      ) : null}
    </section>
  )
}

function FilterField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-[var(--text)]">
      {label}
      {children}
    </label>
  )
}

function EvidenceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] gap-3 py-2.5">
      <dt className="text-[var(--text)]">{label}</dt>
      <dd className="truncate text-right font-medium text-[var(--text-h)]" title={value}>{value}</dd>
    </div>
  )
}

function toOptionalNumber(value: string): number | undefined {
  return value ? Number(value) : undefined
}
