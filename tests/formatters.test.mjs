import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDate } from '../src/lib/formatters.ts'

test('date-only planting records retain their calendar day in Bolivia', () => {
  process.env.TZ = 'America/La_Paz'
  assert.match(formatDate('2026-09-08'), /^08\b/)
  assert.match(formatDate('2026-01-01'), /^01\b.*2026$/)
})

test('timestamps still use local time rather than the date-only rule', () => {
  process.env.TZ = 'America/La_Paz'
  assert.match(formatDate('2026-09-08T00:00:00Z'), /^07\b/)
  assert.match(formatDate('2026-09-08T12:00:00Z'), /^08\b/)
})

test('missing dates retain the existing unavailable state', () => {
  assert.equal(formatDate(null), 'Sin dato verificado')
})
