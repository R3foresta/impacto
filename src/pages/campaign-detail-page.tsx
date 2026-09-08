import { useQuery } from '@tanstack/react-query'
import { Activity, ArrowLeft, Camera, MapPin, Sprout, TreePine } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { getImpactCampaignDetail } from '../api/impact'
import { EvidenceList } from '../components/dashboard/evidence-list'
import { MetricCard } from '../components/dashboard/metric-card'
import { ErrorState } from '../components/feedback/error-state'
import { LoadingState } from '../components/feedback/loading-state'
import { PortalHeader } from '../components/layout/portal-header'
import { LazyImpactMap } from '../components/map/lazy-impact-map'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { formatCode, formatCount, formatDate, formatHectares, formatPercentage } from '../lib/formatters'
import type { ImpactPlantingRecord, ImpactSubcampaign } from '../types/impact'

export function CampaignDetailPage() {
  const { organizationId, campaignId } = useParams()
  if (!organizationId || !campaignId) return <Navigate replace to="/" />

  return <CampaignDetailContent campaignId={campaignId} organizationId={organizationId} />
}

function CampaignDetailContent({ organizationId, campaignId }: { organizationId: string; campaignId: string }) {
  const detailQuery = useQuery({
    queryKey: ['impact', 'campaign-detail', organizationId, campaignId],
    queryFn: () => getImpactCampaignDetail(organizationId, campaignId),
    staleTime: 60_000,
  })

  if (detailQuery.isPending) return <PageFeedback loading />
  if (detailQuery.isError) return <PageFeedback action={{ label: 'Reintentar', onClick: () => void detailQuery.refetch() }} />

  const detail = detailQuery.data
  const impact = detail.campaign.impact
  const metrics = [
    { label: 'Meta', value: formatCount(impact.treesTarget), Icon: Sprout },
    { label: 'Plantación inicial', value: formatCount(impact.treesPlantedInitial), Icon: TreePine },
    { label: 'Reposiciones', value: formatCount(impact.treesReplanted), Icon: TreePine },
    { label: 'Árboles vivos', value: formatCount(impact.treesAliveReported), Icon: Activity },
    { label: 'Avance', value: formatPercentage(impact.progressPct), Icon: Activity },
    { label: 'Supervivencia', value: formatPercentage(impact.survivalPct), Icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-mist-50">
      <PortalHeader
        organizationLogo={detail.organization.logo}
        organizationName={detail.organization.name}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10">
        <Link className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-forest-800 hover:text-forest-950 focus-visible:ring-2 focus-visible:ring-[var(--accent)]" to={`/organizations/${organizationId}`}>
          <ArrowLeft aria-hidden="true" className="size-4" /> Volver al dashboard
        </Link>

        <section className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-medium text-forest-700">Campaña</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text-h)]">{detail.campaign.name}</h1>{detail.campaign.description ? <p className="mt-3 max-w-3xl leading-7 text-[var(--text)]">{detail.campaign.description}</p> : null}</div>
            <Badge className="capitalize" variant="outline">{formatCode(detail.campaign.status)}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map(({ label, value, Icon }) => <MetricCard Icon={Icon} key={label} label={label} value={value} />)}
          </div>
        </section>

        <SubcampaignList subcampaigns={detail.subcampaigns} />
        <div className="grid items-start gap-10 xl:grid-cols-[0.9fr_1.1fr]">
          <LazyImpactMap
            campaigns={[detail.campaign]}
            evidence={detail.evidence}
            map={detail.map}
          />
          <PlantingRecordList records={detail.plantingRecords} />
        </div>
        <EvidenceList
          campaigns={[detail.campaign]}
          evidence={detail.evidence}
          plantingPoints={detail.map.plantingPoints}
          totalCount={detail.evidence.length}
        />
      </main>
    </div>
  )
}

function SubcampaignList({ subcampaigns }: { subcampaigns: ImpactSubcampaign[] }) {
  return (
    <section aria-labelledby="subcampaigns-title" className="space-y-4">
      <div><p className="text-sm font-medium text-forest-700">Ejecución territorial</p><h2 className="mt-1 text-xl font-semibold text-[var(--text-h)]" id="subcampaigns-title">Subcampañas</h2></div>
      <div className="grid gap-4 lg:grid-cols-2">
        {subcampaigns.map((item) => (
          <Card key={item.id}><CardHeader><div className="flex items-start justify-between gap-3"><CardTitle>{item.name}</CardTitle><Badge className="capitalize" variant="outline">{formatCode(item.status)}</Badge></div></CardHeader><CardContent className="space-y-3 text-sm"><p className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 text-forest-700" />{item.location.name ?? 'Ubicación sin nombre'} · {formatHectares(item.hectares)}</p><p className="text-[var(--text)]">Avance: {formatPercentage(item.impact.progressPct)} · {formatCount(item.plantingRecordsCount)} registros · {formatCount(item.evidenceCount)} evidencias</p></CardContent></Card>
        ))}
      </div>
    </section>
  )
}

function PlantingRecordList({ records }: { records: ImpactPlantingRecord[] }) {
  return (
    <section aria-labelledby="plantings-title" className="space-y-4">
      <div><p className="text-sm font-medium text-forest-700">Trazabilidad</p><h2 className="mt-1 text-xl font-semibold text-[var(--text-h)]" id="plantings-title">Registros de plantación</h2></div>
      <div className="space-y-3">
        {records.map((record) => (
          <Card key={record.id}><CardContent className="space-y-3 py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-[var(--text-h)]">{formatCount(record.treesPlanted)} árboles</h3><p className="mt-1 text-sm text-[var(--text)]">{formatDate(record.plantedAt)}</p></div><div className="flex gap-2">{record.replacement ? <Badge variant="secondary">Reposición</Badge> : null}<Badge variant="outline">{record.withinArea ? 'Dentro del área' : 'Fuera del área'}</Badge></div></div><p className="text-sm text-[var(--text)]">{record.species.length ? record.species.map((species) => `${species.commonName ?? species.scientificName ?? 'Especie'} (${formatCount(species.quantity)})`).join(' · ') : 'Sin especies detalladas'}</p><p className="flex items-center gap-2 text-sm text-[var(--text)]"><Camera aria-hidden="true" className="size-4 text-forest-700" />{formatCount(record.evidence.length)} evidencias</p></CardContent></Card>
        ))}
      </div>
    </section>
  )
}

function PageFeedback({ loading = false, action }: { loading?: boolean; action?: { label: string; onClick: () => void } }) {
  return <div className="min-h-screen bg-mist-50"><PortalHeader /><main className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">{loading ? <LoadingState detail="Consultando la campaña." /> : <ErrorState action={action} detail="No fue posible cargar la campaña solicitada." />}</main></div>
}
