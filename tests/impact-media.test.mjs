import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveCampaignEvidence, resolveDashboardEvidence, resolveGalleryEvidence, resolveImpactImageUrl } from '../src/lib/impact-media.ts'

const backend = 'https://backend.example'
const path = '/api/v1/impact/imagenes/706'
const evidence = { id: 706, imageUrl: path, title: null, plantingRecordId: 12 }

test('public evidence paths target the backend when the portal is on another origin', () => {
  assert.equal(resolveImpactImageUrl(path, backend), backend + path)
  assert.equal(resolveImpactImageUrl(path, 'http://127.0.0.1:3306'), 'http://127.0.0.1:3306' + path)
})

test('absolute public URLs retain their destination and same-origin API remains usable', () => {
  assert.equal(resolveImpactImageUrl('https://storage.example/photo.jpg', backend), 'https://storage.example/photo.jpg')
  assert.equal(resolveImpactImageUrl(path, 'https://portal.example'), 'https://portal.example' + path)
})

test('the organization dashboard resolves both hero and campaign previews without mutating data', () => {
  const data = { summary: { evidenceCount: 1 }, evidencePreview: [evidence], campaigns: [{ id: 32, evidencePreview: [evidence] }] }
  const before = structuredClone(data)
  const result = resolveDashboardEvidence(data, backend)
  assert.equal(result.evidencePreview[0].imageUrl, backend + path)
  assert.equal(result.campaigns[0].evidencePreview[0].imageUrl, backend + path)
  assert.deepEqual(data, before)
  assert.equal(result.summary.evidenceCount, 1)
})

test('campaign details resolve gallery, planting record and campaign preview evidence', () => {
  const data = { campaign: { id: 32, evidencePreview: [evidence] }, plantingRecords: [{ id: 12, evidence: [evidence] }], evidence: [evidence] }
  const result = resolveCampaignEvidence(data, backend)
  assert.equal(result.campaign.evidencePreview[0].imageUrl, backend + path)
  assert.equal(result.plantingRecords[0].evidence[0].imageUrl, backend + path)
  assert.equal(result.evidence[0].imageUrl, backend + path)
  assert.equal(data.evidence[0].imageUrl, path)
})

test('remote galleries preserve filters and pagination while resolving photos for cards and viewer', () => {
  const data = { items: [evidence], page: 2, pageSize: 24, total: 30, totalPages: 2 }
  assert.deepEqual(resolveGalleryEvidence(data, backend), { ...data, items: [{ ...evidence, imageUrl: backend + path }] })
  assert.deepEqual(resolveGalleryEvidence({ ...data, items: [] }, backend).items, [])
})

test('normalization rejects protocol-relative, credentialed and unsafe image destinations', () => {
  for (const value of ['//evil.example/photo.jpg', '/\\evil.example/photo.jpg', 'javascript:alert(1)', 'data:image/png;base64,a', 'https://user:secret@storage.example/photo.jpg']) {
    assert.throws(() => resolveImpactImageUrl(value, backend))
  }
})
