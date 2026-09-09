import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Info,
  Camera,
  CircleCheck,
  ExternalLink,
  MapPinned,
  Navigation,
  Trees,
} from 'lucide-react'
import type { FeatureCollection, Point, Polygon, Position } from 'geojson'
import {
  FullscreenControl,
  Layer,
  Map as MapCanvas,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from 'react-map-gl/maplibre'
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/maplibre'
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  LngLatBoundsLike,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'

import { formatCount, formatDate, formatHectares } from '../../lib/formatters'
import type {
  ImpactArea,
  ImpactCampaignCard,
  ImpactEvidence,
  ImpactMapData,
  ImpactPlantingPoint,
} from '../../types/impact'
import { getTerritorialCheck, getTerritorialStatus, hasComparablePolygon, hasValidCoordinates } from './territorial-check'
import type { TerritorialStatus } from './territorial-check'
import { EvidenceViewer } from '../evidence/evidence-viewer'
import { EmptyState } from '../feedback/empty-state'

type ImpactMapProps = {
  campaigns?: Pick<ImpactCampaignCard, 'id' | 'name'>[]
  evidence?: ImpactEvidence[]
  map: ImpactMapData
}

type AreaProperties = {
  subcampaignId: number
  name: string
  selected: boolean
}

type PointProperties = {
  id: number
  subcampaignId: number
  treesPlanted: number
  territorialStatus: TerritorialStatus
  highlighted: boolean
  selected: boolean
}

const mapStyleUrl = 'https://tiles.openfreemap.org/styles/liberty'
const areaFillLayerId = 'impact-areas-fill'
const pointLayerId = 'impact-planting-points'
const interactiveLayerIds = [pointLayerId, areaFillLayerId]
const fallbackBounds: LngLatBoundsLike = [
  [-68.25, -16.65],
  [-67.95, -16.35],
]
const emptyCampaigns: Pick<ImpactCampaignCard, 'id' | 'name'>[] = []
const emptyEvidence: ImpactEvidence[] = []

const areaFillLayer: FillLayerSpecification = {
  id: areaFillLayerId,
  type: 'fill',
  source: 'impact-areas',
  paint: {
    'fill-color': ['case', ['boolean', ['get', 'selected'], false], '#247044', '#5f9771'],
    'fill-opacity': ['case', ['boolean', ['get', 'selected'], false], 0.42, 0.2],
  },
}

const areaLineLayer: LineLayerSpecification = {
  id: 'impact-areas-outline',
  type: 'line',
  source: 'impact-areas',
  paint: {
    'line-color': ['case', ['boolean', ['get', 'selected'], false], '#0b4a2d', '#4f7560'],
    'line-opacity': 0.95,
    'line-width': ['case', ['boolean', ['get', 'selected'], false], 4, 2],
  },
}

const pointHaloLayer: CircleLayerSpecification = {
  id: 'impact-planting-point-halo',
  type: 'circle',
  source: 'impact-points',
  paint: {
    'circle-color': '#ffffff',
    'circle-opacity': ['case', ['boolean', ['get', 'highlighted'], false], 0.92, 0.25],
    'circle-radius': ['case', ['boolean', ['get', 'selected'], false], 12, 9],
    'circle-stroke-color': '#173c2d',
    'circle-stroke-opacity': ['case', ['boolean', ['get', 'selected'], false], 0.3, 0],
    'circle-stroke-width': 2,
  },
}

const pointLayer: CircleLayerSpecification = {
  id: pointLayerId,
  type: 'circle',
  source: 'impact-points',
  paint: {
    'circle-color': ['match', ['get', 'territorialStatus'], 'inside', '#0f5a3a', 'outside', '#b58123', '#64748b'],
    'circle-opacity': ['case', ['boolean', ['get', 'highlighted'], false], 1, 0.25],
    'circle-radius': ['case', ['boolean', ['get', 'selected'], false], 7, 5],
  },
}

export function ImpactMap({
  campaigns = emptyCampaigns,
  evidence = emptyEvidence,
  map,
}: ImpactMapProps) {
  const hasMapData = map.areas.length > 0 || map.plantingPoints.length > 0
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(
    map.areas[0]?.subcampaignId ?? null,
  )
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null)
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | null>(null)
  const [cursor, setCursor] = useState<'grab' | 'pointer'>('grab')
  const mapRef = useRef<MapRef>(null)

  const selectedArea = map.areas.find((area) => area.subcampaignId === selectedAreaId) ?? null
  const selectedPoint = map.plantingPoints.find((point) => point.id === selectedPointId) ?? null
  const evidenceByPlantingRecord = useMemo(() => {
    const groupedEvidence = new Map<number, ImpactEvidence[]>()
    for (const item of evidence) {
      const recordEvidence = groupedEvidence.get(item.plantingRecordId) ?? []
      recordEvidence.push(item)
      groupedEvidence.set(item.plantingRecordId, recordEvidence)
    }
    return groupedEvidence
  }, [evidence])
  const selectedPointEvidence = selectedPoint
    ? evidenceByPlantingRecord.get(selectedPoint.id) ?? emptyEvidence
    : emptyEvidence
  const visiblePoints = selectedArea
    ? map.plantingPoints.filter((point) => point.subcampaignId === selectedArea.subcampaignId)
    : map.plantingPoints
  const territorialCheck = getTerritorialCheck(visiblePoints, map.areas)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const initialBounds = useMemo(() => getMapBounds(map), [map])
  const areaGeoJson = useMemo<FeatureCollection<Polygon, AreaProperties>>(
    () => ({
      type: 'FeatureCollection',
      features: map.areas.flatMap((area) =>
        hasComparablePolygon(area) && area.polygon
          ? [
              {
                type: 'Feature' as const,
                properties: {
                  subcampaignId: area.subcampaignId,
                  name: area.name,
                  selected: area.subcampaignId === selectedAreaId,
                },
                geometry: area.polygon,
              },
            ]
          : [],
      ),
    }),
    [map.areas, selectedAreaId],
  )
  const pointGeoJson = useMemo<FeatureCollection<Point, PointProperties>>(
    () => ({
      type: 'FeatureCollection',
      features: map.plantingPoints.filter(hasValidCoordinates).map((point) => ({
        type: 'Feature',
        properties: {
          id: point.id,
          subcampaignId: point.subcampaignId,
          treesPlanted: point.treesPlanted,
          territorialStatus: getTerritorialStatus(point, map.areas),
          highlighted: selectedAreaId === null || point.subcampaignId === selectedAreaId,
          selected: point.id === selectedPointId,
        },
        geometry: {
          type: 'Point',
          coordinates: [point.longitude, point.latitude],
        },
      })),
    }),
    [map.plantingPoints, map.areas, selectedAreaId, selectedPointId],
  )

  function focusBounds(bounds: LngLatBoundsLike, maxZoom = 16) {
    mapRef.current?.fitBounds(bounds, {
      duration: 700,
      maxZoom,
      padding: 64,
    })
  }

  function handleAreaSelect(areaId: number | null) {
    setSelectedAreaId(areaId)
    setSelectedPointId(null)
    setSelectedEvidenceId(null)

    if (areaId === null) {
      focusBounds(initialBounds)
      return
    }

    const area = map.areas.find((item) => item.subcampaignId === areaId)
    const areaPositions = area ? getAreaPositions(area) : []
    const areaPoints = map.plantingPoints
      .filter((point) => point.subcampaignId === areaId && hasValidCoordinates(point))
      .map((point) => [point.longitude, point.latitude] satisfies Position)
    focusBounds(getBoundsFromPositions([...areaPositions, ...areaPoints]), 17)
  }

  function locatePoint(point: ImpactPlantingPoint) {
    setSelectedPointId(point.id)
    setSelectedEvidenceId(null)
    focusBounds(getBoundsFromPositions([[point.longitude, point.latitude]]), 17)
    mapContainerRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  function handleMapClick(event: MapLayerMouseEvent) {
    const feature = event.features?.[0]
    if (!feature) {
      setSelectedPointId(null)
      setSelectedEvidenceId(null)
      return
    }

    if (feature.layer.id === pointLayerId) {
      const pointId = Number(feature.properties.id)
      const point = map.plantingPoints.find((item) => item.id === pointId)
      if (!point) return
      setSelectedAreaId(map.areas.some((area) => area.subcampaignId === point.subcampaignId)
        ? point.subcampaignId : null)
      setSelectedPointId(point.id)
      setSelectedEvidenceId(null)
      return
    }

    if (feature.layer.id === areaFillLayerId) {
      handleAreaSelect(Number(feature.properties.subcampaignId))
    }
  }

  return (
    <section aria-labelledby="map-title" className="scroll-mt-28" id="mapa">
      <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700">
            <span className="mr-3 font-mono text-stone-500">04</span>Mapa ejecutivo
          </p>
          <h2
            className="mt-4 max-w-[12ch] text-4xl font-semibold leading-none tracking-[-0.04em] text-[var(--text-h)] sm:text-5xl"
            id="map-title"
          >
            Impacto territorial geolocalizado
          </h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[var(--text)]">
          Cartografía abierta con polígonos y puntos GPS publicados. Selecciona una zona o un
          punto para consultar la intervención sobre el territorio real.
        </p>
      </div>

      {!hasMapData ? (
        <div className="mt-9">
          <EmptyState detail="Comprobación territorial no disponible: no hay polígonos ni puntos GPS publicables." title="Sin datos de mapa" />
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white shadow-[0_20px_60px_rgba(23,47,35,0.07)]">
          <div className="flex items-center gap-3 overflow-x-auto border-b border-[var(--border)] px-5 py-4 sm:px-7">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Zonas
            </span>
            <button
              aria-pressed={selectedAreaId === null}
              className={filterClass(selectedAreaId === null)}
              onClick={() => handleAreaSelect(null)}
              type="button"
            >
              Todas ({map.areas.length})
            </button>
            {map.areas.map((area) => (
              <button
                aria-pressed={selectedAreaId === area.subcampaignId}
                className={filterClass(selectedAreaId === area.subcampaignId)}
                key={area.subcampaignId}
                onClick={() => handleAreaSelect(area.subcampaignId)}
                type="button"
              >
                {area.name}
              </button>
            ))}
          </div>

          <div aria-live="polite" className="border-b border-[var(--border)] px-5 py-4 sm:px-7">
            <p className="mb-2 text-xs font-semibold text-stone-600">
              Comprobación territorial · {selectedArea?.name ?? 'Todas las zonas'}
            </p>
            {territorialCheck.outside.length > 0 ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
                <p className="flex items-start gap-2 font-semibold">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                  <span>{formatCount(territorialCheck.outside.length)} {territorialCheck.outside.length === 1
                    ? 'registro de plantación está fuera del polígono publicado'
                    : 'registros de plantación están fuera del polígono publicado'}</span>
                </p>
                <p className="mt-2 text-sm">Resultado de la comprobación publicada para esta vista.</p>
                <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto p-1">
                  {territorialCheck.outside.map((point) => (
                    <li key={point.id}>
                      <button
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-400 bg-white px-3 py-2 text-left text-sm font-semibold hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800 focus-visible:ring-offset-2"
                        onClick={() => locatePoint(point)}
                        type="button"
                      >
                        <MapPinned aria-hidden="true" className="size-4 shrink-0" />
                        Localizar registro #{point.id} · {formatDate(point.plantedAt)} · {formatCount(point.treesPlanted)} árboles
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : territorialCheck.comparable > 0 ? (
              <p className="flex items-start gap-2 text-sm text-forest-800">
                <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
                Todos los registros comparables de esta vista están dentro del polígono publicado.
              </p>
            ) : null}
            {territorialCheck.unavailable > 0 || territorialCheck.comparable === 0 ? (
              <p className="mt-2 flex items-start gap-2 text-sm text-stone-700">
                <Info aria-hidden="true" className="size-5 shrink-0" />
                <span>Comprobación territorial no disponible{territorialCheck.unavailable > 0
                  ? ` para ${formatCount(territorialCheck.unavailable)} ${territorialCheck.unavailable === 1 ? 'registro' : 'registros'}`
                  : ' en esta vista'}: faltan polígonos, coordenadas válidas o información suficiente.</span>
              </p>
            ) : null}
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.62fr)]">
            <div ref={mapContainerRef} className="relative scroll-mt-28 min-h-[32rem] overflow-hidden bg-[#dfe9df] lg:min-h-[42rem]">
              <MapCanvas
                aria-label="Mapa interactivo de zonas y plantaciones publicadas"
                attributionControl={{ compact: true }}
                cooperativeGestures
                cursor={cursor}
                dragRotate={false}
                initialViewState={{
                  bounds: initialBounds,
                  fitBoundsOptions: { maxZoom: 16, padding: 64 },
                }}
                interactiveLayerIds={interactiveLayerIds}
                mapStyle={mapStyleUrl}
                maxPitch={0}
                maxZoom={19}
                minZoom={3}
                onClick={handleMapClick}
                onMouseEnter={() => setCursor('pointer')}
                onMouseLeave={() => setCursor('grab')}
                pitchWithRotate={false}
                ref={mapRef}
                renderWorldCopies={false}
                reuseMaps
                style={{ height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }}
                touchPitch={false}
                workerUrl={maplibreWorkerUrl}
              >
                <Source data={areaGeoJson} id="impact-areas" type="geojson">
                  <Layer {...areaFillLayer} />
                  <Layer {...areaLineLayer} />
                </Source>
                <Source data={pointGeoJson} id="impact-points" type="geojson">
                  <Layer {...pointHaloLayer} />
                  <Layer {...pointLayer} />
                </Source>

                <FullscreenControl position="top-right" />
                <NavigationControl position="top-right" showCompass={false} visualizePitch={false} />
                <ScaleControl maxWidth={120} position="bottom-left" unit="metric" />

                {selectedPoint ? (
                  <PointPopup
                    evidence={selectedPointEvidence}
                    onClose={() => {
                      setSelectedPointId(null)
                      setSelectedEvidenceId(null)
                    }}
                    onEvidenceSelect={setSelectedEvidenceId}
                    point={selectedPoint}
                    territorialStatus={getTerritorialStatus(selectedPoint, map.areas)}
                  />
                ) : null}
              </MapCanvas>

              <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/80 bg-white/92 px-3 py-2 text-xs font-medium text-[#405249] shadow-md backdrop-blur-md">
                <span className="inline-flex items-center gap-2">
                  <Navigation aria-hidden="true" className="size-3.5 text-forest-700" />
                  OpenFreeMap · OpenStreetMap
                </span>
              </div>
              <div className="pointer-events-none absolute bottom-8 right-3 flex flex-col gap-2 rounded-xl border border-white/80 bg-white/92 p-3 text-xs text-[#405249] shadow-md backdrop-blur-md sm:bottom-10 sm:right-4">
                <Legend color="#247044" label="Zona seleccionada" />
                <Legend color="#0f5a3a" label="Plantación dentro del área" />
                <Legend color="#b58123" label="Plantación fuera del área" />
                <Legend color="#64748b" label="Comprobación no disponible" />
              </div>
            </div>

            <MapDetailPanel area={selectedArea} points={visiblePoints} totalAreas={map.areas.length} check={territorialCheck} />
          </div>
        </div>
      )}
      <EvidenceViewer
        campaigns={campaigns}
        evidence={selectedPointEvidence}
        onClose={() => setSelectedEvidenceId(null)}
        onSelect={setSelectedEvidenceId}
        plantingPoints={map.plantingPoints}
        selectedEvidenceId={selectedEvidenceId}
      />
    </section>
  )
}

function PointPopup({
  evidence,
  onClose,
  onEvidenceSelect,
  point,
  territorialStatus,
}: {
  evidence: ImpactEvidence[]
  onClose: () => void
  onEvidenceSelect: (evidenceId: number) => void
  point: ImpactPlantingPoint
  territorialStatus: TerritorialStatus
}) {
  return (
    <Popup
      anchor="bottom"
      className="impact-map-popup"
      closeButton
      closeOnClick={false}
      latitude={point.latitude}
      longitude={point.longitude}
      maxWidth="22rem"
      offset={14}
      onClose={onClose}
    >
      <div className="w-72 max-w-[calc(100vw-4rem)] p-4 pr-8 text-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">
          Registro de plantación #{point.id}
        </p>
        <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--text-h)]">
          {formatCount(point.treesPlanted)} árboles
        </p>
        <p className="mt-1 text-[var(--text)]">{formatDate(point.plantedAt)}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[#edf4ee] px-2.5 py-1 font-medium text-forest-800">
            {territorialStatus === 'unavailable' ? 'Comprobación no disponible' : territorialStatus === 'inside' ? 'Dentro del área' : 'Fuera del área'}
          </span>
          <span className="rounded-full bg-mist-100 px-2.5 py-1 font-medium text-[#526159]">
            {formatCount(point.evidenceCount)} {point.evidenceCount === 1 ? 'evidencia' : 'evidencias'}
          </span>
        </div>
        {evidence.length > 0 ? (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              Evidencia fotográfica
            </p>
            <div className="flex gap-2">
              {evidence.slice(0, 3).map((item) => (
                <button
                  aria-label={`Ampliar ${item.title ?? `evidencia ${item.id}`}`}
                  className="group relative aspect-square min-w-0 flex-1 overflow-hidden rounded-lg bg-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  key={item.id}
                  onClick={() => onEvidenceSelect(item.id)}
                  type="button"
                >
                  <img
                    alt={item.title ?? `Evidencia ${item.id}`}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                    src={item.imageUrl}
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/62 px-1.5 py-1 text-center text-[0.65rem] font-semibold text-white">
                    Ver detalle
                  </span>
                </button>
              ))}
            </div>
            {point.evidenceCount > evidence.length ? (
              <p className="mt-2 text-xs leading-5 text-[var(--text)]">
                Mostrando {formatCount(evidence.length)} de {formatCount(point.evidenceCount)} archivos disponibles en esta vista.
              </p>
            ) : null}
          </div>
        ) : null}
        <a
          className="mt-4 inline-flex items-center gap-2 font-semibold text-forest-800 hover:text-forest-950"
          href={getOpenStreetMapUrl(point.latitude, point.longitude)}
          rel="noreferrer"
          target="_blank"
        >
          Abrir coordenada <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </Popup>
  )
}

function MapDetailPanel({
  area,
  points,
  totalAreas,
  check,
}: {
  area: ImpactArea | null
  points: ImpactPlantingPoint[]
  totalAreas: number
  check: ReturnType<typeof getTerritorialCheck>
}) {
  const trees = points.reduce((total, point) => total + point.treesPlanted, 0)
  const evidence = points.reduce((total, point) => total + point.evidenceCount, 0)

  return (
    <aside
      aria-live="polite"
      className="flex min-h-full flex-col border-t border-[var(--border)] bg-white p-6 lg:border-l lg:border-t-0 lg:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-700">
        {area ? 'Zona seleccionada' : 'Vista general'}
      </p>
      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-[var(--text-h)]">
        {area?.name ?? `${formatCount(totalAreas)} zonas publicadas`}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text)]">
        {area?.locationName ?? 'Cobertura territorial de las campañas asociadas'}
      </p>

      <dl className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)] text-sm">
        {area ? <DetailFact label="Superficie" value={formatHectares(area.hectares)} /> : null}
        <DetailFact label="Puntos GPS" value={formatCount(points.length)} />
        <DetailFact label="Árboles plantados" value={formatCount(trees)} />
        <DetailFact label="Dentro del área" value={check.comparable > 0 ? `${formatCount(check.inside)} de ${formatCount(check.comparable)} comparables` : 'No disponible'} />
        <DetailFact label="Evidencias" value={formatCount(evidence)} />
      </dl>

      <div className="mt-7 flex items-center justify-between gap-4">
        <span className="text-sm text-[var(--text)]">Estado geográfico</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7dd] bg-[#f1f6f1] px-3 py-1.5 text-xs font-semibold text-forest-800">
          <CircleCheck aria-hidden="true" className="size-3.5" />
          {area?.polygon ? 'Polígono publicado' : 'Datos publicados'}
        </span>
      </div>

      {points.length > 0 ? (
        <div className="mt-auto pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Registros de la vista
          </p>
          <div className="mt-3 space-y-2">
            {points.filter(hasValidCoordinates).slice(0, 3).map((point) => (
              <a
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-[var(--text-h)] transition hover:bg-mist-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                href={getOpenStreetMapUrl(point.latitude, point.longitude)}
                key={point.id}
                rel="noreferrer"
                target="_blank"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <MapPinned aria-hidden="true" className="size-4 shrink-0 text-forest-700" />
                  <span className="truncate">{formatCount(point.treesPlanted)} árboles</span>
                </span>
                <ExternalLink aria-hidden="true" className="size-3.5 shrink-0 text-stone-500" />
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-auto pt-10 text-sm leading-6 text-[var(--text)]">
          <Trees aria-hidden="true" className="mb-3 size-5 text-forest-700" />
          Esta zona todavía no tiene puntos GPS publicables.
        </div>
      )}

      <p className="mt-5 flex items-center gap-2 text-xs text-stone-500">
        <Camera aria-hidden="true" className="size-3.5" /> Evidencia vinculada a cada registro
      </p>
    </aside>
  )
}

function getAreaPositions(area: ImpactArea): Position[] {
  return hasComparablePolygon(area) ? area.polygon?.coordinates.flatMap((ring) => ring) ?? [] : []
}

function getMapBounds(map: ImpactMapData): LngLatBoundsLike {
  const positions = [
    ...map.areas.flatMap(getAreaPositions),
    ...map.plantingPoints.filter(hasValidCoordinates).map((point) => [point.longitude, point.latitude] satisfies Position),
  ]
  return getBoundsFromPositions(positions)
}

function getBoundsFromPositions(positions: Position[]): LngLatBoundsLike {
  if (positions.length === 0) return fallbackBounds

  let minLongitude = positions[0]?.[0] ?? -68.25
  let maxLongitude = minLongitude
  let minLatitude = positions[0]?.[1] ?? -16.65
  let maxLatitude = minLatitude

  for (const position of positions.slice(1)) {
    const longitude = position[0] ?? minLongitude
    const latitude = position[1] ?? minLatitude
    minLongitude = Math.min(minLongitude, longitude)
    maxLongitude = Math.max(maxLongitude, longitude)
    minLatitude = Math.min(minLatitude, latitude)
    maxLatitude = Math.max(maxLatitude, latitude)
  }

  const longitudePadding = Math.max((maxLongitude - minLongitude) * 0.08, 0.001)
  const latitudePadding = Math.max((maxLatitude - minLatitude) * 0.08, 0.001)

  return [
    [minLongitude - longitudePadding, minLatitude - latitudePadding],
    [maxLongitude + longitudePadding, maxLatitude + latitudePadding],
  ]
}

function getOpenStreetMapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-[var(--text)]">{label}</dt>
      <dd className="text-right font-semibold text-[var(--text-h)]">{value}</dd>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-2.5 rounded-sm ring-1 ring-black/10" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function filterClass(active: boolean): string {
  return active
    ? 'inline-flex shrink-0 items-center gap-2 rounded-full bg-forest-800 px-4 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 before:size-1.5 before:rounded-full before:bg-[#8ce0ad]'
    : 'shrink-0 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-h)] outline-none transition hover:bg-mist-50 focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
}
