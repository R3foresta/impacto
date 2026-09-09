import { useEffect, useRef } from 'react'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  TreePine,
  X,
} from 'lucide-react'

import { formatCount, formatDate } from '../../lib/formatters'
import type { ImpactCampaignCard, ImpactEvidence, ImpactPlantingPoint } from '../../types/impact'
import { Badge } from '../ui/badge'

type EvidenceViewerProps = {
  campaigns?: Pick<ImpactCampaignCard, 'id' | 'name'>[]
  evidence: ImpactEvidence[]
  onClose: () => void
  onSelect: (evidenceId: number) => void
  plantingPoints?: ImpactPlantingPoint[]
  selectedEvidenceId: number | null
}

const emptyCampaigns: Pick<ImpactCampaignCard, 'id' | 'name'>[] = []
const emptyPlantingPoints: ImpactPlantingPoint[] = []

export function EvidenceViewer({
  campaigns = emptyCampaigns,
  evidence,
  onClose,
  onSelect,
  plantingPoints = emptyPlantingPoints,
  selectedEvidenceId,
}: EvidenceViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const selectedIndex = evidence.findIndex((item) => item.id === selectedEvidenceId)
  const selectedEvidence = selectedIndex >= 0 ? evidence[selectedIndex] : null
  const isOpen = selectedEvidence !== null

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  const point = selectedEvidence
    ? plantingPoints.find((item) => item.id === selectedEvidence.plantingRecordId) ?? null
    : null
  const campaignName = selectedEvidence
    ? campaigns.find((item) => item.id === selectedEvidence.campaignId)?.name ??
      `Campaña ${selectedEvidence.campaignId}`
    : ''
  const previousEvidence = selectedIndex > 0 ? evidence[selectedIndex - 1] : null
  const nextEvidence = selectedIndex >= 0 && selectedIndex < evidence.length - 1
    ? evidence[selectedIndex + 1]
    : null

  return (
    <dialog
      aria-describedby="evidence-viewer-description"
      aria-labelledby="evidence-viewer-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/15 bg-white p-0 text-left shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop:bg-[#071710]/78 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      ref={dialogRef}
    >
      {selectedEvidence ? (
        <div className="grid max-h-[calc(100dvh-2rem)] overflow-y-auto lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.65fr)]">
          <div className="relative grid min-h-[42vh] place-items-center overflow-hidden bg-forest-950 lg:min-h-[42rem]">
            <img
              alt={selectedEvidence.title ?? `Evidencia ${selectedEvidence.id}`}
              className="max-h-[70dvh] w-full object-contain lg:max-h-[calc(100dvh-2rem)]"
              src={selectedEvidence.imageUrl}
            />
            <span className="absolute left-4 top-4 rounded-lg border border-white/15 bg-black/45 px-3 py-2 font-mono text-xs text-white backdrop-blur-md">
              EVD-{String(selectedEvidence.id).padStart(6, '0')}
            </span>
            {evidence.length > 1 ? (
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                <ViewerNavigationButton
                  direction="previous"
                  disabled={!previousEvidence}
                  onClick={() => previousEvidence && onSelect(previousEvidence.id)}
                />
                <span className="rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  {selectedIndex + 1} de {evidence.length}
                </span>
                <ViewerNavigationButton
                  direction="next"
                  disabled={!nextEvidence}
                  onClick={() => nextEvidence && onSelect(nextEvidence.id)}
                />
              </div>
            ) : null}
          </div>

          <aside className="flex flex-col p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">
                  Evidencia publicada
                </p>
                <h2
                  className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] text-[var(--text-h)]"
                  id="evidence-viewer-title"
                >
                  {selectedEvidence.title ?? 'Evidencia de plantación'}
                </h2>
              </div>
              <button
                aria-label="Cerrar detalle de evidencia"
                autoFocus
                className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--text)] transition hover:bg-mist-100 hover:text-[var(--text-h)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                onClick={onClose}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--text)]" id="evidence-viewer-description">
              Archivo fotográfico vinculado al registro de plantación publicado.
            </p>

            <dl className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)] text-sm">
              <ViewerFact label="Fecha" value={formatDate(selectedEvidence.takenAt)} />
              <ViewerFact label="Campaña" value={campaignName} />
              <ViewerFact
                label="Registro"
                value={`PLT-${String(selectedEvidence.plantingRecordId).padStart(6, '0')}`}
              />
              <ViewerFact
                label="Trazabilidad"
                value={selectedEvidence.publicTraceabilityCode ?? 'No disponible'}
              />
              {selectedEvidence.species.length > 0 ? (
                <ViewerFact label="Especies" value={formatEvidenceSpecies(selectedEvidence.species)} />
              ) : null}
              {point ? (
                <ViewerFact label="Cantidad" value={`${formatCount(point.treesPlanted)} árboles`} />
              ) : null}
              {point ? (
                <ViewerFact
                  label="Coordenada"
                  value={`${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`}
                />
              ) : null}
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {point ? (
                <Badge className="border-[#dce7dd] bg-[#f1f6f1] text-forest-800" variant="outline">
                  <MapPin aria-hidden="true" className="mr-1 size-3.5" /> GPS disponible
                </Badge>
              ) : null}
              <Badge variant="outline">
                <Camera aria-hidden="true" className="mr-1 size-3.5" /> Archivo publicado
              </Badge>
              {selectedEvidence.isPrimary ? <Badge variant="secondary">Evidencia principal</Badge> : null}
            </div>

            <div className="mt-auto pt-8">
              <a
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                href={selectedEvidence.imageUrl}
                rel="noreferrer"
                target="_blank"
              >
                Abrir archivo original <ExternalLink aria-hidden="true" className="size-4" />
              </a>
              {point ? (
                <a
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-forest-800 transition hover:bg-mist-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  href={getOpenStreetMapUrl(point.latitude, point.longitude)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <TreePine aria-hidden="true" className="size-4" /> Ver ubicación
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </dialog>
  )
}

function ViewerFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-4 py-3">
      <dt className="text-[var(--text)]">{label}</dt>
      <dd className="text-right font-medium text-[var(--text-h)]">{value}</dd>
    </div>
  )
}

function ViewerNavigationButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight
  const label = direction === 'previous' ? 'Evidencia anterior' : 'Evidencia siguiente'

  return (
    <button
      aria-label={label}
      className="grid size-11 place-items-center rounded-full bg-white text-forest-950 shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  )
}

function getOpenStreetMapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
}

function formatEvidenceSpecies(species: ImpactEvidence['species']): string {
  return species
    .map((item) => `${item.commonName ?? item.scientificName ?? `Especie ${item.id}`} · ${formatCount(item.quantity)}`)
    .join(', ')
}
