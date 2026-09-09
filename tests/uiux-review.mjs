// Browser regression checks with explicitly fictitious API responses.
// PLAYWRIGHT_MODULE can point to an existing Playwright installation.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { impactDashboardSchema } from '../src/types/impact.ts'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseUrl = process.env.REVIEW_URL || 'http://127.0.0.1:5181'
const out = new URL('../artifacts/review/', import.meta.url)
await mkdir(out, { recursive: true })

const polygon = { type: 'Polygon', coordinates: [[[-68.14, -16.51], [-68.13, -16.51], [-68.13, -16.50], [-68.14, -16.50], [-68.14, -16.51]]] }
const areas = ['Zona fuera', 'Zona dentro', 'Sin polígono', 'Otra zona fuera'].map((name, i) => ({ campaignId: 1, subcampaignId: i + 1, name, locationName: 'Datos ficticios', hectares: 1, polygon: i === 2 ? null : polygon }))
const points = areas.map((area, i) => ({ id: 101 + i, campaignId: 1, subcampaignId: area.subcampaignId, latitude: i === 1 ? -16.505 : -16.52, longitude: i === 1 ? -68.135 : -68.15, plantedAt: '2026-09-08', treesPlanted: 25, replacement: false, withinArea: i === 1, distanceToAreaMeters: null, evidenceCount: 0 }))
const fixture = {
  organization: { id: 1, name: 'Organización FICTICIA de prueba', logo: null, description: null },
  attribution: { label: 'Impacto asociado', method: 'CAMPAIGN_ASSOCIATION', quantified: false, note: 'Datos ficticios para verificar la interfaz.' },
  summary: { treesTarget: 1000, treesPlantedInitial: 100, treesReplanted: 0, treesAliveReported: 95, progressPct: 10, survivalPct: 95, hectares: 4, campaignsCount: 0, subcampaignsCount: 4, locationsCount: 4, plantingRecordsCount: 4, evidenceCount: 0, lastActivityAt: null },
  campaigns: [], map: { areas, plantingPoints: points }, speciesMix: [], evidencePreview: [], generatedAt: '2026-09-08T12:00:00Z',
}
impactDashboardSchema.parse({ success: true, data: fixture })
let data = fixture
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1427, height: 757 } })
const results = []
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.route('**/api/v1/impact/**', async route => {
  const path = new URL(route.request().url()).pathname
  if (path.endsWith('/dashboard')) await new Promise(resolve => setTimeout(resolve, 450))
  const response = path.endsWith('/organizations')
    ? [data.organization]
    : path.endsWith('/monitoring-timeline')
      ? {
          organization: data.organization,
          campaignId: null,
          points: [],
          dataAvailability: { plantingRecordsCount: 0, mortalityReportsCount: 0, hasMortalityMonitoring: false },
          generatedAt: data.generatedAt,
        }
      : path.endsWith('/evidence')
        ? { items: [], page: 1, pageSize: 24, total: 0, totalPages: 0 }
        : data
  await route.fulfill({ json: { success: true, data: response } })
})
// Keep validation independent of the external basemap; actual map/point code runs.
await page.route('https://tiles.openfreemap.org/styles/liberty', route => route.fulfill({ json: { version: 8, sources: {}, layers: [] } }))
async function check(name, fn) {
  if (process.env.REVIEW_CASE && !name.includes(process.env.REVIEW_CASE)) return
  try { const detail = await fn(); results.push({ name, passed: true, detail }) }
  catch (error) { results.push({ name, passed: false, error: error.message }) }
  console.log(name, results.at(-1).passed ? 'PASS' : 'FAIL')
}
async function settledScroll() {
  await page.evaluate(() => new Promise(resolve => {
    let last = scrollY
    let stableFrames = 0
    function tick() {
      stableFrames = scrollY === last ? stableFrames + 1 : 0
      last = scrollY
      if (stableFrames >= 10) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }))
}
async function visit(hash = '') {
  await page.goto(`${baseUrl}/organizations/1${hash}`)
  await page.locator('#report-title').waitFor()
  await page.locator('#map-title').waitFor()
  await page.waitForTimeout(200)
}
async function position(id) {
  return page.evaluate(id => ({ top: document.getElementById(id).getBoundingClientRect().top, header: document.querySelector('header').getBoundingClientRect().bottom, active: document.querySelector('nav [aria-current]')?.getAttribute('href'), focus: document.activeElement.id }), id)
}
try {
  await check('Direct link after asynchronous dashboard load', async () => {
    await visit('#monitoreo')
    const p = await position('monitoreo')
    assert(p.top >= p.header && p.top <= p.header + 40, JSON.stringify(p))
    assert.equal(p.active, '#monitoreo')
    return p
  })
  for (const [width, height] of [[1427, 757], [1280, 757], [1024, 757], [1440, 900], [390, 844]]) {
    await check(`Hero and navigation ${width}x${height}`, async () => {
      await page.setViewportSize({ width, height })
      await visit()
      const metrics = await page.evaluate(() => ({ margin: innerHeight - document.querySelector('#resumen a[href="#impacto"]').getBoundingClientRect().bottom, overflow: document.documentElement.scrollWidth - innerWidth, overlay: !!document.querySelector('vite-error-overlay') }))
      assert(metrics.overflow <= 0, JSON.stringify(metrics))
      assert(!metrics.overlay)
      if (width >= 1024 && height <= 800) assert(metrics.margin >= 24, JSON.stringify(metrics))
      assert.equal(await page.locator('#carbon-status-title').textContent().then(s => s.trim()), 'CO₂ capturado · No disponible')
      await page.screenshot({ path: new URL(`hero-${width}x${height}.png`, out).pathname })
      for (const id of ['impacto', 'monitoreo', 'campanas', 'mapa', 'evidencia', 'resumen']) {
        if (width < 1280) await page.getByRole('button', { name: 'Secciones', exact: true }).click()
        const link = page.locator(`nav a[href="#${id}"]`)
        await link.focus()
        await page.keyboard.press('Enter')
        await settledScroll()
        const p = await position(id)
        assert.equal(p.active, `#${id}`, JSON.stringify(p))
        if (id !== 'resumen') assert(p.top >= p.header - 1, JSON.stringify(p))
        assert.equal(p.focus, id)
      }
      return metrics
    })
  }
  await check('Browser Back returns to previous section', async () => {
    await page.setViewportSize({ width: 1427, height: 757 })
    await visit()
    for (const id of ['monitoreo', 'impacto']) {
      await page.locator(`nav a[href="#${id}"]`).click()
      await settledScroll()
    }
    await page.goBack(); await settledScroll()
    const p = await position('monitoreo')
    assert.equal(new URL(page.url()).hash, '#monitoreo')
    assert(p.top >= p.header && p.top <= p.header + 40, JSON.stringify(p))
    return p
  })
  await check('Territorial warning, filters and record action', async () => {
    await visit()
    const map = page.locator('#mapa')
    await map.scrollIntoViewIfNeeded()
    await map.getByRole('button', { name: 'Todas (4)', exact: true }).click()
    assert(await map.getByText('2 registros de plantación están fuera del polígono publicado', { exact: true }).isVisible(), await map.innerText())
    await map.getByRole('button', { name: 'Localizar registro #104', exact: false }).click()
    await map.getByText('Registro de plantación #104', { exact: true }).waitFor()
    assert.match(await map.getByRole('button', { name: 'Localizar registro #104', exact: false }).textContent(), /08 .*2026/)
    await map.getByRole('button', { name: 'Zona dentro', exact: true }).click()
    assert.equal(await map.getByRole('button', { name: 'Localizar registro', exact: false }).count(), 0)
    assert(await map.getByText('Todos los registros comparables de esta vista están dentro del polígono publicado.').isVisible())
    await map.getByRole('button', { name: 'Sin polígono', exact: true }).click()
    assert(await map.getByText(/Comprobación territorial no disponible para 1 registro/).isVisible())
    assert.equal(await map.getByRole('button', { name: 'Localizar registro', exact: false }).count(), 0)
  })
  await check('Empty organization and unavailable dates', async () => {
    data = structuredClone(fixture)
    data.summary = Object.fromEntries(Object.keys(data.summary).map(key => [key, ['lastActivityAt', 'survivalPct', 'progressPct'].includes(key) ? null : 0]))
    data.map = { areas: [], plantingPoints: [] }
    impactDashboardSchema.parse({ success: true, data })
    await visit()
    assert.match(await page.locator('#report-title').textContent(), /Aún no hay plantaciones publicadas/)
    assert.match(await page.locator('#resumen').textContent(), /Fecha no disponible/)
    assert.match(await page.locator('#monitoreo').textContent(), /Sin plantaciones publicadas para calcular pérdidas/)
  })
  assert.deepEqual(errors, [])
} finally {
  console.log(JSON.stringify({ results, errors }, null, 2))
  await writeFile(new URL('results.json', out), JSON.stringify({ results, errors }, null, 2))
  await browser.close()
}
if (results.some(result => !result.passed) || errors.length) process.exitCode = 1
