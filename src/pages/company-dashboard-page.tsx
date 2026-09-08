import { useQuery } from '@tanstack/react-query'
import { Navigate, useParams } from 'react-router-dom'

import { getImpactOrganizationDashboard } from '../api/impact'
import { EvidenceList } from '../components/dashboard/evidence-list'
import { ImpactSummary } from '../components/dashboard/impact-summary'
import { ReportHero } from '../components/dashboard/report-hero'
import { RestorationPerformance } from '../components/dashboard/restoration-performance'
import { CampaignList } from '../components/dashboard/project-list'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'
import { LazyImpactMap } from '../components/map/lazy-impact-map'
import type { ImpactDashboard, ImpactEvidence } from '../types/impact'

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
      <PortalHeader
        organizationLogo={dashboard.organization.logo}
        organizationName={dashboard.organization.name}
        reportNavigation
      />
      <ReportHero dashboard={dashboard} />
      <main className="mx-auto flex w-full max-w-[96rem] flex-col gap-16 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <ImpactSummary attributionNote={dashboard.attribution.note} summary={dashboard.summary} />
        <RestorationPerformance
          campaigns={dashboard.campaigns}
          organizationId={dashboard.organization.id}
          summary={dashboard.summary}
        />
        <CampaignList campaigns={dashboard.campaigns} organizationId={dashboard.organization.id} />

        <LazyImpactMap
          campaigns={dashboard.campaigns}
          evidence={collectMapEvidence(dashboard)}
          key={dashboard.organization.id}
          map={dashboard.map}
        />
        <EvidenceList
          campaigns={dashboard.campaigns}
          evidence={dashboard.evidencePreview}
          plantingPoints={dashboard.map.plantingPoints}
          totalCount={dashboard.summary.evidenceCount}
        />
      </main>
    </div>
  )
}

function collectMapEvidence(dashboard: ImpactDashboard): ImpactEvidence[] {
  const evidenceById = new Map<number, ImpactEvidence>()
  for (const item of dashboard.evidencePreview) evidenceById.set(item.id, item)
  for (const campaign of dashboard.campaigns) {
    for (const item of campaign.evidencePreview) evidenceById.set(item.id, item)
  }
  return [...evidenceById.values()]
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
