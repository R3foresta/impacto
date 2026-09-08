import { CircleCheck } from 'lucide-react'

import { formatCount, formatHectares, formatPercentage } from '../../lib/formatters'
import type { ImpactDashboard } from '../../types/impact'

type ImpactSummaryProps = {
  summary: ImpactDashboard['summary']
  attributionNote?: string
}

type Metric = {
  label: string
  value: string
  detail: string
  tag?: string
}

export function ImpactSummary({ summary, attributionNote }: ImpactSummaryProps) {
  const metrics: Metric[] = [
    { label: 'Meta de árboles', value: formatCount(summary.treesTarget), detail: `${formatCount(summary.campaignsCount)} campañas asociadas`, tag: 'Meta' },
    { label: 'Plantación inicial', value: formatCount(summary.treesPlantedInitial), detail: `${formatCount(summary.plantingRecordsCount)} registros operativos`, tag: 'Total' },
    { label: 'Árboles vivos reportados', value: formatCount(summary.treesAliveReported), detail: `${formatCount(summary.treesReplanted)} reposiciones registradas` },
    { label: 'Supervivencia', value: formatPercentage(summary.survivalPct), detail: 'Según los últimos registros publicados', tag: 'Actual' },
    { label: 'Avance de la meta', value: formatPercentage(summary.progressPct), detail: 'Plantación inicial respecto de la meta' },
    { label: 'Hectáreas intervenidas', value: formatHectares(summary.hectares), detail: `${formatCount(summary.locationsCount)} ubicaciones con actividad` },
    { label: 'Subcampañas', value: formatCount(summary.subcampaignsCount), detail: 'Ejecución territorial asociada' },
    { label: 'Evidencias publicadas', value: formatCount(summary.evidenceCount), detail: 'Respaldo fotográfico disponible' },
  ]

  return (
    <section aria-labelledby="impact-summary-title" className="scroll-mt-28" id="impacto">
      <div className="grid gap-7 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700"><span className="mr-3 font-mono text-stone-500">01</span>Resumen ejecutivo</p>
          <h2 className="mt-4 max-w-[12ch] text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--text-h)] sm:text-5xl" id="impact-summary-title">
            Impacto reportado por las campañas asociadas
          </h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[var(--text)] sm:text-lg sm:leading-8">
          Los indicadores se calculan a partir de metas, registros de plantación, monitoreo de supervivencia y evidencia pública. Cada cifra mantiene el contexto de la campaña que la originó.
        </p>
      </div>

      <div className="mt-10 grid gap-px overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--border)] shadow-[0_18px_55px_rgba(23,47,35,0.06)] sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => <MetricCell key={metric.label} metric={metric} />)}
      </div>

      {attributionNote ? (
        <div className="mt-8 grid gap-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-[0_16px_45px_rgba(23,47,35,0.045)] sm:grid-cols-[0.35rem_minmax(0,1fr)_auto] sm:items-center sm:p-8">
          <span aria-hidden="true" className="hidden h-full min-h-16 rounded-full bg-forest-700 sm:block" />
          <p className="text-lg leading-8 tracking-[-0.015em] text-[var(--text-h)]">“{attributionNote}”</p>
          <div className="flex items-center gap-2 text-sm text-[var(--text)] sm:justify-end">
            <CircleCheck aria-hidden="true" className="size-4 text-forest-700" />
            <span><strong className="block font-semibold text-[var(--text-h)]">R3Foresta</strong>Fuente de trazabilidad</span>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MetricCell({ metric }: { metric: Metric }) {
  return (
    <article className="flex min-h-56 flex-col bg-white p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium uppercase tracking-[0.06em] text-[#59645e]">{metric.label}</p>
        {metric.tag ? <span className="rounded-md bg-[#edf4ee] px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-forest-800">{metric.tag}</span> : null}
      </div>
      <p className="mt-7 text-[clamp(2.15rem,3.5vw,3.9rem)] font-semibold leading-none tracking-[-0.055em] text-[var(--text-h)]">{metric.value}</p>
      <p className="mt-auto pt-7 text-sm leading-6 text-[var(--text)]">{metric.detail}</p>
    </article>
  )
}
