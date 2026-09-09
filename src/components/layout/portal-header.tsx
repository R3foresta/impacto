import { ArrowLeft, ChevronDown, Grid2X2 } from 'lucide-react'
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { OrganizationMark } from '../company/organization-mark'
import { reportSections, useReportSection } from './use-report-section'

type PortalHeaderProps = {
  organizationName?: string
  organizationLogo?: string | null
  reportNavigation?: boolean
}

export function PortalHeader({
  organizationLogo,
  organizationName,
  reportNavigation = false,
}: PortalHeaderProps) {
  const [sectionsOpen, setSectionsOpen] = useState(false)
  const navigationId = useId()
  const navigationRef = useRef<HTMLDivElement>(null)
  const sectionsButtonRef = useRef<HTMLButtonElement>(null)
  const activeSection = useReportSection(reportNavigation)
  const navigate = useNavigate()

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 80rem)')
    const changeLayout = () => {
      setSectionsOpen(false)
      if (!navigationRef.current?.contains(document.activeElement)) return

      const focusTarget = desktop.matches
        ? navigationRef.current.querySelector<HTMLAnchorElement>('a[aria-current]')
        : sectionsButtonRef.current
      focusTarget?.focus({ preventScroll: true })
    }
    desktop.addEventListener('change', changeLayout)
    return () => desktop.removeEventListener('change', changeLayout)
  }, [])

  useEffect(() => {
    if (!sectionsOpen) return

    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navigationRef.current?.contains(event.target)) {
        setSectionsOpen(false)
      }
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [sectionsOpen])

  const visitSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const section = document.getElementById(id)
    if (!section) return

    event.preventDefault()
    void navigate({ hash: `#${id}` }, {
      preventScrollReset: true,
      replace: window.location.hash === `#${id}`,
    })
    setSectionsOpen(false)
    // Transfer focus without scrolling, then make exactly one anchor-aligned scroll.
    section.tabIndex = -1
    section.focus({ preventScroll: true })
    section.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'auto',
    })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe5de] bg-[#f7f9f5]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[5.25rem] w-full max-w-[96rem] items-center gap-3 px-5 sm:gap-4 sm:px-8 lg:px-12 xl:gap-3">
        <Link
          aria-label="Ir al selector de organizaciones"
          className="flex shrink-0 items-center gap-3 rounded-lg text-[var(--text-h)] outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          to="/"
        >
          <img
            alt="R3 Foresta"
            className="h-14 w-auto mix-blend-multiply"
            height="720"
            src="/r3foresta-logo.jpg"
            width="900"
          />
          <span className="hidden text-sm font-semibold leading-5 tracking-tight sm:block">
            Portal de<br /><span className="text-forest-700">impacto</span>
          </span>
        </Link>
        {organizationName ? (
          <>
            <span aria-hidden="true" className="hidden h-9 w-px bg-[#d7ddd6] lg:block" />
            <div className="hidden min-w-0 items-center gap-3 lg:flex">
              <OrganizationMark
                className="size-11 rounded-xl p-1.5"
                organization={{ logo: organizationLogo ?? null, name: organizationName }}
              />
              <p className="line-clamp-2 max-w-36 text-sm leading-5 text-[var(--text)]" title={organizationName}>
                Organización · <strong className="font-semibold text-[var(--text-h)]">{organizationName}</strong>
              </p>
            </div>
            {reportNavigation ? (
              <div
                className="relative ml-auto shrink-0"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setSectionsOpen(false)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && sectionsOpen) {
                    event.preventDefault()
                    setSectionsOpen(false)
                    sectionsButtonRef.current?.focus({ preventScroll: true })
                  }
                }}
                ref={navigationRef}
              >
                <button
                  aria-controls={navigationId}
                  aria-expanded={sectionsOpen}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d7ddd6] bg-white px-3 text-sm font-semibold text-forest-950 shadow-sm hover:bg-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] xl:hidden"
                  onClick={() => setSectionsOpen((open) => !open)}
                  ref={sectionsButtonRef}
                  type="button"
                >
                  Secciones
                  <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${sectionsOpen ? 'rotate-180' : ''}`} />
                </button>
                <nav
                  aria-label="Secciones del reporte"
                  className={`${sectionsOpen ? 'flex' : 'hidden'} absolute right-0 top-full mt-2 w-52 flex-col gap-1 rounded-xl border border-[#d7ddd6] bg-[#f7f9f5] p-2 shadow-lg xl:static xl:mt-0 xl:flex xl:w-auto xl:flex-row xl:items-center xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none`}
                  id={navigationId}
                >
                  {reportSections.map(({ label, id }) => (
                    <a
                      aria-current={activeSection === id ? 'location' : undefined}
                      className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-white hover:text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] xl:px-2.5 xl:py-2 ${activeSection === id ? 'bg-white text-forest-900 shadow-sm' : 'text-[#4d5b53]'}`}
                      href={`#${id}`}
                      key={id}
                      onClick={(event) => visitSection(event, id)}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            ) : <span className="ml-auto" />}
            <Link aria-label="Cambiar cliente" className={`${reportNavigation ? '' : 'ml-auto'} inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[#d7ddd6] bg-white px-3.5 text-sm font-semibold text-forest-950 shadow-sm transition hover:bg-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]`} to="/">
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
