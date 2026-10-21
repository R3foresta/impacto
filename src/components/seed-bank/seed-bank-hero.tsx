import { ArrowDown, Globe2, Sprout } from 'lucide-react'

import { formatCount, formatDate } from '../../lib/formatters'
import { formatSeedQuantity } from '../../lib/seed-bank'
import type { SeedBankOverview } from '../../types/seed-bank'

export function SeedBankHero({ overview, loading }: { overview?: SeedBankOverview; loading: boolean }) {
  return (
    <section aria-labelledby="seed-bank-title" className="seed-hero relative isolate overflow-hidden bg-forest-950 text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/forest-report-hero.png')" }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(4,31,23,.98)_5%,rgba(5,43,30,.9)_55%,rgba(8,61,41,.72)_100%)]" />
      <div className="mx-auto grid w-full max-w-[96rem] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-20 lg:px-12 lg:py-20">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#a5cbb1]"><Globe2 aria-hidden="true" className="size-4" /> Impacto abierto · R3Foresta</p>
          <h1 className="mt-6 max-w-[13ch] text-[clamp(3.2rem,5.6vw,6rem)] font-semibold leading-[.96] tracking-[-.055em]" id="seed-bank-title">El bosque empieza <span className="text-[#a5cbb1]">en una semilla.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg">Nuestro banco de semillas, abierto a todos. Explora las recolecciones, conoce su origen y sigue su trazabilidad.</p>
          <a className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-forest-950 transition hover:bg-mist-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" href="#colecciones">Explorar el banco <ArrowDown aria-hidden="true" className="size-4" /></a>
        </div>
        <div className="rounded-2xl border border-white/20 bg-[#082b20]/75 p-6 backdrop-blur-md sm:p-8">
          <div className="flex items-center justify-between border-b border-white/15 pb-5">
            <p className="text-sm font-medium text-white/80">Semillas recolectadas</p>
            <Sprout aria-hidden="true" className="size-6 text-[#a5cbb1]" />
          </div>
          <div className="space-y-4 py-6">
            {overview ? overview.summary.totalsByUnit.length ? overview.summary.totalsByUnit.map((total) => (
              <div key={total.unit}>
                <p className="text-[clamp(2rem,3.5vw,3.6rem)] font-semibold leading-tight tracking-[-.04em] tabular-nums">{formatSeedQuantity(total.collected, total.unit)}</p>
                <p className="mt-1 text-xs text-white/65">{total.unit === 'G' ? 'Registradas por peso' : 'Registradas por conteo'} · {total.available === null ? 'Saldo no publicado' : `${formatSeedQuantity(total.available, total.unit)} disponibles`}</p>
              </div>
            )) : <p className="text-lg text-white/80">Sin cantidades publicadas</p> : <p className="text-lg text-white/70">{loading ? 'Consultando cantidades…' : 'Cantidades no disponibles'}</p>}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-sm text-white/75">
            <span><strong className="text-white">{overview ? formatCount(overview.summary.collectionsCount) : '—'}</strong> recolecciones</span>
            <span><strong className="text-white">{overview ? formatCount(overview.summary.speciesCount) : '—'}</strong> especies</span>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/55">El peso y el conteo se presentan por separado. Recolección histórica y saldo disponible son cantidades distintas.</p>
        </div>
      </div>
      <div className="border-t border-white/15 bg-[#051c14]/60">
        <div className="mx-auto flex max-w-[96rem] flex-wrap justify-between gap-3 px-5 py-4 text-xs text-white/65 sm:px-8 lg:px-12">
          <span>Consulta pública · Sin iniciar sesión</span>
          <span>{overview ? `Corte de datos · ${formatDate(overview.generatedAt)}` : 'Cantidades desde la fuente pública de R3Foresta'}</span>
        </div>
      </div>
    </section>
  )
}
