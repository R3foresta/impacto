import { ArrowLeft, Grid2X2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type PortalHeaderProps = {
  organizationName?: string
  reportNavigation?: boolean
}

export function PortalHeader({ organizationName, reportNavigation = false }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe5de] bg-[#f7f9f5]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[5.25rem] w-full max-w-[96rem] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <Link
          aria-label="Ir al selector de organizaciones"
          className="flex shrink-0 items-center gap-3 rounded-lg text-[var(--text-h)] outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          to="/"
        >
          <span className="grid size-10 place-items-center rounded-[0.7rem] bg-forest-950 text-sm font-bold text-white shadow-sm">R3</span>
          <span className="hidden text-sm font-semibold leading-5 tracking-tight sm:block">R3foresta ·<br /><span className="text-forest-700">Reportes</span></span>
        </Link>
        {organizationName ? (
          <>
            <span aria-hidden="true" className="hidden h-9 w-px bg-[#d7ddd6] lg:block" />
            <p className="hidden max-w-56 text-sm leading-5 text-[var(--text)] lg:block">
              Cliente · <strong className="font-semibold text-[var(--text-h)]">{organizationName}</strong>
            </p>
            {reportNavigation ? (
              <nav aria-label="Secciones del reporte" className="ml-auto hidden items-center gap-1 xl:flex">
                {[
                ['Resumen', '#resumen'],
                ['Impacto', '#impacto'],
                ['Monitoreo', '#monitoreo'],
                ['Campañas', '#campanas'],
                ['Mapa', '#mapa'],
                ['Evidencia', '#evidencia'],
                ].map(([label, href], index) => (
                  <a className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-forest-950 ${index === 0 ? 'bg-white text-forest-900 shadow-sm' : 'text-[#4d5b53]'}`} href={href} key={href}>{label}</a>
                ))}
              </nav>
            ) : <span className="ml-auto" />}
            <Link className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-[#d7ddd6] bg-white px-3.5 text-sm font-semibold text-forest-950 shadow-sm transition hover:bg-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] xl:ml-2" to="/">
              <Grid2X2 aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Cambiar cliente</span>
              <ArrowLeft aria-hidden="true" className="size-4 sm:hidden" />
            </Link>
          </>
        ) : (
          <span className="ml-auto text-sm text-[var(--text)]">Portal de impacto</span>
        )}
      </div>
    </header>
  )
}
