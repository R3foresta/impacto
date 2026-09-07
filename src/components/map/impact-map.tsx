import { ExternalLink, MapPinned, UsersRound } from 'lucide-react'

import { formatLocation, formatStatus } from '../../lib/formatters'
import type { ImpactLocation } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { VerificationStatus } from '../dashboard/verification-status'

type ImpactMapProps = {
  locations: ImpactLocation[]
}

function getOpenStreetMapUrl(location: ImpactLocation): string | undefined {
  if (!location.coordinates) {
    return undefined
  }

  const { latitude, longitude } = location.coordinates
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`
}

export function ImpactMap({ locations }: ImpactMapProps) {
  return (
    <section aria-labelledby="locations-title" className="space-y-4">
      <div>
        <p className="text-sm font-medium text-forest-700">Territorio</p>
        <h2
          className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]"
          id="locations-title"
        >
          Ubicaciones vinculadas
        </h2>
      </div>
      {locations.length === 0 ? (
        <EmptyState
          detail="No hay ubicaciones publicables para esta organización."
          title="Sin ubicaciones disponibles"
        />
      ) : (
        <div className="grid gap-3">
          {locations.map((location) => {
            const mapUrl = getOpenStreetMapUrl(location)

            return (
              <Card key={String(location.id)}>
                <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mist-100 text-forest-800">
                      <MapPinned aria-hidden="true" className="size-4" />
                    </span>
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium text-[var(--text-h)]">{location.name}</h3>
                        <p className="mt-1 text-sm text-[var(--text)]">
                          {formatLocation(location)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{formatStatus(location.currentStatus)}</Badge>
                        {location.communityName ? (
                          <Badge variant="outline">
                            <UsersRound aria-hidden="true" />
                            {location.communityName}
                          </Badge>
                        ) : null}
                        <VerificationStatus verification={location.verification} />
                      </div>
                    </div>
                  </div>
                  {mapUrl ? (
                    <a
                      className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-forest-800 outline-none transition-colors hover:bg-mist-50 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      href={mapUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Ver coordenadas
                      <ExternalLink aria-hidden="true" className="size-3.5" />
                    </a>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
