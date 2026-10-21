// Read-only contract smoke check. Run only with an explicitly selected API origin.
// Never prints records, personal metadata, credentials or full API responses.
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import {
  seedBankOverviewResponseSchema,
  seedCollectionDetailResponseSchema,
  seedCollectionsResponseSchema,
} from '../src/types/seed-bank.ts'

const configuredOrigin = process.env.SEED_BANK_API_URL
assert(configuredOrigin, 'Define SEED_BANK_API_URL explicitly before checking a real backend.')
const origin = new URL(configuredOrigin)
assert(['http:', 'https:'].includes(origin.protocol))
assert(!origin.username && !origin.password && !origin.search, 'Use a public API origin without credentials.')
const base = new URL('/api/v1/impact/seed-bank', origin).href
const checks = []

async function read(path, schema) {
  const response = await fetch(base + path, {
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  })
  assert.equal(response.status, 200, `Public endpoint ${path || '/'} must return 200 without credentials.`)
  const parsed = schema.safeParse(await response.json())
  assert(parsed.success, `Contract mismatch: ${parsed.error?.issues.map(issue => issue.path.join('.')).join(', ')}`)
  return parsed.data.data
}

const [overview, firstPage] = await Promise.all([
  read('', seedBankOverviewResponseSchema),
  read('/collections?page=1&pageSize=100&sort=date-desc', seedCollectionsResponseSchema),
])
assert.equal(firstPage.total, overview.summary.collectionsCount, 'Global summary and unfiltered list must cover the same universe.')
assert.equal(firstPage.totalPages, Math.ceil(firstPage.total / firstPage.pageSize))
checks.push('Anonymous overview and list match frontend schemas and global collection counts.')

const records = [...firstPage.items]
const allPagesChecked = firstPage.totalPages <= 50
if (allPagesChecked) {
  for (let page = 2; page <= firstPage.totalPages; page++) {
    const result = await read(`/collections?page=${page}&pageSize=100&sort=date-desc`, seedCollectionsResponseSchema)
    assert.equal(result.total, firstPage.total, 'Collection count changed during the check; repeat with a stable dataset.')
    records.push(...result.items)
  }
  assert.equal(records.length, firstPage.total)
  assert.equal(new Set(records.map(item => item.id)).size, records.length)
  checks.push('All pages are accessible without duplicate or missing collection IDs.')
}
assert(records.every(item => item.tipo_material === 'SEMILLA'))
checks.push('Every returned record is a seed collection.')

for (let index = 1; index < records.length; index++) {
  assert(records[index - 1].fecha >= records[index].fecha, 'Newest-first date order is not stable.')
}

if (allPagesChecked) {
  const unitTotals = new Map()
  for (const record of records) {
    const total = unitTotals.get(record.unidad_canonica) ?? { collected: 0, available: 0 }
    total.collected += record.cantidad_inicial_canonica
    total.available = total.available === null || record.saldo_actual === null ? null : total.available + record.saldo_actual
    unitTotals.set(record.unidad_canonica, total)
  }
  assert.equal(overview.summary.totalsByUnit.length, unitTotals.size)
  const approximatelyEqual = (left, right) => Math.abs(left - right) <= Math.max(1, Math.abs(right)) * 1e-9
  for (const unit of overview.summary.totalsByUnit) {
    const expected = unitTotals.get(unit.unit)
    assert(expected)
    assert(approximatelyEqual(unit.collected, expected.collected), 'Collected totals must include every page and keep units separate.')
    if (expected.available === null) assert.equal(unit.available, null)
    else assert(unit.available !== null && approximatelyEqual(unit.available, expected.available))
  }
  checks.push('Global collected and available quantities reconcile across all pages, by canonical unit.')
}

if (records.length) {
  const record = records[0]
  const detail = await read(`/collections/${record.id}`, seedCollectionDetailResponseSchema)
  assert.equal(detail.id, record.id)
  assert.equal(detail.codigo_trazabilidad, record.codigo_trazabilidad)
  assert.equal(detail.cantidad_inicial_canonica, record.cantidad_inicial_canonica)
  assert.equal(detail.saldo_actual, record.saldo_actual)
  assert.equal(detail.fecha, record.fecha)
  assert.equal(detail.planta.id, record.planta.id)
  assert.equal(detail.blockchain?.explorer_url, record.blockchain?.explorer_url)
  checks.push('A live detail record matches its list entry and frontend schema.')

  const species = await read(`/collections?speciesId=${record.planta.id}&pageSize=100`, seedCollectionsResponseSchema)
  assert(species.items.every(item => item.planta.id === record.planta.id))
  const date = await read(`/collections?from=${record.fecha}&to=${record.fecha}&pageSize=100`, seedCollectionsResponseSchema)
  assert(date.items.length > 0 && date.items.every(item => item.fecha === record.fecha))
  const search = await read(`/collections?q=${encodeURIComponent(record.codigo_trazabilidad)}&pageSize=100`, seedCollectionsResponseSchema)
  assert(search.items.some(item => item.id === record.id))
  checks.push('Species, inclusive dates and traceability-code filters work on live data.')
}

for (const [filter, withLink] of [['with-link', true], ['without-link', false]]) {
  const result = await read(`/collections?blockchain=${filter}&pageSize=100`, seedCollectionsResponseSchema)
  assert(result.items.every(item => Boolean(item.blockchain?.explorer_url) === withLink))
}
checks.push('Both mint-link filters match the published explorer URL.')

const result = {
  checkedAt: new Date().toISOString(),
  apiOrigin: origin.origin,
  credentials: 'omitted',
  collectionsCount: firstPage.total,
  checkedRecords: records.length,
  allPagesChecked,
  checks,
  limitations: records.length ? [] : ['No live record was available to check detail and content-specific filters.'],
}
console.log(JSON.stringify(result, null, 2))
if (process.env.SEED_BANK_EVIDENCE_PATH) {
  await writeFile(process.env.SEED_BANK_EVIDENCE_PATH, JSON.stringify(result, null, 2) + '\n')
}
