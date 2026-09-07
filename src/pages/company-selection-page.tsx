import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { getImpactCompanies } from '../api/impact'
import { CompanySelector } from '../components/company/company-selector'
import { EmptyState } from '../components/feedback/empty-state'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'
import { Card, CardContent } from '../components/ui/card'

export function CompanySelectionPage() {
  const navigate = useNavigate()
  const companiesQuery = useQuery({
    queryKey: ['impact', 'companies'],
    queryFn: getImpactCompanies,
    staleTime: 60_000,
  })

  function handleCompanySelect(companyId: string) {
    void navigate(`/companies/${encodeURIComponent(companyId)}`)
  }

  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-16">
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

        <section aria-labelledby="company-selection-title" className="mx-auto w-full max-w-2xl space-y-4">
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

          {companiesQuery.isPending ? (
            <LoadingState detail="Consultando organizaciones disponibles." />
          ) : null}
          {companiesQuery.isError ? (
            <ErrorState
              action={{
                label: 'Reintentar',
                onClick: () => {
                  void companiesQuery.refetch()
                },
              }}
              detail="No fue posible conectar con la fuente de impacto."
            />
          ) : null}
          {companiesQuery.data && companiesQuery.data.companies.length === 0 ? (
            <EmptyState
              detail="El backend no reporta organizaciones con impacto publicable."
              title="Sin organizaciones disponibles"
            />
          ) : null}
          {companiesQuery.data && companiesQuery.data.companies.length > 0 ? (
            <Card>
              <CardContent className="space-y-5 py-6">
                <CompanySelector
                  companies={companiesQuery.data.companies}
                  onSelect={handleCompanySelect}
                />
                <p className="flex items-center gap-2 text-sm text-[var(--text)]">
                  El portal muestra únicamente información publicada por la fuente de trazabilidad.
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                </p>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </main>
    </div>
  )
}
