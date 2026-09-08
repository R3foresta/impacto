import { Camera, ExternalLink } from 'lucide-react'

import { formatDate } from '../../lib/formatters'
import type { ImpactEvidence } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'

type EvidenceListProps = { evidence: ImpactEvidence[] }

export function EvidenceList({ evidence }: EvidenceListProps) {
  return (
    <section aria-labelledby="evidence-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Respaldo fotográfico</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]" id="evidence-title">Evidencia disponible</h2>
      </div>
      {evidence.length === 0 ? (
        <EmptyState detail="No hay fotografías publicables para este impacto." title="Sin evidencia disponible" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {evidence.map((item) => (
            <Card className="overflow-hidden" key={item.id}>
              <a href={item.imageUrl} rel="noreferrer" target="_blank">
                <img alt={item.title ?? `Evidencia de plantación ${item.plantingRecordId}`} className="aspect-[4/3] w-full bg-mist-100 object-cover" loading="lazy" src={item.imageUrl} />
              </a>
              <CardContent className="space-y-2 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2">
                    <Camera aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
                    <div><h3 className="font-medium text-[var(--text-h)]">{item.title ?? 'Evidencia de plantación'}</h3><p className="mt-1 text-sm text-[var(--text)]">{formatDate(item.takenAt)}</p></div>
                  </div>
                  <a aria-label="Abrir imagen" className="rounded-md p-1 text-forest-800 hover:bg-mist-100 focus-visible:ring-2 focus-visible:ring-[var(--accent)]" href={item.imageUrl} rel="noreferrer" target="_blank"><ExternalLink aria-hidden="true" className="size-4" /></a>
                </div>
                {item.isPrimary ? <Badge variant="secondary">Principal</Badge> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
