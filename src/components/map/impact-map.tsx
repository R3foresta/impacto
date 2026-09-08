import { useMemo, useState } from 'react'
import { Camera, CircleCheck, ExternalLink, MapPinned, Navigation, Trees } from 'lucide-react'

import { formatCount, formatHectares } from '../../lib/formatters'
import type { ImpactArea, ImpactMapData, ImpactPlantingPoint } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'

type ImpactMapProps = { map: ImpactMapData }

type Coordinate = {
  latitude: number
  longitude: number
}

type ProjectedPoint = Coordinate & {
  x: number
  y: number
}

const canvas = { width: 1000, height: 620, padding: 72 }

function getOpenStreetMapUrl(latitude: number, longitude: number): string {
  return 'https://www.openstreetmap.org/?mlat=' + latitude + '&mlon=' + longitude + '#map=15/' + latitude + '/' + longitude
}

function getAreaCoordinates(area: ImpactArea): Coordinate[] {
  return area.polygon?.coordinates.flatMap((ring) =>
    ring.map((position) => ({ longitude: position[0] ?? 0, latitude: position[1] ?? 0 })),
  ) ?? []
}

function createProjection(map: ImpactMapData) {
  const coordinates = [
    ...map.areas.flatMap(getAreaCoordinates),
    ...map.plantingPoints.map(({ latitude, longitude }) => ({ latitude, longitude })),
  ]
  const longitudes = coordinates.map((point) => point.longitude)
  const latitudes = coordinates.map((point) => point.latitude)
  const minLongitude = longitudes.length ? Math.min(...longitudes) : -68.2
  const maxLongitude = longitudes.length ? Math.max(...longitudes) : -68
  const minLatitude = latitudes.length ? Math.min(...latitudes) : -16.6
  const maxLatitude = latitudes.length ? Math.max(...latitudes) : -16.4
  const longitudeRange = Math.max(maxLongitude - minLongitude, 0.002)
  const latitudeRange = Math.max(maxLatitude - minLatitude, 0.002)

  return ({ latitude, longitude }: Coordinate): ProjectedPoint => ({
    latitude,
    longitude,
    x: canvas.padding + ((longitude - minLongitude) / longitudeRange) * (canvas.width - canvas.padding * 2),
    y: canvas.padding + ((maxLatitude - latitude) / latitudeRange) * (canvas.height - canvas.padding * 2),
  })
}

export function ImpactMap({ map }: ImpactMapProps) {
  const hasMapData = map.areas.length > 0 || map.plantingPoints.length > 0
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(map.areas[0]?.subcampaignId ?? null)
  const project = useMemo(() => createProjection(map), [map])

  const selectedArea = map.areas.find((area) => area.subcampaignId === selectedAreaId) ?? null
  const visiblePoints = selectedArea
    ? map.plantingPoints.filter((point) => point.subcampaignId === selectedArea.subcampaignId)
    : map.plantingPoints

  return (
    <section aria-labelledby="map-title" className="scroll-mt-28" id="mapa">
      <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700"><span className="mr-3 font-mono text-stone-500">04</span>Mapa ejecutivo</p>
          <h2 className="mt-4 max-w-[12ch] text-4xl font-semibold leading-none tracking-[-0.04em] text-[var(--text-h)] sm:text-5xl" id="map-title">Impacto territorial geolocalizado</h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[var(--text)]">Polígonos publicados y puntos GPS de plantaciones. Selecciona una zona para aislar sus registros y consultar sus indicadores territoriales.</p>
      </div>

      {!hasMapData ? (
        <div className="mt-9"><EmptyState detail="No hay polígonos ni puntos GPS publicables." title="Sin datos de mapa" /></div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white shadow-[0_20px_60px_rgba(23,47,35,0.07)]">
          <div className="flex items-center gap-3 overflow-x-auto border-b border-[var(--border)] px-5 py-4 sm:px-7">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Zonas</span>
            <button aria-pressed={selectedAreaId === null} className={filterClass(selectedAreaId === null)} onClick={() => setSelectedAreaId(null)} type="button">Todas ({map.areas.length})</button>
            {map.areas.map((area) => (
              <button aria-pressed={selectedAreaId === area.subcampaignId} className={filterClass(selectedAreaId === area.subcampaignId)} key={area.subcampaignId} onClick={() => setSelectedAreaId(area.subcampaignId)} type="button">
                {area.name}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.62fr)]">
            <div className="relative min-h-[32rem] overflow-hidden bg-[#e8efe5] lg:min-h-[39rem]">
              <svg aria-label="Representación geográfica de las zonas y puntos publicados" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid meet" role="img" viewBox={'0 0 ' + canvas.width + ' ' + canvas.height}>
                <defs>
                  <pattern height="64" id="impact-grid" patternUnits="userSpaceOnUse" width="64">
                    <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#b9c8b8" strokeOpacity="0.28" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect fill="url(#impact-grid)" height="100%" width="100%" />
                <path d="M-40 172 C180 132 330 212 530 164 S820 100 1060 170" fill="none" stroke="#c4d1c3" strokeOpacity="0.55" strokeWidth="2" />
                <path d="M-50 480 C190 420 370 520 590 475 S850 400 1060 455" fill="none" stroke="#c4d1c3" strokeOpacity="0.45" strokeWidth="2" />

                {map.areas.map((area) => {
                  const areaCoordinates = getAreaCoordinates(area)
                  if (areaCoordinates.length < 3) return null
                  const projected = areaCoordinates.map(project)
                  const points = projected.map(({ x, y }) => x + ',' + y).join(' ')
                  const center = projected.reduce((acc, point) => ({ x: acc.x + point.x / projected.length, y: acc.y + point.y / projected.length }), { x: 0, y: 0 })
                  const selected = selectedAreaId === area.subcampaignId
                  return (
                    <g className="cursor-pointer outline-none" key={area.subcampaignId} onClick={() => setSelectedAreaId(area.subcampaignId)} onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedAreaId(area.subcampaignId)
                      }
                    }} role="button" tabIndex={0}>
                      <title>{'Seleccionar ' + area.name}</title>
                      <polygon fill={selected ? '#5f9771' : '#8ca895'} fillOpacity={selected ? 0.34 : 0.18} points={points} stroke={selected ? '#17583b' : '#668574'} strokeWidth={selected ? 4 : 2.5} />
                      <circle cx={center.x} cy={center.y - 3} fill={selected ? '#104b33' : '#526f60'} r={selected ? 6 : 4.5} />
                      <text fill={selected ? '#123c2d' : '#465d51'} fontSize="17" fontWeight={selected ? 700 : 600} textAnchor="middle" x={center.x} y={center.y + 27}>{area.name.length > 20 ? area.name.slice(0, 18) + '…' : area.name}</text>
                    </g>
                  )
                })}

                {map.plantingPoints.map((point) => {
                  const projected = project(point)
                  const highlighted = selectedAreaId === null || point.subcampaignId === selectedAreaId
                  return (
                    <g key={point.id} opacity={highlighted ? 1 : 0.18}>
                      <title>{formatCount(point.treesPlanted) + ' árboles · ' + point.latitude.toFixed(5) + ', ' + point.longitude.toFixed(5)}</title>
                      <circle cx={projected.x} cy={projected.y} fill="#ffffff" fillOpacity="0.88" r="9" />
                      <circle cx={projected.x} cy={projected.y} fill={point.withinArea ? '#0f5a3a' : '#b58123'} r="5" />
                    </g>
                  )
                })}
              </svg>

              <div className="absolute left-5 top-5 rounded-xl border border-white/70 bg-white/88 px-3 py-2 text-xs font-medium text-[#516259] shadow-sm backdrop-blur-md">
                <span className="inline-flex items-center gap-2"><Navigation aria-hidden="true" className="size-3.5 text-forest-700" /> Coordenadas publicadas</span>
              </div>
              <div className="absolute bottom-5 left-5 flex flex-col gap-2 rounded-xl border border-white/70 bg-white/88 p-3 text-xs text-[#526159] shadow-sm backdrop-blur-md">
                <Legend color="#5f9771" label="Zona publicada" />
                <Legend color="#0f5a3a" label="Punto dentro del área" />
                <Legend color="#b58123" label="Punto fuera del área" />
              </div>
            </div>

            <MapDetailPanel area={selectedArea} points={visiblePoints} totalAreas={map.areas.length} />
          </div>
        </div>
      )}
    </section>
  )
}

function MapDetailPanel({ area, points, totalAreas }: { area: ImpactArea | null; points: ImpactPlantingPoint[]; totalAreas: number }) {
  const trees = points.reduce((total, point) => total + point.treesPlanted, 0)
  const evidence = points.reduce((total, point) => total + point.evidenceCount, 0)
  const insideArea = points.filter((point) => point.withinArea).length

  return (
    <aside className="flex min-h-full flex-col border-t border-[var(--border)] bg-white p-6 lg:border-l lg:border-t-0 lg:p-8" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">{area ? 'Zona seleccionada' : 'Vista general'}</p>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[var(--text-h)]">{area?.name ?? formatCount(totalAreas) + ' zonas publicadas'}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text)]">{area?.locationName ?? 'Cobertura territorial de las campañas asociadas'}</p>

      <dl className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)] text-sm">
        {area ? <DetailFact label="Superficie" value={formatHectares(area.hectares)} /> : null}
        <DetailFact label="Puntos GPS" value={formatCount(points.length)} />
        <DetailFact label="Árboles plantados" value={formatCount(trees)} />
        <DetailFact label="Dentro del área" value={formatCount(insideArea) + ' de ' + formatCount(points.length)} />
        <DetailFact label="Evidencias" value={formatCount(evidence)} />
      </dl>

      <div className="mt-7 flex items-center justify-between gap-4">
        <span className="text-sm text-[var(--text)]">Estado geográfico</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7dd] bg-[#f1f6f1] px-3 py-1.5 text-xs font-semibold text-forest-800">
          <CircleCheck aria-hidden="true" className="size-3.5" />{area?.polygon ? 'Polígono publicado' : 'Datos publicados'}
        </span>
      </div>

      {points.length > 0 ? (
        <div className="mt-auto pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Registros próximos</p>
          <div className="mt-3 space-y-2">
            {points.slice(0, 3).map((point) => (
              <a className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-[var(--text-h)] transition hover:bg-mist-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" href={getOpenStreetMapUrl(point.latitude, point.longitude)} key={point.id} rel="noreferrer" target="_blank">
                <span className="flex min-w-0 items-center gap-2"><MapPinned aria-hidden="true" className="size-4 shrink-0 text-forest-700" /><span className="truncate">{formatCount(point.treesPlanted)} árboles</span></span>
                <ExternalLink aria-hidden="true" className="size-3.5 shrink-0 text-stone-500" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-auto pt-10 text-sm leading-6 text-[var(--text)]"><Trees aria-hidden="true" className="mb-3 size-5 text-forest-700" />Esta zona todavía no tiene puntos GPS publicables.</div>
      )}

      <p className="mt-5 flex items-center gap-2 text-xs text-stone-500"><Camera aria-hidden="true" className="size-3.5" /> Evidencia vinculada a cada registro</p>
    </aside>
  )
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-3"><dt className="text-[var(--text)]">{label}</dt><dd className="text-right font-semibold text-[var(--text-h)]">{value}</dd></div>
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ backgroundColor: color }} />{label}</span>
}

function filterClass(active: boolean): string {
  return active
    ? 'shrink-0 rounded-full bg-forest-800 px-4 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2'
    : 'shrink-0 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-h)] outline-none transition hover:bg-mist-50 focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
}
