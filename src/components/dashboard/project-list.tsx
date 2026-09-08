import { ArrowRight, CalendarDays, Camera, MapPin, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatCode, formatCount, formatDate, formatPercentage } from '../../lib/formatters'
import type { ImpactCampaignCard } from '../../types/impact'
import { EmptyState } from '../feedback/empty-state'

type CampaignListProps = {
  organizationId: number
  campaigns: ImpactCampaignCard[]
}

export function CampaignList({ organizationId, campaigns }: CampaignListProps) {
  return (
    <section aria-labelledby="campaigns-title" className="scroll-mt-28" id="campanas">
      <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forest-700"><span className="mr-3 font-mono text-stone-500">03</span>Campañas</p>
          <h2 className="mt-4 text-4xl font-semibold leading-none tracking-[-0.04em] text-[var(--text-h)] sm:text-5xl" id="campaigns-title">Ejecución asociada</h2>
        </div>
        <p className="max-w-3xl text-base leading-7 text-[var(--text)]">Cada campaña conserva su alcance, calendario, ubicaciones e indicadores. Selecciona una para consultar sus subcampañas y registros de plantación.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="mt-9"><EmptyState detail="Esta organización todavía no tiene campañas asociadas." title="Sin campañas disponibles" /></div>
      ) : (
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {campaigns.map((campaign, index) => {
            const progress = Math.max(0, Math.min(100, campaign.impact.progressPct ?? 0))
            return (
              <article className="group rounded-[1.6rem] border border-[var(--border)] bg-white p-6 shadow-[0_14px_38px_rgba(23,47,35,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(23,47,35,0.09)] sm:p-8" key={campaign.id}>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-mono text-xs text-stone-500">CMP · {String(index + 1).padStart(2, '0')}</p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-h)]">{campaign.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7dd] bg-[#f1f6f1] px-3 py-1.5 text-xs font-semibold capitalize text-forest-800">
                    <span className="size-1.5 rounded-full bg-forest-700" />{formatCode(campaign.status)}
                  </span>
                </div>
                {campaign.description ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--text)]">{campaign.description}</p> : null}
                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-[var(--border)] py-6 text-sm">
                  <CampaignFact Icon={CalendarDays} label="Inicio previsto" value={formatDate(campaign.plannedStartDate)} />
                  <CampaignFact Icon={MapPin} label="Ubicaciones" value={formatCount(campaign.locations.length)} />
                  <CampaignFact Icon={Sprout} label="Árboles plantados" value={formatCount(campaign.impact.treesPlantedInitial)} />
                  <CampaignFact Icon={Camera} label="Evidencias" value={formatCount(campaign.evidenceCount)} />
                </dl>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm"><span className="text-[var(--text)]">Avance de meta</span><strong className="font-semibold text-[var(--text-h)]">{formatPercentage(campaign.impact.progressPct)}</strong></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist-100"><span className="block h-full rounded-full bg-forest-700" style={{ width: `${progress}%` }} /></div>
                </div>
                <Link className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-forest-800 outline-none transition-colors hover:text-forest-950 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-[var(--accent)]" to={`/organizations/${organizationId}/campaigns/${campaign.id}`}>
                  Ver detalle de campaña <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function CampaignFact({ Icon, label, value }: { Icon: typeof Sprout; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
      <div><dt className="text-xs font-medium uppercase tracking-[0.07em] text-[var(--text)]">{label}</dt><dd className="mt-1 font-medium text-[var(--text-h)]">{value}</dd></div>
    </div>
  )
}
