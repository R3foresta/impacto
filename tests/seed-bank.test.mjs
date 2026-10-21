import assert from 'node:assert/strict'
import { test } from 'node:test'
import { seedCollectionSchema, seedCollectionDetailResponseSchema, seedBankOverviewResponseSchema } from '../src/types/seed-bank.ts'
import { formatSeedQuantity, resolveSeedPhotoUrl } from '../src/lib/seed-bank.ts'
import { seedFixtures, seedOverviewFixture, seedDetailFixture } from './fixtures/seed-bank.mjs'

test('the public bank rejects cuttings, invalid dates, negative amounts and unsafe explorer URLs', () => {
  const seed = seedFixtures[0]
  assert(seedCollectionSchema.safeParse(seed).success)
  for (const override of [
    { tipo_material: 'ESQUEJE' },
    { fecha: '2026-02-31' },
    { cantidad_inicial_canonica: -1 },
    { saldo_actual: -10 },
    { blockchain: { ...seed.blockchain, explorer_url: 'javascript:alert(1)' } },
    { blockchain: { ...seed.blockchain, explorer_url: 'ipfs://metadata' } },
  ]) assert.equal(seedCollectionSchema.safeParse({ ...seed, ...override }).success, false)
})

test('records without mint, validation or known balance remain consultable', () => {
  for (const seed of seedFixtures) assert(seedCollectionSchema.safeParse(seed).success)
  assert.equal(seedCollectionSchema.parse(seedFixtures[1]).saldo_actual, null)
  assert.equal(seedCollectionSchema.parse(seedFixtures[2]).saldo_actual, 0)
})

test('summary keeps canonical units separate and rejects duplicate totals per unit', () => {
  const response = { success: true, data: seedOverviewFixture }
  assert(seedBankOverviewResponseSchema.safeParse(response).success)
  assert.equal(seedBankOverviewResponseSchema.safeParse({ success: true, data: { ...seedOverviewFixture, summary: { ...seedOverviewFixture.summary, totalsByUnit: [seedOverviewFixture.summary.totalsByUnit[0], seedOverviewFixture.summary.totalsByUnit[0]] } } }).success, false)
})

test('quantity display converts mass only and distinguishes zero from unknown', () => {
  assert.match(formatSeedQuantity(2500, 'G'), /^2[.,]5 kg$/)
  assert.match(formatSeedQuantity(0.01, 'G'), /^0[.,]01 g$/)
  assert.match(formatSeedQuantity(2500, 'UNIDAD'), /unidades$/)
  assert.equal(formatSeedQuantity(0, 'G'), '0 g')
  assert.equal(formatSeedQuantity(null, 'G'), 'Sin dato de saldo')
})

test('sanitized photo routes resolve against the backend across origins', () => {
  const route = '/api/v1/impact/seed-bank/collections/1/photos/7'
  const detail = seedDetailFixture(seedFixtures[0])
  detail.fotos = [{ id: 7, url: route, descripcion: null }]
  assert(seedCollectionDetailResponseSchema.safeParse({ success: true, data: detail }).success)
  assert.equal(resolveSeedPhotoUrl(route, 'https://api.example'), `https://api.example${route}`)
  assert.equal(resolveSeedPhotoUrl('https://images.example/photo.jpg', 'https://api.example'), 'https://images.example/photo.jpg')
  for (const url of ['//evil.example/photo', '/\\evil.example/photo', 'javascript:alert(1)', '/arbitrary/path']) {
    const unsafe = { ...detail, fotos: [{ id: 7, url, descripcion: null }] }
    assert.equal(seedCollectionDetailResponseSchema.safeParse({ success: true, data: unsafe }).success, false)
  }
})
