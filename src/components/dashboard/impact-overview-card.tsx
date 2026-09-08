import { ArrowRight, CircleCheck, Images, MapPinned } from 'lucide-react'
import { useMemo } from 'react'

import { formatCount, formatDate, formatHectares, formatPercentage } from '../../lib/formatters'
import type { ImpactDashboard, ImpactMapData } from '../../types/impact'
import { OrganizationMark } from '../company/organization-mark'

type ImpactOverviewCardProps = {
  dashboard: ImpactDashboard
}

const previewWidth = 320
const previewHeight = 120
const previewPadding = 12

export function ImpactOverviewCard({ dashboard }: ImpactOverviewCardProps) {
  const { evidencePreview, generatedAt, map, organization, summary } = dashboard
  const hasGoal = summary.treesTarget > 0
  const progress = hasGoal && summary.progressPct !== null
    ? Math.max(0, Math.min(100, summary.progressPct))
    : null
  const hasMapData = map.areas.length > 0 || map.plantingPoints.length > 0
  const recentEvidence = evidencePreview
    .toSorted((left, right) => timestampValue(right.takenAt) - timestampValue(left.takenAt))
    .slice(0, 3)

  return (
    <aside
      aria-labelledby="impact-overview-title"
      className="rounded-[1.5rem] border border-white/12 bg-[#174c35]/62 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6"
    >
      {/* Modificar la parte de el borde inferior */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-5">
        <OrganizationMark
          className="size-20 rounded-xl"
          organization={organization}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.19em] text-[#acd0b7]">
            Organización
          </p>
          <p className="mt-1.5 text-lg font-semibold leading-tight tracking-[-0.025em] text-white sm:text-xl">
            {organization.name}
          </p>
        </div>
      </div>

      {/* eliminar esto o modificar la forma en la que se ve */}
      {/* <h2
        className="mt-5 text-xs font-semibold uppercase tracking-[0.19em] text-[#acd0b7]"
        id="impact-overview-title"
      >
        Resumen de impacto
      </h2>
      <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-[#0b3a29]/24">
        <ReportFact className="col-span-2 border-b border-white/10" horizontal label="Corte de datos" value={formatDate(generatedAt)} />
        <ReportFact className="border-b border-r border-white/10" label="Campañas" value={formatCount(summary.campaignsCount)} />
        <ReportFact className="border-b border-white/10" label="Subcampañas" value={formatCount(summary.subcampaignsCount)} />
        <ReportFact className="border-r border-white/10" label="Ubicaciones" value={formatCount(summary.locationsCount)} />
        <ReportFact label="Superficie" value={formatHectares(summary.hectares)} />
      </dl> */}

      <section aria-labelledby="planting-progress-title" className="mt-5 border-t border-white/10 pt-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4 lg:flex-col lg:items-start xl:flex-row xl:items-end">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.19em] text-[#acd0b7]" id="planting-progress-title">
              Avance de plantación
            </h3>
            <p className="mt-2 text-xl font-semibold tracking-[-0.035em] text-white">
              {hasGoal
                ? `${formatCount(summary.treesPlantedInitial)} / ${formatCount(summary.treesTarget)} árboles`
                : `${formatCount(summary.treesPlantedInitial)} árboles plantados`}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-white/88">
            {progress === null ? 'Meta aún no definida' : `${formatPercentage(progress)} de la meta`}
          </p>
        </div>
        <div
          aria-label="Avance de plantación respecto de la meta"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress ?? undefined}
          aria-valuetext={progress === null ? 'Meta aún no definida' : `${formatPercentage(progress)} de la meta`}
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/12"
          role="progressbar"
        >
          <span
            aria-hidden="true"
            className="block h-full rounded-full bg-[#8ce0ad] transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      </section>

      <section aria-labelledby="territory-shortcut-title" className="mt-5 border-t border-white/10 pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.19em] text-[#acd0b7]" id="territory-shortcut-title">
          Territorio
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.35fr)_minmax(10rem,0.65fr)] sm:items-center lg:grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(10rem,0.75fr)]">
          <TerritoryPreview hasMapData={hasMapData} map={map} />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-6 text-white/86">
              {formatLocationCount(summary.locationsCount)} <span aria-hidden="true">·</span>{' '}
              {formatHectares(summary.hectares)}
            </p>
            {hasMapData ? (
              <a
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                href="#mapa"
              >
                Ver mapa completo <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            ) : (
              <p className="mt-2 text-xs leading-5 text-white/58">Sin datos cartográficos publicados.</p>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="evidence-shortcut-title" className="mt-5 border-t border-white/10 pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.19em] text-[#acd0b7]" id="evidence-shortcut-title">
          Evidencia reciente
        </h3>
        {recentEvidence.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="grid min-w-0 grid-cols-3 gap-2">
              {recentEvidence.map((item) => (
                <div className="aspect-square min-w-0 overflow-hidden rounded-lg border border-white/12 bg-forest-950" key={item.id}>
                  <img
                    alt={item.title ?? `Evidencia de plantación ${item.plantingRecordId}`}
                    className="size-full object-cover"
                    decoding="async"
                    loading="lazy"
                    src={item.imageUrl}
                  />
                </div>
              ))}
            </div>
            <a
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto lg:w-full xl:w-auto"
              href="#evidencia"
            >
              Ver todas <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-white/12 px-4 py-3 text-sm text-white/62">
            <Images aria-hidden="true" className="size-5 shrink-0" />
            Sin evidencia fotográfica publicada.
          </div>
        )}
      </section>

      <p className="mt-5 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-white/68">
        <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#73d8a2]" />
        Información publicada por la fuente de trazabilidad de R3Foresta.
      </p>
    </aside>
  )
}

function ReportFact({
  className = '',
  horizontal = false,
  label,
  value,
}: {
  className?: string
  horizontal?: boolean
  label: string
  value: string
}) {
  return (
    <div
      className={`${horizontal ? 'flex items-center justify-between gap-4' : 'min-w-0'} px-4 py-3 ${className}`}
    >
      <dt className="text-xs leading-5 text-white/55">{label}</dt>
      <dd className={`${horizontal ? 'text-right text-sm' : 'mt-1 text-lg'} truncate font-semibold text-white`} title={value}>
        {value}
      </dd>
    </div>
  )
}

function TerritoryPreview({ hasMapData, map }: { hasMapData: boolean; map: ImpactMapData }) {
  const geometry = useMemo(() => createTerritoryGeometry(map), [map])

  return (
    <div className="relative h-28 overflow-hidden rounded-xl border border-white/12 bg-[radial-gradient(circle_at_75%_22%,rgba(118,183,139,0.32),transparent_31%),linear-gradient(145deg,#0b3023,#174f38)]">
      <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${previewWidth} ${previewHeight}`}>
        <path d="M-20 92 C48 42 84 118 150 66 S252 24 350 72" fill="none" opacity="0.16" stroke="#d6f0de" strokeWidth="1.5" />
        <path d="M-15 35 C50 82 116 4 182 45 S276 105 344 38" fill="none" opacity="0.12" stroke="#d6f0de" strokeWidth="1" />
        {geometry.areaPaths.map((path, index) => (
          <path d={path} fill="rgba(140,224,173,0.22)" fillRule="evenodd" key={`${path.slice(0, 20)}-${index}`} stroke="#8ce0ad" strokeWidth="2" />
        ))}
        {geometry.points.map((point, index) => (
          <g key={`${point.x}-${point.y}-${index}`}>
            <circle cx={point.x} cy={point.y} fill="#ffffff" opacity="0.35" r="5" />
            <circle cx={point.x} cy={point.y} fill="#8ce0ad" r="2.6" />
          </g>
        ))}
      </svg>
      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-[#08291d]/76 px-2.5 py-1 text-[0.68rem] font-semibold text-white/86 backdrop-blur-sm">
        <MapPinned aria-hidden="true" className="size-3.5 text-[#8ce0ad]" />
        {hasMapData ? 'Vista territorial' : 'Mapa no disponible'}
      </span>
    </div>
  )
}

function createTerritoryGeometry(map: ImpactMapData) {
  const areaRings = map.areas.flatMap((area) => area.polygon?.coordinates ?? [])
  const positions = [
    ...areaRings.flat(),
    ...map.plantingPoints.map((point) => [point.longitude, point.latitude]),
  ]

  if (positions.length === 0) return { areaPaths: [], points: [] }

  let minLongitude = positions[0][0]
  let maxLongitude = positions[0][0]
  let minLatitude = positions[0][1]
  let maxLatitude = positions[0][1]

  for (const [longitude, latitude] of positions.slice(1)) {
    minLongitude = Math.min(minLongitude, longitude)
    maxLongitude = Math.max(maxLongitude, longitude)
    minLatitude = Math.min(minLatitude, latitude)
    maxLatitude = Math.max(maxLatitude, latitude)
  }

  const longitudeSpan = Math.max(maxLongitude - minLongitude, 0.0001)
  const latitudeSpan = Math.max(maxLatitude - minLatitude, 0.0001)
  const scale = Math.min(
    (previewWidth - previewPadding * 2) / longitudeSpan,
    (previewHeight - previewPadding * 2) / latitudeSpan,
  )
  const drawnWidth = longitudeSpan * scale
  const drawnHeight = latitudeSpan * scale
  const horizontalOffset = (previewWidth - drawnWidth) / 2
  const verticalOffset = (previewHeight - drawnHeight) / 2

  function project(position: number[]) {
    return {
      x: Number((horizontalOffset + (position[0] - minLongitude) * scale).toFixed(1)),
      y: Number((verticalOffset + (maxLatitude - position[1]) * scale).toFixed(1)),
    }
  }

  const areaPaths = map.areas.flatMap((area) => {
    if (!area.polygon) return []

    const path = area.polygon.coordinates
      .map((ring) => ring
        .map((position, index) => {
          const point = project(position)
          return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        })
        .join(' ') + ' Z')
      .join(' ')

    return [path]
  })

  const points = map.plantingPoints.slice(0, 80).map((point) => project([point.longitude, point.latitude]))
  return { areaPaths, points }
}

function formatLocationCount(value: number) {
  return `${formatCount(value)} ${value === 1 ? 'ubicación' : 'ubicaciones'}`
}

function timestampValue(value: string | null) {
  return value ? new Date(value).getTime() : Number.NEGATIVE_INFINITY
}
