import type { ChangeEvent } from 'react'

import type { Company, ImpactEntityId } from '../../types/impact'

type CompanySelectorProps = {
  companies: Company[]
  selectedCompanyId?: ImpactEntityId
  onSelect: (companyId: string) => void
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  onSelect,
}: CompanySelectorProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    if (event.target.value) {
      onSelect(event.target.value)
    }
  }

  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium text-[var(--text-h)]"
        htmlFor="company-selector"
      >
        Organización
      </label>
      <select
        className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-h)] outline-none transition-colors focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        id="company-selector"
        onChange={handleChange}
        value={selectedCompanyId == null ? '' : String(selectedCompanyId)}
      >
        <option value="">Selecciona una organización</option>
        {companies.map((company) => (
          <option key={String(company.id)} value={String(company.id)}>
            {company.name}
          </option>
        ))}
      </select>
    </div>
  )
}
