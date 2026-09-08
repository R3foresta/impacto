import { ArrowDown, ArrowRight, CalendarDays, CircleCheck, MapPinned } from 'lucide-react'

import { formatCount, formatDate, formatHectares } from '../../lib/formatters'
import type { ImpactDashboard } from '../../types/impact'
import { OrganizationMark } from '../company/organization-mark'

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

      <div className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col px-5 pb-10 pt-8 sm:px-8 sm:pb-12 lg:px-12 lg:pb-16 lg:pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.16em] text-white/72 sm:text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/9 px-3 py-2 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#73d8a2] shadow-[0_0_0_5px_rgba(115,216,162,0.12)]" />
              Datos publicados
            </span>
            <span className="hidden font-mono text-[0.72rem] tracking-[0.14em] sm:inline">Impacto · Asociación por campañas</span>
          </div>
          <span className="font-mono text-[0.72rem] tracking-[0.14em]">Corte · {formatDate(generatedAt)}</span>
        </div>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:py-16 xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#9fcbb0] sm:text-sm">Reporte ejecutivo de impacto ambiental</p>
            <h1 className="mt-7 max-w-[16ch] text-[clamp(3rem,6.2vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-white" id="report-title">
              {hasPublishedPlantings ? (
                <>
                  De {formatCount(summary.treesPlantedInitial)} árboles plantados,{' '}
                  <span className="text-[#a5cbb1]">{formatCount(summary.treesAliveReported)} continúan vivos</span> en territorio.
                </>
              ) : (
                <>
                  Aún no hay plantaciones publicadas para{' '}
                  <span className="text-[#a5cbb1]">{organization.name}</span>.
                </>
              )}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
              {hasPublishedPlantings
                ? 'Campañas asociadas, trazabilidad operativa y evidencia georreferenciada desde la fuente pública de R3Foresta.'
                : 'El reporte se actualizará cuando la fuente de trazabilidad publique registros de plantación asociados a esta organización.'}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
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

          <aside className="rounded-[1.5rem] border border-white/12 bg-[#174c35]/62 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6" aria-label="Identificación del reporte">
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
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.19em] text-[#acd0b7]">Datos del reporte</p>
            <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-[#0b3a29]/24">
              <ReportFact className="col-span-2 border-b border-white/10" horizontal label="Corte de datos" value={formatDate(generatedAt)} />
              <ReportFact className="border-b border-r border-white/10" label="Campañas" value={formatCount(summary.campaignsCount)} />
              <ReportFact className="border-b border-white/10" label="Subcampañas" value={formatCount(summary.subcampaignsCount)} />
              <ReportFact className="border-r border-white/10" label="Ubicaciones" value={formatCount(summary.locationsCount)} />
              <ReportFact label="Superficie" value={formatHectares(summary.hectares)} />
            </dl>
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/68">
              <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#73d8a2]" />
              Información publicada por la fuente de trazabilidad de R3Foresta.
            </p>
          </aside>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#051c14]/72 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-3 px-5 py-4 text-xs text-white/62 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            <span><strong className="mr-2 font-mono text-white/40">01</strong>{attribution.label}</span>
            <span><strong className="mr-2 font-mono text-white/40">02</strong>{formatCount(summary.evidenceCount)} evidencias publicadas</span>
            <span><strong className="mr-2 font-mono text-white/40">03</strong>{formatCount(summary.plantingRecordsCount)} registros de plantación</span>
          </div>
          <span className="inline-flex items-center gap-2 font-mono"><CalendarDays aria-hidden="true" className="size-3.5" /> Última actividad · {formatDate(summary.lastActivityAt)}</span>
        </div>
      </div>
    </section>
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
