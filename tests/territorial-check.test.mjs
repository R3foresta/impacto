import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getTerritorialCheck, getTerritorialStatus } from '../src/components/map/territorial-check.ts'

const area = { campaignId: 1, subcampaignId: 1, polygon: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } }
const point = { id: 10, campaignId: 1, subcampaignId: 1, latitude: 2, longitude: 2, withinArea: false }

test('one comparable outside record and no inside records', () => {
  assert.deepEqual(getTerritorialCheck([point], [area]), { outside: [point], inside: 0, comparable: 1, unavailable: 0 })
})
test('uses the published result rather than recalculating geometry', () => {
  assert.equal(getTerritorialStatus({ ...point, withinArea: true }, [area]), 'inside')
})
test('missing or unusable data is unavailable, never outside', () => {
  for (const polygon of [null, { coordinates: [] }, { coordinates: [[]] }, { coordinates: [[[0, 0], [1, 0], [1, 1]]] }]) {
    assert.equal(getTerritorialStatus(point, [{ ...area, polygon }]), 'unavailable')
  }
  for (const change of [{ latitude: NaN }, { longitude: 181 }, { latitude: -91 }, { withinArea: undefined }, { subcampaignId: 2 }, { campaignId: 2 }]) {
    assert.equal(getTerritorialStatus({ ...point, ...change }, [area]), 'unavailable')
  }
  assert.equal(getTerritorialStatus(point, []), 'unavailable')
})
test('mixed views retain every outside ID and count unknown records separately', () => {
  const second = { ...point, id: 11 }
  const unknown = { ...point, id: 12, subcampaignId: 2 }
  const inside = { ...point, id: 13, withinArea: true }
  const result = getTerritorialCheck([point, second, unknown, inside], [area])
  assert.deepEqual(result.outside.map((item) => item.id), [10, 11])
  assert.equal(result.inside, 1)
  assert.equal(result.comparable, 3)
  assert.equal(result.unavailable, 1)
  assert.deepEqual(getTerritorialCheck([inside], [area]).outside, [])
  assert.equal(getTerritorialCheck([], [area]).comparable, 0)
})
