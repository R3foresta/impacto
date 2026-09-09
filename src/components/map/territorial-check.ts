import type { ImpactArea, ImpactPlantingPoint } from '../../types/impact'

export type TerritorialStatus = 'inside' | 'outside' | 'unavailable'

export function hasValidCoordinates(point: Pick<ImpactPlantingPoint, 'latitude' | 'longitude'>) {
  return Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180
}

export function hasComparablePolygon(area: ImpactArea | undefined) {
  const rings = area?.polygon?.coordinates
  return !!rings?.length && rings.every((ring) => {
    const first = ring[0]
    const last = ring.at(-1)
    return ring.length >= 4 && ring.every(([longitude, latitude]) =>
      hasValidCoordinates({ latitude, longitude }),
    ) && first[0] === last?.[0] && first[1] === last?.[1]
  })
}

// Use the published result; this does not recalculate point-in-polygon geometry.
export function getTerritorialStatus(point: ImpactPlantingPoint, areas: ImpactArea[]): TerritorialStatus {
  const area = areas.find((item) => item.subcampaignId === point.subcampaignId
    && item.campaignId === point.campaignId)
  if (!hasValidCoordinates(point) || !hasComparablePolygon(area)
    || typeof point.withinArea !== 'boolean') return 'unavailable'
  return point.withinArea ? 'inside' : 'outside'
}

export function getTerritorialCheck(points: ImpactPlantingPoint[], areas: ImpactArea[]) {
  const outside = points.filter((point) => getTerritorialStatus(point, areas) === 'outside')
  const inside = points.filter((point) => getTerritorialStatus(point, areas) === 'inside').length
  return { outside, inside, comparable: inside + outside.length, unavailable: points.length - inside - outside.length }
}
