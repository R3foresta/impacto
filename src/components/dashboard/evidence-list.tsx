import { ExternalLink, FileText, Image, MapPin, ScanSearch } from 'lucide-react'

import { formatDate } from '../../lib/formatters'
import type { ImpactEvidence } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'
import { Card, CardContent } from '../ui/card'
import { VerificationStatus } from './verification-status'

type EvidenceListProps = {
  evidence: ImpactEvidence[]
}

type ImpactEvidenceType = ImpactEvidence['type']

const evidenceLabels: Record<ImpactEvidenceType, string> = {
  photo: 'Fotografía',
  document: 'Documento',
  geolocation: 'Geolocalización',
  monitoring_record: 'Registro de monitoreo',
  certificate: 'Certificado',
  other: 'Evidencia',
}

function EvidenceIcon({ type }: { type: ImpactEvidenceType }) {
  if (type === 'photo') {
    return <Image aria-hidden="true" className="size-4" />
  }

  if (type === 'geolocation') {
    return <MapPin aria-hidden="true" className="size-4" />
  }

  if (type === 'monitoring_record') {
    return <ScanSearch aria-hidden="true" className="size-4" />
  }

  return <FileText aria-hidden="true" className="size-4" />
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  return (
    <section aria-labelledby="evidence-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Respaldo</p>
        <h2
          className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]"
          id="evidence-title"
        >
          Evidencia disponible
        </h2>
      </div>
      {evidence.length === 0 ? (
        <EmptyState
          detail="No hay evidencia publicable para esta contribución."
          title="Sin evidencia disponible"
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {evidence.map((item) => (
            <Card key={String(item.id)}>
              <CardContent className="flex gap-3 py-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mist-100 text-forest-800">
                  <EvidenceIcon type={item.type} />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-[var(--text-h)]">{item.title}</h3>
                      <p className="mt-1 text-sm text-[var(--text)]">
                        {evidenceLabels[item.type]} · {formatDate(item.capturedAt)}
                      </p>
                    </div>
                    {item.url ? (
                      <a
                        aria-label={`Abrir ${item.title}`}
                        className="rounded-md p-1 text-forest-800 outline-none transition-colors hover:bg-mist-100 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        href={item.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ExternalLink aria-hidden="true" className="size-4" />
                      </a>
                    ) : null}
                  </div>
                  {item.description ? (
                    <p className="text-sm leading-6 text-[var(--text)]">{item.description}</p>
                  ) : null}
                  <VerificationStatus verification={item.verification} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
