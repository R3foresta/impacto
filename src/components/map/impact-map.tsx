import { ExternalLink, MapPinned, Trees } from 'lucide-react'

import { formatCount, formatHectares } from '../../lib/formatters'
import type { ImpactMapData } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'

type ImpactMapProps = { map: ImpactMapData }

function getOpenStreetMapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`
}

export function ImpactMap({ map }: ImpactMapProps) {
  const hasMapData = map.areas.length > 0 || map.plantingPoints.length > 0

  return (
    <section aria-labelledby="map-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Territorio</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]" id="map-title">Mapa de impacto</h2>
      </div>
      {!hasMapData ? (
        <EmptyState detail="No hay polígonos ni puntos GPS publicables." title="Sin datos de mapa" />
      ) : (
        <div className="space-y-3">
          {map.areas.map((area) => (
            <Card key={`area-${area.subcampaignId}`}>
              <CardContent className="flex gap-3 py-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mist-100 text-forest-800"><MapPinned aria-hidden="true" className="size-4" /></span>
                <div>
                  <h3 className="font-medium text-[var(--text-h)]">{area.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text)]">{area.locationName ?? 'Ubicación sin nombre'} · {formatHectares(area.hectares)}</p>
                  <Badge className="mt-2" variant="outline">{area.polygon ? 'Polígono disponible' : 'Sin polígono'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {map.plantingPoints.map((point) => (
            <Card key={`point-${point.id}`}>
              <CardContent className="flex items-start justify-between gap-3 py-5">
                <div className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mist-100 text-forest-800"><Trees aria-hidden="true" className="size-4" /></span>
                  <div>
                    <h3 className="font-medium text-[var(--text-h)]">{formatCount(point.treesPlanted)} árboles</h3>
                    <p className="mt-1 text-sm text-[var(--text)]">{point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{point.withinArea ? 'Dentro del área' : 'Fuera del área'}</Badge>
                      {point.replacement ? <Badge variant="secondary">Reposición</Badge> : null}
                    </div>
                  </div>
                </div>
                <a aria-label="Abrir coordenadas en OpenStreetMap" className="rounded-md p-2 text-forest-800 hover:bg-mist-100 focus-visible:ring-2 focus-visible:ring-[var(--accent)]" href={getOpenStreetMapUrl(point.latitude, point.longitude)} rel="noreferrer" target="_blank"><ExternalLink aria-hidden="true" className="size-4" /></a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
