import { Check, CircleDot, Clock3 } from 'lucide-react'

import { formatDate, formatStatus } from '../../lib/formatters'
import type { ImpactTimelineEvent } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { VerificationStatus } from './verification-status'

type TraceabilityTimelineProps = {
  events: ImpactTimelineEvent[]
}

const stageLabels = {
  collection: 'Recolección',
  nursery: 'Vivero',
  allocation: 'Asignación',
  planting: 'Plantación',
  monitoring: 'Monitoreo',
  other: 'Evento',
}

function TimelineIcon({ event }: { event: ImpactTimelineEvent }) {
  return event.status.code === 'completed' ? (
    <Check aria-hidden="true" className="size-3.5" />
  ) : event.status.code === 'in_progress' || event.status.code === 'active' ? (
    <CircleDot aria-hidden="true" className="size-3.5" />
  ) : (
    <Clock3 aria-hidden="true" className="size-3.5" />
  )
}

export function TraceabilityTimeline({ events }: TraceabilityTimelineProps) {
  return (
    <section aria-labelledby="timeline-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Trazabilidad</p>
        <h2
          className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]"
          id="timeline-title"
        >
          Línea de tiempo
        </h2>
      </div>
      {events.length === 0 ? (
        <EmptyState
          detail="Todavía no hay eventos disponibles para esta contribución."
          title="Sin eventos de trazabilidad"
        />
      ) : (
        <Card>
          <CardContent className="py-6">
            <ol className="space-y-6">
              {events.map((event) => (
                <li className="flex gap-4" key={String(event.id)}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-mist-100 text-forest-800">
                    <TimelineIcon event={event} />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-[var(--text-h)]">{event.title}</p>
                      <Badge variant="outline">{stageLabels[event.stage]}</Badge>
                      <Badge variant="outline">{formatStatus(event.status)}</Badge>
                    </div>
                    {event.description ? (
                      <p className="text-sm leading-6 text-[var(--text)]">
                        {event.description}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text)]">
                      <span>{formatDate(event.occurredAt)}</span>
                      <VerificationStatus verification={event.verification} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
