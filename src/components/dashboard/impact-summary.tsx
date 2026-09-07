import {
  Activity,
  CircleDollarSign,
  FolderKanban,
  Sprout,
  TreePine,
} from 'lucide-react'

import { formatCount, formatMoney, formatStatus } from '../../lib/formatters'
import type { ImpactSummary } from '../../types/impact'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { MetricCard } from './metric-card'

type ImpactSummaryProps = {
  summary: ImpactSummary
}

export function ImpactSummary({ summary }: ImpactSummaryProps) {
  const metrics = [
    {
      label: 'Aporte vinculado',
      value: formatMoney(summary.totalContribution),
      Icon: CircleDollarSign,
    },
    {
      label: 'Árboles financiados',
      value: formatCount(summary.treesFunded),
      Icon: Sprout,
    },
    {
      label: 'Árboles plantados',
      value: formatCount(summary.treesPlanted),
      Icon: TreePine,
    },
    {
      label: 'Árboles vivos',
      value: formatCount(summary.treesAlive),
      Icon: Activity,
    },
    {
      label: 'Proyectos vinculados',
      value: formatCount(summary.projectsInvolved),
      Icon: FolderKanban,
    },
  ]

  return (
    <section aria-labelledby="impact-summary-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-forest-700">Resumen verificable</p>
          <h1
            className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-h)] sm:text-3xl"
            id="impact-summary-title"
          >
            Impacto de restauración
          </h1>
        </div>
        <Badge variant="outline">{formatStatus(summary.currentStatus)}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, Icon }) => (
          <MetricCard Icon={Icon} key={label} label={label} value={value} />
        ))}
      </div>
      {summary.currentStatus?.detail ? (
        <Card className="border-sand-100 bg-sand-100 shadow-none">
          <CardContent className="py-4 text-sm text-[var(--text)]">
            {summary.currentStatus.detail}
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}
