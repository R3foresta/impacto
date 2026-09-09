import { ArrowDown, ArrowRight, CalendarDays, MapPinned } from 'lucide-react'

import { formatCount, formatDate } from '../../lib/formatters'
import type { ImpactDashboard } from '../../types/impact'
import { ImpactOverviewCard } from './impact-overview-card'
import './report-hero.css'

type ReportHeroProps = {
  dashboard: ImpactDashboard
}

export function ReportHero({ dashboard }: ReportHeroProps) {
  const { attribution, generatedAt, organization, summary } = dashboard
  const hasPublishedPlantings =
    summary.treesPlantedInitial > 0 || summary.treesReplanted > 0

  return (
    <section
      aria-labelledby="report-title"
      className="relative isolate flex min-h-[calc(100svh-5.25rem)] flex-col overflow-hidden bg-forest-950 text-white"
      id="resumen"
      style={{ backgroundImage: "url('/forest-report-hero.png')", backgroundPosition: 'center', backgroundSize: 'cover' }}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,31,23,0.97)_0%,rgba(5,43,30,0.88)_46%,rgba(8,61,41,0.70)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,24,17,0.08)_0%,rgba(2,24,17,0.02)_62%,rgba(2,24,17,0.58)_100%)]" />

      <div className="report-hero-content mx-auto flex w-full max-w-[96rem] flex-1 flex-col px-5 pb-10 pt-8 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16 lg:pt-10">
        <div className="flex w-full flex-wrap items-center justify-end gap-4 text-xs font-medium uppercase tracking-[0.16em] text-white/72 sm:text-sm">
          <span className="font-mono text-[0.72rem] tracking-[0.14em]">Corte · {formatDate(generatedAt)}</span>
        </div>

        <div className="report-hero-grid grid flex-1 items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:py-16 xl:grid-cols-[minmax(0,1fr)_30rem]">
          <div className="max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#9fcbb0] sm:text-sm">Reporte ejecutivo de impacto ambiental</p>
            <h1 className="report-hero-title mt-7 max-w-[16ch] text-[clamp(3rem,6.2vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white" id="report-title">
              {hasPublishedPlantings ? (
                <>
                  {formatCount(summary.treesPlantedInitial)} árboles plantados;{' '}
                  <span className="text-[#a5cbb1]">{formatCount(summary.treesAliveReported)} figuran vivos</span> en los últimos registros publicados.
                </>
              ) : (
                <>
                  Aún no hay plantaciones publicadas para{' '}
                  <span className="text-[#a5cbb1]">{organization.name}</span>.
                </>
              )}
            </h1>
            <p className="report-hero-methodology mt-8 max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
              {hasPublishedPlantings
                ? 'Supervivencia reportada por la fuente pública de R3Foresta. Fecha de observación de supervivencia no disponible; el corte corresponde a la generación del reporte.'
                : 'El reporte se actualizará cuando la fuente de trazabilidad publique registros de plantación asociados a esta organización.'}
            </p>
            <div className="report-hero-actions mt-9 flex flex-wrap gap-3">
              <a className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-forest-950 transition hover:bg-[#eef5ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950" href="#impacto">
                Ver impacto <ArrowDown aria-hidden="true" className="size-4" />
              </a>
              <a className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/16 bg-white/9 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href="#mapa">
                <MapPinned aria-hidden="true" className="size-4" /> Ver territorio
              </a>
              <a className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/16 bg-white/9 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href="#evidencia">
                Ver evidencia <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>

          <ImpactOverviewCard dashboard={dashboard} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#051c14]/72 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-3 px-5 py-4 text-xs text-white/62 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <span><strong className="mr-2 font-mono text-white/40">01</strong>{attribution.label}</span>
            <span><strong className="mr-2 font-mono text-white/40">02</strong>{formatCount(summary.evidenceCount)} evidencias publicadas</span>
            <span><strong className="mr-2 font-mono text-white/40">03</strong>{formatCount(summary.plantingRecordsCount)} registros de plantación</span>
            <span><strong className="mr-2 font-mono text-white/40">04</strong>Corte · {formatDate(generatedAt)}</span>
          </div>
          <span className="inline-flex items-center gap-2 font-mono"><CalendarDays aria-hidden="true" className="size-3.5" /> Última actividad · {summary.lastActivityAt ? formatDate(summary.lastActivityAt) : 'Fecha no disponible'}</span>
        </div>
      </div>
    </section>
  )
}
