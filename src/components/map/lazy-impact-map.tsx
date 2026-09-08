import { lazy, Suspense } from 'react'

import type { ImpactMapData } from '../../types/impact'

const ImpactMap = lazy(async () => {
  const module = await import('./impact-map')
  return { default: module.ImpactMap }
})

export function LazyImpactMap({ map }: { map: ImpactMapData }) {
  return (
    <Suspense fallback={<MapLoadingState />}>
      <ImpactMap map={map} />
    </Suspense>
  )
}

function MapLoadingState() {
  return (
    <section aria-busy="true" aria-live="polite" className="scroll-mt-28" id="mapa">
      <div className="h-[42rem] animate-pulse rounded-[1.75rem] border border-[var(--border)] bg-[#dfe9df]" />
      <span className="sr-only">Cargando cartografía interactiva…</span>
    </section>
  )
}
