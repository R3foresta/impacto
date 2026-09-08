import { useState } from 'react'
import { Camera, Expand, MapPin } from 'lucide-react'

import { formatCount, formatDate } from '../../lib/formatters'
import type { ImpactCampaignCard, ImpactEvidence, ImpactPlantingPoint } from '../../types/impact'
import { EvidenceViewer } from '../evidence/evidence-viewer'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'

type EvidenceListProps = {
  evidence: ImpactEvidence[]
  totalCount?: number
  plantingPoints?: ImpactPlantingPoint[]
  campaigns?: Pick<ImpactCampaignCard, 'id' | 'name'>[]
}

export function EvidenceList({
  campaigns = [],
  evidence,
  plantingPoints = [],
  totalCount = evidence.length,
}: EvidenceListProps) {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null)
  const pointByPlantingRecord = new Map(plantingPoints.map((point) => [point.id, point]))
  const campaignNameById = new Map(campaigns.map((campaign) => [campaign.id, campaign.name]))

  return (
    <section aria-labelledby="evidence-title" className="scroll-mt-28 pb-8" id="evidencia">
      <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700">
            <span className="mr-3 font-mono text-stone-500">05</span>Evidencia verificable
          </p>
          <h2
            className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--text-h)] sm:text-5xl"
            id="evidence-title"
          >
            Anexo visual · {formatCount(totalCount)} evidencias indexadas
          </h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[var(--text)]">
          Cada imagen conserva su vínculo con el registro de plantación y el archivo publicado.
          Cuando el punto está incluido en el API, también se muestra la coordenada y la cantidad
          registrada.
        </p>
      </div>

      {evidence.length === 0 ? (
        <div className="mt-9">
          <EmptyState detail="No hay fotografías publicables para este impacto." title="Sin evidencia disponible" />
        </div>
      ) : (
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
                          <Expand aria-hidden="true" className="size-4" />
                          Ver detalle
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
                      <EvidenceFact label="Registro" value={`PLT-${String(item.plantingRecordId).padStart(6, '0')}`} />
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {point ? (
                        <Badge className="border-[#dce7dd] bg-[#f1f6f1] text-forest-800" variant="outline">
                          GPS disponible
                        </Badge>
                      ) : null}
                      <Badge variant="outline">Registro vinculado</Badge>
                      {item.isPrimary ? <Badge variant="secondary">Evidencia principal</Badge> : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-5 text-sm text-[var(--text)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {formatCount(evidence.length)} de {formatCount(totalCount)} evidencias · ordenadas por fecha
            </p>
            <p className="inline-flex items-center gap-2 text-xs text-stone-500">
              <Camera aria-hidden="true" className="size-3.5" /> Archivo publicado disponible en cada tarjeta
            </p>
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
      )}
    </section>
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
