import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

type PortalHeaderProps = {
  organizationName?: string
}

export function PortalHeader({ organizationName }: PortalHeaderProps) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          aria-label="Ir al selector de organizaciones"
          className="flex items-center gap-3 rounded-md text-[var(--text-h)] outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          to="/"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-forest-950 text-white">
            <Leaf aria-hidden="true" className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">R3Foresta</span>
          <span aria-hidden="true" className="h-4 w-px bg-[var(--border)]" />
          <span className="text-sm text-[var(--text)]">Impacto</span>
        </Link>
        {organizationName ? (
          <p className="max-w-56 truncate text-right text-sm text-[var(--text)]">
            {organizationName}
          </p>
        ) : null}
      </div>
    </header>
  )
}
