import { ArrowUpRight, Check } from 'lucide-react'

import type { ImpactOrganization } from '../../types/impact'
import { OrganizationMark } from './organization-mark'

type OrganizationSelectorProps = {
  organizations: ImpactOrganization[]
  selectedOrganizationId?: number
  onSelect: (organizationId: string) => void
}

export function OrganizationSelector({
  organizations,
  selectedOrganizationId,
  onSelect,
}: OrganizationSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {organizations.map((organization) => {
        const selected = selectedOrganizationId === organization.id

        return (
          <button
            aria-label={`Ver reporte de impacto de ${organization.name}`}
            className="group relative grid min-h-40 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white p-5 text-left shadow-[0_14px_40px_rgba(23,47,35,0.055)] outline-none transition duration-300 hover:-translate-y-0.5 hover:border-[#b9c9bd] hover:shadow-[0_20px_50px_rgba(23,47,35,0.10)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:min-h-44 sm:gap-5 sm:p-6"
            key={organization.id}
            onClick={() => onSelect(String(organization.id))}
            type="button"
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#1d513a,#73a985)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            <OrganizationMark
              className="size-20 rounded-xl sm:size-24"
              organization={organization}
            />
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.17em] text-forest-700">
                Organización
              </span>
              <span className="mt-2 block truncate text-xl font-semibold leading-tight tracking-[-0.025em] text-[var(--text-h)] sm:text-2xl">
                {organization.name}
              </span>
              <span className="mt-3 block text-sm font-medium text-[var(--text)]">
                Ver reporte de impacto
              </span>
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#dce4dd] bg-mist-50 text-forest-800 transition group-hover:border-forest-800 group-hover:bg-forest-800 group-hover:text-white sm:size-10">
              {selected ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <ArrowUpRight aria-hidden="true" className="size-4" />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
