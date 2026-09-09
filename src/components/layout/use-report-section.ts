import { useEffect, useState } from 'react'

export const reportSections = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'impacto', label: 'Impacto' },
  { id: 'monitoreo', label: 'Monitoreo' },
  { id: 'campanas', label: 'Campañas' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'evidencia', label: 'Evidencia' },
] as const

export function useReportSection(enabled: boolean) {
  const [activeSection, setActiveSection] = useState<string>('resumen')

  useEffect(() => {
    if (!enabled) return

    let frame = 0
    const updateSection = () => {
      frame = 0
      // Match the native anchor offset, including rounding during smooth scroll.
      const anchorOffset = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      let current: string = reportSections[0].id

      for (const { id } of reportSections) {
        // The lazy map can replace its section after this effect has mounted.
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= anchorOffset + 2) current = id
      }

      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = reportSections[reportSections.length - 1].id
      }
      setActiveSection(current)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateSection)
    }
    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(document.body)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    // The browser may try to follow a deep link while the dashboard is still
    // loading. Restore it once the report sections have actually mounted.
    const initialId = window.location.hash.slice(1)
    if (reportSections.some(({ id }) => id === initialId)) {
      const section = document.getElementById(initialId)
      if (section) {
        section.tabIndex = -1
        section.focus({ preventScroll: true })
        section.scrollIntoView({ block: 'start', behavior: 'instant' })
      }
    }
    scheduleUpdate()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [enabled])

  return activeSection
}
