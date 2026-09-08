import { Activity, FolderKanban, MapPinned, Sprout, TreePine } from 'lucide-react'

import { formatCount, formatHectares, formatPercentage } from '../../lib/formatters'
import type { ImpactDashboard } from '../../types/impact'
import { Card, CardContent } from '../ui/card'
import { MetricCard } from './metric-card'

type ImpactSummaryProps = {
  summary: ImpactDashboard['summary']
  attributionNote?: string
}

export function ImpactSummary({ summary, attributionNote }: ImpactSummaryProps) {
  const metrics = [
    { label: 'Meta de árboles', value: formatCount(summary.treesTarget), Icon: Sprout },
    {
      label: 'Plantación inicial',
      value: formatCount(summary.treesPlantedInitial),
      Icon: TreePine,
    },
    {
      label: 'Árboles vivos reportados',
      value: formatCount(summary.treesAliveReported),
      Icon: Activity,
    },
    { label: 'Avance de la meta', value: formatPercentage(summary.progressPct), Icon: FolderKanban },
    { label: 'Supervivencia', value: formatPercentage(summary.survivalPct), Icon: Activity },
    { label: 'Superficie', value: formatHectares(summary.hectares), Icon: MapPinned },
  ]

  return (
    <section aria-labelledby="impact-summary-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Impacto asociado</p>
        <h1
          className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-h)] sm:text-3xl"
          id="impact-summary-title"
        >
          Impacto de campañas asociadas
        </h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, Icon }) => (
          <MetricCard Icon={Icon} key={label} label={label} value={value} />
        ))}
      </div>
      <dl className="grid gap-3 rounded-lg border border-[var(--border)] bg-white p-4 text-sm sm:grid-cols-5">
        <SummaryCount label="Campañas" value={summary.campaignsCount} />
        <SummaryCount label="Subcampañas" value={summary.subcampaignsCount} />
        <SummaryCount label="Ubicaciones" value={summary.locationsCount} />
        <SummaryCount label="Registros" value={summary.plantingRecordsCount} />
        <SummaryCount label="Evidencias" value={summary.evidenceCount} />
      </dl>
      {attributionNote ? (
        <Card className="border-sand-100 bg-sand-100 shadow-none">
          <CardContent className="py-4 text-sm text-[var(--text)]">
            {attributionNote}
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}

function SummaryCount({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[var(--text)]">{label}</dt>
      <dd className="mt-1 font-semibold text-[var(--text-h)]">{formatCount(value)}</dd>
    </div>
  )
}
