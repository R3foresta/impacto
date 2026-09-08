import type { ChangeEvent } from 'react'

import type { ImpactOrganization } from '../../types/impact'

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
        value={selectedOrganizationId == null ? '' : String(selectedOrganizationId)}
      >
        <option value="">Selecciona una organización</option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </div>
  )
}
