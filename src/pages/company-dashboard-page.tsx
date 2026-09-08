import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { getImpactOrganizationDashboard } from '../api/impact'
import { EvidenceList } from '../components/dashboard/evidence-list'
import { ImpactSummary } from '../components/dashboard/impact-summary'
import { CampaignList } from '../components/dashboard/project-list'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'
import { ImpactMap } from '../components/map/impact-map'

export function CompanyDashboardPage() {
  const { organizationId } = useParams()
  if (!organizationId) return <Navigate replace to="/" />

  return <OrganizationDashboardContent organizationId={organizationId} />
}

function OrganizationDashboardContent({ organizationId }: { organizationId: string }) {
  const dashboardQuery = useQuery({
    queryKey: ['impact', 'organization-dashboard', organizationId],
    queryFn: () => getImpactOrganizationDashboard(organizationId),
    staleTime: 60_000,
  })

  if (dashboardQuery.isPending) return <DashboardFeedback loading />
  if (dashboardQuery.isError) {
    return <DashboardFeedback action={{ label: 'Reintentar', onClick: () => void dashboardQuery.refetch() }} />
  }

  const dashboard = dashboardQuery.data

  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader organizationName={dashboard.organization.name} />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10">
        <Link className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-forest-800 outline-none hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-[var(--accent)]" to="/">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Cambiar organización
        </Link>

        <ImpactSummary attributionNote={dashboard.attribution.note} summary={dashboard.summary} />
        <CampaignList campaigns={dashboard.campaigns} organizationId={dashboard.organization.id} />

        <div className="grid items-start gap-10 xl:grid-cols-[0.9fr_1.1fr]">
          <ImpactMap map={dashboard.map} />
          <EvidenceList evidence={dashboard.evidencePreview} />
        </div>
      </main>
    </div>
  )
}

type DashboardFeedbackProps = {
  loading?: boolean
  action?: { label: string; onClick: () => void }
}

function DashboardFeedback({ loading = false, action }: DashboardFeedbackProps) {
  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
        {loading ? (
          <LoadingState detail="Consultando el impacto de la organización." />
        ) : (
          <ErrorState action={action} detail="No fue posible cargar el impacto solicitado." />
        )}
      </main>
    </div>
  )
}
