import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { getImpactCompanyDashboard } from '../api/impact'
import { EvidenceList } from '../components/dashboard/evidence-list'
import { ImpactSummary } from '../components/dashboard/impact-summary'
import { ProjectList } from '../components/dashboard/project-list'
import { TraceabilityTimeline } from '../components/dashboard/traceability-timeline'
import { VerificationStatus } from '../components/dashboard/verification-status'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'
import { ImpactMap } from '../components/map/impact-map'

export function CompanyDashboardPage() {
  const { companyId } = useParams()

  if (!companyId) {
    return <Navigate replace to="/" />
  }

  return <CompanyDashboardContent companyId={companyId} />
}

type CompanyDashboardContentProps = {
  companyId: string
}

function CompanyDashboardContent({ companyId }: CompanyDashboardContentProps) {
  const dashboardQuery = useQuery({
    queryKey: ['impact', 'company-dashboard', companyId],
    queryFn: () => getImpactCompanyDashboard(companyId),
    staleTime: 60_000,
  })

  if (dashboardQuery.isPending) {
    return <DashboardFeedback loading />
  }

  if (dashboardQuery.isError) {
    return (
      <DashboardFeedback
        action={{
          label: 'Reintentar',
          onClick: () => {
            void dashboardQuery.refetch()
          },
        }}
      />
    )
  }

  const dashboard = dashboardQuery.data

  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader companyName={dashboard.company.name} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-forest-800 outline-none transition-colors hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            to="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Cambiar organización
          </Link>
          <VerificationStatus verification={dashboard.company.verification} />
        </div>

        <ImpactSummary summary={dashboard.summary} />

        <div className="grid items-start gap-10 xl:grid-cols-[1.1fr_0.9fr]">
          <ProjectList projects={dashboard.projects} />
          <ImpactMap locations={dashboard.locations} />
        </div>

        <TraceabilityTimeline events={dashboard.timeline} />
        <EvidenceList evidence={dashboard.evidence} />
      </main>
    </div>
  )
}

type DashboardFeedbackProps = {
  loading?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

function DashboardFeedback({ loading = false, action }: DashboardFeedbackProps) {
  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
        {loading ? (
          <LoadingState detail="Consultando el registro de impacto." />
        ) : (
          <ErrorState
            action={action}
            detail="No fue posible cargar el registro de impacto solicitado."
          />
        )}
      </main>
    </div>
  )
}
