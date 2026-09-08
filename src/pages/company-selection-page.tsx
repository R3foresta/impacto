import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getImpactOrganizations } from '../api/impact'
import { OrganizationSelector } from '../components/company/company-selector'
import { EmptyState } from '../components/feedback/empty-state'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'

export function CompanySelectionPage() {
  const navigate = useNavigate()
  const organizationsQuery = useQuery({
    queryKey: ['impact', 'organizations'],
    queryFn: getImpactOrganizations,
    staleTime: 60_000,
  })

  function handleOrganizationSelect(organizationId: string) {
    void navigate(`/organizations/${encodeURIComponent(organizationId)}`)
  }

  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 sm:py-16">
        <section className="overflow-hidden rounded-2xl bg-forest-950 px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#b7d0b9]">Transparencia de impacto</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Restauración con evidencia.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#d9e7db] sm:text-lg">
              Consulta contribuciones, territorio, procesos y respaldo documental desde la fuente de trazabilidad de R3Foresta.
            </p>
          </div>
        </section>

        <section aria-labelledby="company-selection-title" className="mx-auto w-full max-w-5xl space-y-6">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mist-100 text-forest-800">
              <ShieldCheck aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-forest-700">Acceso a impacto</p>
              <h2
                className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-h)]"
                id="company-selection-title"
              >
                Selecciona una organización
              </h2>
            </div>
          </div>

          {organizationsQuery.isPending ? (
            <LoadingState detail="Consultando organizaciones disponibles." />
          ) : null}
          {organizationsQuery.isError ? (
            <ErrorState
              action={{
                label: 'Reintentar',
                onClick: () => {
                  void organizationsQuery.refetch()
                },
              }}
              detail="No fue posible conectar con la fuente de impacto."
            />
          ) : null}
          {organizationsQuery.data?.length === 0 ? (
            <EmptyState
              detail="El backend no reporta organizaciones con impacto publicable."
              title="Sin organizaciones disponibles"
            />
          ) : null}
          {organizationsQuery.data && organizationsQuery.data.length > 0 ? (
            <>
              <OrganizationSelector
                organizations={organizationsQuery.data}
                onSelect={handleOrganizationSelect}
              />
              <p className="border-t border-[var(--border)] pt-5 text-sm leading-6 text-[var(--text)]">
                Cada reporte reúne únicamente información publicada por la fuente de trazabilidad de R3Foresta.
              </p>
            </>
          ) : null}
        </section>
      </main>
    </div>
  )
}
