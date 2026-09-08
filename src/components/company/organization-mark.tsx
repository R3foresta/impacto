import { useState } from 'react'

import { cn } from '../../lib/utils'
import type { ImpactOrganization } from '../../types/impact'

type OrganizationMarkProps = {
  organization: Pick<ImpactOrganization, 'logo' | 'name'>
  className?: string
  imageClassName?: string
}

export function OrganizationMark({
  organization,
  className,
  imageClassName,
}: OrganizationMarkProps) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null)
  const showLogo = Boolean(organization.logo) && failedLogo !== organization.logo

  return (
    <span
      aria-label={showLogo ? undefined : `Identidad visual de ${organization.name}`}
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-black/8 bg-white text-forest-800 shadow-sm',
        className,
      )}
      role={showLogo ? undefined : 'img'}
    >
      {showLogo ? (
        <img
          alt={`Logo de ${organization.name}`}
          className={cn('size-full object-contain', imageClassName)}
          onError={() => setFailedLogo(organization.logo)}
          src={organization.logo ?? undefined}
        />
      ) : (
        <span aria-hidden="true" className="text-xl font-semibold tracking-[-0.04em]">
          {getInitials(organization.name)}
        </span>
      )}
    </span>
  )
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => !['de', 'del', 'la', 'las', 'los', 'y'].includes(part.toLocaleLowerCase()))

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('')
}
