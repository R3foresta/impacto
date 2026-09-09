import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { Activity, Info, Leaf, TrendingDown, Undo2 } from 'lucide-react'

import { getImpactMonitoringTimeline } from '../../api/impact'
import { formatCount, formatPercentage } from '../../lib/formatters'
import type {
  ImpactCampaignCard,
  ImpactDashboard,
  ImpactMonitoringTimeline,
  ImpactSpeciesMixItem,
} from '../../types/impact'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

type RestorationPerformanceProps = {
  organizationId: number
  campaigns: ImpactCampaignCard[]
  summary: ImpactDashboard['summary']
  speciesMix: ImpactSpeciesMixItem[]
}

const speciesColors = ['#1d513a', '#56a875', '#9ac9a1', '#b18338', '#6f7f76']

export function RestorationPerformance({
  organizationId,
  campaigns,
  summary,
  speciesMix,
}: RestorationPerformanceProps) {
  const timelineQuery = useQuery({
    queryKey: ['impact', 'monitoring-timeline', String(organizationId)],
    queryFn: () => getImpactMonitoringTimeline(organizationId),
    staleTime: 60_000,
  })

  return (
    <section aria-labelledby="performance-title" className="scroll-mt-28" id="monitoreo">
      <div className="grid gap-7 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700">
            <span className="mr-3 font-mono text-stone-500">02</span>Monitoreo
          </p>
          <h2
            className="mt-4 max-w-[12ch] text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-[var(--text-h)] sm:text-5xl"
            id="performance-title"
          >
            Desempeño de la restauración
          </h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[var(--text)] sm:text-lg sm:leading-8">
          Supervivencia reportada, diferencia calculada de pérdidas, reposiciones y especies según los
          registros publicados de las campañas asociadas.
        </p>
      </div>

      <div className="mt-10 grid gap-5 xl:grid-cols-3">
        <SurvivalCard campaigns={campaigns} weightedSurvival={summary.survivalPct} />
        <MortalityCard summary={summary} />
        <SpeciesCard species={speciesMix} />
      </div>

      <div className="mt-6 grid gap-4 rounded-[1.5rem] border border-[#e7dcc2] bg-[#fffdf7] p-5 text-sm shadow-[0_12px_35px_rgba(86,65,27,0.04)] sm:grid-cols-[auto_minmax(0,1fr)] sm:p-6">
        <span className="grid size-10 place-items-center rounded-xl border border-[#eadfca] bg-[#faf4e7] text-[#8c692d]">
          <Info aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="leading-6 text-[#5f5b51]">
            <strong className="font-semibold text-[var(--text-h)]">Aclaración metodológica.</strong>{' '}
            La pérdida mostrada es una diferencia calculada entre plantación inicial más reposiciones
            y árboles reportados vivos, con un mínimo de cero. No acredita eventos de mortalidad;
            una diferencia de cero no confirma ausencia de pérdidas. CO₂ capturado: no disponible,
            pendiente de metodología versionada y validación externa.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.07em]">
            <span className="rounded-md border border-[#dce5dc] bg-[#f1f6f1] px-2.5 py-1 text-forest-800">
              Reportado · fuente operativa
            </span>
            <span className="rounded-md border border-[#dce5dc] bg-white px-2.5 py-1 text-[#526159]">
              Georreferenciado · evidencia
            </span>
            <span className="rounded-md border border-[#eadfca] bg-[#faf4e7] px-2.5 py-1 text-[#8c692d]">
              CO₂ capturado · No disponible
            </span>
          </div>
        </div>
      </div>

      <MonitoringTimeline query={timelineQuery} />
    </section>
  )
}

function SurvivalCard({
  campaigns,
  weightedSurvival,
}: {
  campaigns: ImpactCampaignCard[]
  weightedSurvival: number | null
}) {
  return (
    <Card className="overflow-hidden rounded-[1.5rem] shadow-[0_16px_45px_rgba(23,47,35,0.055)]">
      <CardHeader className="gap-2 p-6 pb-0 sm:p-7 sm:pb-0">
        <CardTitle className="text-xl tracking-[-0.025em]">Supervivencia reportada por campaña</CardTitle>
        <CardDescription className="text-sm leading-6">
          Porcentaje reportado de árboles vivos respecto de plantados. Referencia: 80%. Fecha de observación de supervivencia no disponible.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-80 flex-col p-6 pt-7 sm:p-7 sm:pt-7">
        {campaigns.length > 0 ? (
          <div className="space-y-5">
            {campaigns.map((campaign) => (
              <SurvivalRow campaign={campaign} key={campaign.id} />
            ))}
          </div>
        ) : (
          <InlineEmpty message="Todavía no hay campañas asociadas." />
        )}
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-dashed border-[var(--border)] pt-5 text-sm">
          <span className="text-[var(--text)]">Supervivencia reportada total</span>
          <strong className="font-semibold text-[var(--text-h)]">
            {formatPercentage(weightedSurvival)}
          </strong>
        </div>
      </CardContent>
    </Card>
  )
}

function SurvivalRow({ campaign }: { campaign: ImpactCampaignCard }) {
  const value = campaign.impact.survivalPct
  const progress = value ?? 0
  const color = value === null ? '#a9b0aa' : value >= 80 ? '#247044' : value >= 70 ? '#b18418' : '#ad3535'

  return (
    <div>
      <div className="flex items-start justify-between gap-4 text-sm">
        <span className="line-clamp-2 font-medium leading-5 text-[var(--text-h)]">{campaign.name}</span>
        <strong className="shrink-0 font-semibold text-[var(--text-h)]">
          {formatPercentage(value)}
        </strong>
      </div>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-mist-100">
        <span aria-hidden="true" className="absolute inset-y-0 left-[80%] w-px bg-[#809086]" />
        <span
          className="block h-full rounded-full"
          style={{ backgroundColor: color, width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  )
}

function MortalityCard({ summary }: { summary: ImpactDashboard['summary'] }) {
  const plantedTotal = summary.treesPlantedInitial + summary.treesReplanted
  const mortality = Math.max(0, plantedTotal - summary.treesAliveReported)
  const scale = Math.max(mortality, summary.treesReplanted, 1)

  return (
    <Card className="overflow-hidden rounded-[1.5rem] shadow-[0_16px_45px_rgba(23,47,35,0.055)]">
      <CardHeader className="gap-2 p-6 pb-0 sm:p-7 sm:pb-0">
        <CardTitle className="text-xl tracking-[-0.025em]">Pérdidas calculadas y reposiciones</CardTitle>
        <CardDescription className="text-sm leading-6">
          Diferencia calculada: plantación inicial más reposiciones menos árboles reportados vivos, con un mínimo de cero. No representa eventos de mortalidad verificados.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-80 flex-col p-6 pt-7 sm:p-7 sm:pt-7">
        <div className="space-y-7">
          {plantedTotal > 0 ? <BalanceRow
            color="#ad3535"
            Icon={TrendingDown}
            label="Pérdida calculada"
            scale={scale}
            value={mortality}
          /> : <InlineEmpty message="Sin plantaciones publicadas para calcular pérdidas." />}
          {plantedTotal > 0 && mortality === 0 ? (
            <p className="text-sm leading-6 text-[var(--text)]">Una diferencia de cero no confirma ausencia de pérdidas; no se dispone de eventos de mortalidad en este reporte.</p>
          ) : null}
          <BalanceRow
            color="#315f88"
            Icon={Undo2}
            label="Reposiciones registradas"
            scale={scale}
            value={summary.treesReplanted}
          />
        </div>
        <div className="mt-auto border-t border-dashed border-[var(--border)] pt-5 text-sm leading-6 text-[var(--text)]">
          Base calculada: <strong className="font-semibold text-[var(--text-h)]">{formatCount(plantedTotal)}</strong>{' '}
          árboles entre plantación inicial y reposiciones.
        </div>
      </CardContent>
    </Card>
  )
}

function BalanceRow({
  color,
  Icon,
  label,
  scale,
  value,
}: {
  color: string
  Icon: typeof TrendingDown
  label: string
  scale: number
  value: number
}) {
  const width = value === 0 ? 0 : Math.max(5, (value / scale) * 100)

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm text-[var(--text)]">
          <Icon aria-hidden="true" className="size-4" style={{ color }} />
          {label}
        </span>
        <strong className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-h)]">
          {formatCount(value)}
        </strong>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist-100">
        <span className="block h-full rounded-full" style={{ backgroundColor: color, width: `${width}%` }} />
      </div>
    </div>
  )
}

function SpeciesCard({ species }: { species: ImpactSpeciesMixItem[] }) {
  const total = species.reduce((sum, item) => sum + item.quantity, 0)
  const visibleSpecies = collapseSpecies(species)

  return (
    <Card className="overflow-hidden rounded-[1.5rem] shadow-[0_16px_45px_rgba(23,47,35,0.055)]">
      <CardHeader className="gap-2 p-6 pb-0 sm:p-7 sm:pb-0">
        <CardTitle className="text-xl tracking-[-0.025em]">Mezcla de especies</CardTitle>
        <CardDescription className="text-sm leading-6">
          Distribución de los registros de plantación publicados.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-80 flex-col p-6 pt-7 sm:p-7 sm:pt-7">
        {species.length === 0 ? (
          <InlineEmpty message="Las campañas todavía no tienen especies detalladas." />
        ) : null}
        {visibleSpecies.length > 0 ? (
          <>
            <div className="flex h-3 overflow-hidden rounded-full bg-mist-100" aria-label={`${formatCount(species.length)} especies registradas`}>
              {visibleSpecies.map((item, index) => (
                <span
                  aria-hidden="true"
                  key={item.speciesId}
                  style={{
                    backgroundColor: speciesColors[index] ?? speciesColors.at(-1),
                    width: `${total > 0 ? (item.quantity / total) * 100 : 0}%`,
                  }}
                />
              ))}
            </div>
            <div className="mt-6 space-y-4">
              {visibleSpecies.map((item, index) => (
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3" key={item.speciesId}>
                  <span className="mt-1 size-3 rounded-sm" style={{ backgroundColor: speciesColors[index] ?? speciesColors.at(-1) }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-h)]">
                      {item.commonName ?? item.scientificName ?? `Especie ${item.speciesId}`}
                    </p>
                    {item.scientificName ? (
                      <p className="mt-0.5 truncate text-xs italic text-stone-500">{item.scientificName}</p>
                    ) : null}
                  </div>
                  <p className="text-right text-sm">
                    <strong className="font-semibold text-[var(--text-h)]">
                      {total > 0 ? Math.round((item.quantity / total) * 100) : 0}%
                    </strong>
                    <span className="ml-2 text-stone-500">· {formatCount(item.quantity)}</span>
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}
        <div className="mt-auto flex items-start gap-2 border-t border-dashed border-[var(--border)] pt-5 text-xs leading-5 text-stone-500">
          <Leaf aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-forest-700" />
          La categoría ecológica —nativa altoandina, de valle o tolerante urbana— aún no viene en el API.
        </div>
      </CardContent>
    </Card>
  )
}

function MonitoringTimeline({
  query,
}: {
  query: UseQueryResult<ImpactMonitoringTimeline>
}) {
  if (query.isPending) {
    return <TimelinePanel><InlineEmpty message="Consultando el historial publicado…" /></TimelinePanel>
  }

  if (query.isError) {
    return <TimelinePanel><InlineEmpty message="No fue posible cargar el historial publicado." /></TimelinePanel>
  }

  const { dataAvailability, points } = query.data
  const latest = points.at(-1)
  const recentPoints = points.slice(-4).reverse()
  const hasMortalityMonitoring = dataAvailability.hasMortalityMonitoring

  return (
    <TimelinePanel
      description={hasMortalityMonitoring
        ? 'Cortes acumulados de plantación, reposiciones y eventos de mortandad reportada.'
        : 'Historial de plantaciones y reposiciones. Aún no hay eventos de mortandad reportada.'}
      title={hasMortalityMonitoring ? 'Monitoreo publicado' : 'Historial de plantaciones'}
    >
      {latest ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <TimelineMetric label="Árboles incorporados" value={formatCount(latest.treesMonitored)} />
            <TimelineMetric label="Árboles vivos al corte" value={formatCount(latest.treesAlive)} />
            <TimelineMetric label="Mortandad reportada" value={formatCount(latest.deathsAccumulated)} />
          </div>
          <ol className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {recentPoints.map((point) => (
              <li className="grid gap-1 py-3 text-sm sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4" key={`${point.source}-${point.monitoringRecordId}`}>
                <span className="font-mono text-xs text-stone-500">{point.date}</span>
                <span className="font-medium text-[var(--text-h)]">{timelineSourceLabel(point.source)}</span>
                <span className="text-[var(--text)]">
                  {point.source === 'MORTALITY_REPORT'
                    ? `${formatCount(point.deathsNew)} reportados`
                    : `${formatCount(point.treesMonitored)} árboles acumulados`}
                </span>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <InlineEmpty message="Todavía no hay registros publicados para construir un historial." />
      )}
      <p className="mt-5 text-xs leading-5 text-stone-500">
        {hasMortalityMonitoring
          ? `${formatCount(dataAvailability.mortalityReportsCount)} evento${dataAvailability.mortalityReportsCount === 1 ? '' : 's'} de mortandad reportada.`
          : 'Sin eventos de mortandad, este historial no acredita monitoreo de supervivencia.'}
      </p>
    </TimelinePanel>
  )
}

function TimelinePanel({
  children,
  description = 'Serie histórica de las plantaciones y eventos publicados.',
  title = 'Historial publicado',
}: {
  children: React.ReactNode
  description?: string
  title?: string
}) {
  return (
    <Card className="mt-6 overflow-hidden rounded-[1.5rem] shadow-[0_16px_45px_rgba(23,47,35,0.055)]">
      <CardHeader className="gap-2 p-6 pb-0 sm:p-7 sm:pb-0">
        <CardTitle className="flex items-center gap-2 text-xl tracking-[-0.025em]">
          <Activity aria-hidden="true" className="size-5 text-forest-700" /> {title}
        </CardTitle>
        <CardDescription className="text-sm leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-7 sm:p-7 sm:pt-7">{children}</CardContent>
    </Card>
  )
}

function TimelineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-mist-50 p-4">
      <p className="text-xs text-[var(--text)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[var(--text-h)]">{value}</p>
    </div>
  )
}

function timelineSourceLabel(source: ImpactMonitoringTimeline['points'][number]['source']): string {
  if (source === 'MORTALITY_REPORT') return 'Mortandad reportada'
  return source === 'PLANTING_REPLACEMENT' ? 'Reposición registrada' : 'Plantación inicial'
}

function InlineEmpty({ message }: { message: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-[var(--border)] bg-mist-50 px-5 text-center text-sm leading-6 text-[var(--text)]">
      {message}
    </div>
  )
}

function collapseSpecies(species: ImpactSpeciesMixItem[]): ImpactSpeciesMixItem[] {
  if (species.length <= 5) return species

  const remaining = species.slice(4)
  return [
    ...species.slice(0, 4),
    {
      speciesId: -1,
      commonName: `Otras ${remaining.length} especies`,
      scientificName: null,
      taxonomyId: null,
      ecologicalCategory: null,
      origin: 'UNKNOWN',
      quantity: remaining.reduce((sum, item) => sum + item.quantity, 0),
      quantityStage: 'PLANTED',
    },
  ]
}
