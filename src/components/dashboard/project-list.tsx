import { CalendarDays, Camera, MapPin, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatCode, formatCount, formatDate, formatPercentage } from '../../lib/formatters'
import type { ImpactCampaignCard } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

type CampaignListProps = {
  organizationId: number
  campaigns: ImpactCampaignCard[]
}

export function CampaignList({ organizationId, campaigns }: CampaignListProps) {
  return (
    <section aria-labelledby="campaigns-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Restauración</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]" id="campaigns-title">
          Campañas asociadas
        </h2>
      </div>
      {campaigns.length === 0 ? (
        <EmptyState detail="Esta organización todavía no tiene campañas asociadas." title="Sin campañas disponibles" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base text-[var(--text-h)]">{campaign.name}</CardTitle>
                  <Badge className="capitalize" variant="outline">{formatCode(campaign.status)}</Badge>
                </div>
                {campaign.description ? <p className="text-sm leading-6 text-[var(--text)]">{campaign.description}</p> : null}
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <CampaignFact Icon={CalendarDays} label="Inicio previsto" value={formatDate(campaign.plannedStartDate)} />
                  <CampaignFact Icon={MapPin} label="Ubicaciones" value={formatCount(campaign.locations.length)} />
                  <CampaignFact Icon={Sprout} label="Avance" value={formatPercentage(campaign.impact.progressPct)} />
                  <CampaignFact Icon={Camera} label="Evidencias" value={formatCount(campaign.evidenceCount)} />
                </dl>
                <Link
                  className="inline-flex rounded-md bg-forest-800 px-3 py-2 text-sm font-medium text-white outline-none transition-colors hover:bg-forest-950 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  to={`/organizations/${organizationId}/campaigns/${campaign.id}`}
                >
                  Ver detalle de campaña
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

function CampaignFact({ Icon, label, value }: { Icon: typeof Sprout; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-[var(--text)]">{label}</dt>
        <dd className="mt-0.5 text-[var(--text-h)]">{value}</dd>
      </div>
    </div>
  )
}
