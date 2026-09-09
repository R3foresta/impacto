import { useQueries } from '@tanstack/react-query'
import { Info, Leaf, TrendingDown, Undo2 } from 'lucide-react'

import { getImpactCampaignDetail } from '../../api/impact'
import { formatCount, formatPercentage } from '../../lib/formatters'
import type { ImpactCampaignCard, ImpactCampaignDetail, ImpactDashboard } from '../../types/impact'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

type RestorationPerformanceProps = {
  organizationId: number
  campaigns: ImpactCampaignCard[]
  summary: ImpactDashboard['summary']
}

type SpeciesMixItem = {
  id: number
  label: string
  scientificName: string | null
  quantity: number
}

const speciesColors = ['#1d513a', '#56a875', '#9ac9a1', '#b18338', '#6f7f76']

export function RestorationPerformance({
  organizationId,
  campaigns,
  summary,
}: RestorationPerformanceProps) {
  const campaignDetailQueries = useQueries({
    queries: campaigns.map((campaign) => ({
      queryKey: [
        'impact',
        'campaign-detail',
        String(organizationId),
        String(campaign.id),
      ],
      queryFn: () => getImpactCampaignDetail(organizationId, campaign.id),
      staleTime: 60_000,
    })),
  })
  const campaignDetails = campaignDetailQueries.flatMap((query) =>
    query.data ? [query.data] : [],
  )
  const species = collectSpecies(campaignDetails)
  const speciesPending = campaignDetailQueries.some((query) => query.isPending)
  const speciesUnavailable =
    campaignDetailQueries.length > 0 && campaignDetailQueries.every((query) => query.isError)

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
        <SpeciesCard
          pending={speciesPending}
          species={species}
          unavailable={speciesUnavailable}
        />
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

function SpeciesCard({
  pending,
  species,
  unavailable,
}: {
  pending: boolean
  species: SpeciesMixItem[]
  unavailable: boolean
}) {
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
        {pending && species.length === 0 ? <InlineEmpty message="Consultando especies registradas…" /> : null}
        {unavailable ? <InlineEmpty message="No fue posible consultar el detalle de especies." /> : null}
        {!pending && !unavailable && species.length === 0 ? (
          <InlineEmpty message="Las campañas todavía no tienen especies detalladas." />
        ) : null}
        {visibleSpecies.length > 0 ? (
          <>
            <div className="flex h-3 overflow-hidden rounded-full bg-mist-100" aria-label={`${formatCount(species.length)} especies registradas`}>
              {visibleSpecies.map((item, index) => (
                <span
                  aria-hidden="true"
                  key={item.id}
                  style={{
                    backgroundColor: speciesColors[index] ?? speciesColors.at(-1),
                    width: `${total > 0 ? (item.quantity / total) * 100 : 0}%`,
                  }}
                />
              ))}
            </div>
            <div className="mt-6 space-y-4">
              {visibleSpecies.map((item, index) => (
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3" key={item.id}>
                  <span className="mt-1 size-3 rounded-sm" style={{ backgroundColor: speciesColors[index] ?? speciesColors.at(-1) }} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-h)]">{item.label}</p>
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

function InlineEmpty({ message }: { message: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-[var(--border)] bg-mist-50 px-5 text-center text-sm leading-6 text-[var(--text)]">
      {message}
    </div>
  )
}

function collectSpecies(details: ImpactCampaignDetail[]): SpeciesMixItem[] {
  const speciesById = new Map<number, SpeciesMixItem>()

  for (const detail of details) {
    for (const record of detail.plantingRecords) {
      for (const species of record.species) {
        const current = speciesById.get(species.id)
        const label = species.commonName ?? species.scientificName ?? `Especie ${species.id}`
        speciesById.set(species.id, {
          id: species.id,
          label,
          scientificName: species.scientificName,
          quantity: (current?.quantity ?? 0) + species.quantity,
        })
      }
    }
  }

  return [...speciesById.values()].sort((a, b) => b.quantity - a.quantity)
}

function collapseSpecies(species: SpeciesMixItem[]): SpeciesMixItem[] {
  if (species.length <= 5) return species

  const remaining = species.slice(4)
  return [
    ...species.slice(0, 4),
    {
      id: -1,
      label: `Otras ${remaining.length} especies`,
      scientificName: null,
      quantity: remaining.reduce((sum, item) => sum + item.quantity, 0),
    },
  ]
}
