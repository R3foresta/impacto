import type {
  ImpactCampaignCard,
  ImpactCampaignDetail,
  ImpactDashboard,
  ImpactEvidence,
  ImpactEvidenceGallery,
} from '../types/impact'

export function resolveImpactImageUrl(value: string, apiBaseUrl: string): string {
  if (value.startsWith('//') || value.includes('\\')) throw new Error('Invalid public image URL.')
  const url = new URL(value, apiBaseUrl)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('Invalid public image URL.')
  }
  return url.href
}

function resolveEvidence(items: ImpactEvidence[], apiBaseUrl: string): ImpactEvidence[] {
  return items.map((item) => ({
    ...item,
    imageUrl: resolveImpactImageUrl(item.imageUrl, apiBaseUrl),
  }))
}

function resolveCampaignPreview(campaign: ImpactCampaignCard, apiBaseUrl: string): ImpactCampaignCard {
  return { ...campaign, evidencePreview: resolveEvidence(campaign.evidencePreview, apiBaseUrl) }
}

// Normalize once at the API boundary so previews, maps, galleries and the viewer
// all use the same backend origin when the portal is hosted separately.
export function resolveDashboardEvidence(data: ImpactDashboard, apiBaseUrl: string): ImpactDashboard {
  return {
    ...data,
    evidencePreview: resolveEvidence(data.evidencePreview, apiBaseUrl),
    campaigns: data.campaigns.map((campaign) => resolveCampaignPreview(campaign, apiBaseUrl)),
  }
}

export function resolveCampaignEvidence(data: ImpactCampaignDetail, apiBaseUrl: string): ImpactCampaignDetail {
  return {
    ...data,
    campaign: resolveCampaignPreview(data.campaign, apiBaseUrl),
    plantingRecords: data.plantingRecords.map((record) => ({
      ...record,
      evidence: resolveEvidence(record.evidence, apiBaseUrl),
    })),
    evidence: resolveEvidence(data.evidence, apiBaseUrl),
  }
}

export function resolveGalleryEvidence(data: ImpactEvidenceGallery, apiBaseUrl: string): ImpactEvidenceGallery {
  return { ...data, items: resolveEvidence(data.items, apiBaseUrl) }
}
