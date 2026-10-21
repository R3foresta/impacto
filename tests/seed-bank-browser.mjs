// Integration tests against deliberately FICTITIOUS API responses.
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { seedFixtures, seedOverviewFixture, seedDetailFixture } from './fixtures/seed-bank.mjs'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const baseUrl = process.env.REVIEW_URL || 'http://127.0.0.1:5181'
const out = new URL('../artifacts/seed-bank/', import.meta.url)
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
await context.addCookies([
  { name: 'private-session', value: 'TEST-ONLY', url: 'http://localhost:3000' },
  { name: 'private-session', value: 'TEST-ONLY', url: baseUrl },
])
const page = await context.newPage()
const errors = []
const requests = []
const results = []
let mode = 'normal'
page.on('pageerror', error => errors.push(error.message))
await page.route('**/api/v1/impact/**', async route => {
  const url = new URL(route.request().url())
  if (/\/photos\/91$/.test(url.pathname)) {
    return route.fulfill({ contentType: 'image/jpeg', body: await readFile(new URL('../public/territory-forest-aerial.jpg', import.meta.url)) })
  }
  const headers = await route.request().allHeaders()
  requests.push({ url: url.href, path: url.pathname, authorization: headers.authorization, cookie: headers.cookie })
  if (url.pathname.endsWith('/organizations')) return route.fulfill({ json: { success: true, data: [] } })
  if (mode === 'error') return route.fulfill({ status: 503, json: { message: 'Fallo FICTICIO' } })
  if (url.pathname.endsWith('/seed-bank')) return route.fulfill({ json: { success: true, data: seedOverviewFixture } })
  if (/\/collections\/[^/]+$/.test(url.pathname)) {
    const id = Number(url.pathname.split('/').at(-1))
    const item = seedFixtures.find(item => item.id === id)
    return item ? route.fulfill({ json: { success: true, data: seedDetailFixture(item) } }) : route.fulfill({ status: 404, json: { message: 'No encontrado' } })
  }
  let items = mode === 'empty' ? [] : [...seedFixtures]
  const q = url.searchParams.get('q')?.toLowerCase()
  if (q) items = items.filter(item => `${item.codigo_trazabilidad} ${item.planta.nombre_comun_principal} ${item.planta.nombre_cientifico}`.toLowerCase().includes(q))
  const speciesId = Number(url.searchParams.get('speciesId'))
  if (speciesId) items = items.filter(item => item.planta.id === speciesId)
  const locationId = Number(url.searchParams.get('locationId'))
  if (locationId) items = items.filter(item => item.ubicacion?.id === locationId)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  if (from) items = items.filter(item => item.fecha >= from)
  if (to) items = items.filter(item => item.fecha <= to)
  const blockchain = url.searchParams.get('blockchain')
  if (blockchain) items = items.filter(item => blockchain === 'with-link' ? item.blockchain?.explorer_url : !item.blockchain?.explorer_url)
  if (url.searchParams.get('sort') === 'date-asc') items.reverse()
  const pageNumber = Number(url.searchParams.get('page') || 1)
  const pageSize = Number(url.searchParams.get('pageSize') || 12)
  await route.fulfill({ json: { success: true, data: { items: items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize), page: pageNumber, pageSize, total: items.length, totalPages: Math.ceil(items.length / pageSize) } } })
})
async function visit(path = '/semillas') {
  await page.goto(baseUrl + path)
  await page.getByRole('heading', { name: 'Banco de semillas', exact: true }).waitFor()
  await page.locator('article').first().waitFor()
}
async function check(name, fn) {
  try { await fn(); results.push({ name, passed: true }) }
  catch (error) { results.push({ name, passed: false, error: error.message }); console.log(error.message); await page.screenshot({ path: new URL('failure.png', out).pathname }) }
  console.log(name, results.at(-1).passed ? 'PASS' : 'FAIL')
}
try {
  await check('Public navigation from the existing home', async () => {
    await page.goto(baseUrl)
    await page.getByRole('navigation', { name: 'Navegación del portal' }).getByRole('link', { name: 'Banco de semillas' }).click()
    await page.locator('article').first().waitFor()
    assert.equal(await page.locator('article').count(), 12)
    assert.match(await page.getByRole('status').innerText(), /1–12 de 14/)
    assert.match(await page.locator('article').nth(1).innerText(), /Sin dato de saldo/)
    assert.match(await page.locator('article').nth(2).innerText(), /0 g/)
    assert.match(await page.locator('article').nth(3).innerText(), /Rechazado/)
  })
  await check('Pagination preserves access to all collections', async () => {
    await page.getByRole('button', { name: 'Siguiente', exact: true }).click()
    await page.getByRole('status').filter({ hasText: '13–14 de 14' }).waitFor()
    assert.equal(await page.locator('article').count(), 2)
    assert.match(page.url(), /page=2/)
    await page.getByRole('button', { name: 'Anterior', exact: true }).click()
    await page.getByRole('status').filter({ hasText: '1–12 de 14' }).waitFor()
  })
  await check('Species, place, date and mint filters are shareable and reset pagination', async () => {
    await page.getByLabel('Especie', { exact: true }).selectOption('1')
    await page.getByLabel('Lugar de origen', { exact: true }).selectOption('1')
    await page.getByLabel('Recolectadas desde').fill('2026-10-10')
    await page.getByLabel('Hasta', { exact: true }).fill('2026-10-21')
    await page.getByLabel('Acuñación en Blockchain').selectOption('with-link')
    await page.getByRole('button', { name: 'Aplicar filtros' }).click()
    await page.getByRole('status').filter({ hasText: '1–2 de 2' }).waitFor()
    assert.equal(await page.locator('article').count(), 2)
    assert.match(page.url(), /speciesId=1/)
    assert(!page.url().includes('page='))
    await page.reload()
    await page.locator('article').first().waitFor()
    assert.equal(await page.getByLabel('Especie', { exact: true }).inputValue(), '1')
    await page.getByRole('button', { name: 'Limpiar', exact: true }).click()
    await page.getByRole('status').filter({ hasText: '1–12 de 14' }).waitFor()
  })
  await check('Search and empty results', async () => {
    await page.getByLabel('Buscar', { exact: true }).fill('NO-EXISTE')
    await page.getByRole('button', { name: 'Aplicar filtros' }).click()
    await page.getByRole('heading', { name: 'No hay coincidencias' }).waitFor()
    assert.equal(await page.locator('article').count(), 0)
    assert.equal(await page.getByRole('navigation', { name: 'Páginas de recolecciones' }).count(), 0)
    await page.getByRole('button', { name: 'Ver todas las recolecciones' }).click()
    await page.locator('article').first().waitFor()
    await page.getByLabel('Buscar', { exact: true }).fill('PRUEBA-FICTICIA-001')
    await page.getByRole('button', { name: 'Aplicar filtros' }).click()
    await page.getByRole('status').filter({ hasText: '1–1 de 1' }).waitFor()
  })
  await check('Detail shows quantities, origin and actual mint link', async () => {
    await page.getByRole('link', { name: 'Ver detalle de PRUEBA-FICTICIA-001', exact: true }).click()
    await page.getByRole('heading', { name: 'Cantidades de esta recolección' }).waitFor()
    assert.match(await page.locator('main').innerText(), /1[.,]5 kg/)
    assert.match(await page.locator('main').innerText(), /500 g/)
    assert.equal(await page.getByRole('link', { name: 'Ver acuñación en Blockchain', exact: false }).getAttribute('href'), seedFixtures[0].blockchain.explorer_url)
    assert.equal(await page.getByRole('link', { name: 'Ver acuñación en Blockchain', exact: false }).getAttribute('target'), '_blank')
    assert(await page.getByRole('link', { name: 'Ver lugar en el mapa', exact: false }).isVisible())
    const photo = page.getByRole('img', { name: 'Fotografía 1 de la recolección PRUEBA-FICTICIA-001', exact: true })
    await photo.scrollIntoViewIfNeeded()
    await photo.evaluate(image => image.decode())
    assert.equal(new URL(await photo.getAttribute('src')).pathname, '/api/v1/impact/seed-bank/collections/1/photos/91')
    assert.equal(new URL(await photo.getAttribute('src')).origin, new URL(requests.find(request => request.path.endsWith('/collections/1')).url || baseUrl).origin)
    await page.reload()
    await page.getByRole('heading', { name: 'Cantidades de esta recolección' }).waitFor()
    await page.screenshot({ path: new URL('detail-fictitious.png', out).pathname, fullPage: true })
  })
  await check('No mint, unknown balance and missing records remain explicit', async () => {
    await page.goto(baseUrl + '/semillas/2')
    await page.getByRole('heading', { name: 'Cantidades de esta recolección' }).waitFor()
    assert.match(await page.locator('main').innerText(), /Sin dato de saldo/)
    assert.match(await page.locator('main').innerText(), /todavía no tiene un enlace público/)
    assert.equal(await page.getByRole('link', { name: 'Ver acuñación en Blockchain', exact: false }).count(), 0)
    await page.goto(baseUrl + '/semillas/9999')
    await page.getByRole('heading', { name: 'Recolección no disponible' }).waitFor()
  })
  await check('Invalid date range is blocked before requesting collections', async () => {
    await visit()
    const before = requests.length
    await page.getByLabel('Recolectadas desde').fill('2026-10-20')
    await page.getByLabel('Hasta', { exact: true }).fill('2026-10-10')
    await page.getByRole('button', { name: 'Aplicar filtros' }).click()
    assert.equal(await page.getByLabel('Hasta', { exact: true }).evaluate(element => element.validity.valid), false)
    assert.equal(requests.length, before)
  })
  for (const [width, height] of [[1440, 1000], [1024, 900], [390, 844], [320, 740]]) {
    await check(`Responsive bank ${width}px`, async () => {
      await page.setViewportSize({ width, height })
      await visit()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      await page.screenshot({ path: new URL(`bank-fictitious-${width}.png`, out).pathname, fullPage: width === 1440 })
      await page.goto(baseUrl + '/semillas/1')
      await page.getByRole('heading', { name: 'Cantidades de esta recolección' }).waitFor()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    })
  }
  await check('Empty and unavailable APIs never fabricate inventory', async () => {
    mode = 'empty'
    await page.goto(baseUrl + '/semillas')
    await page.getByRole('heading', { name: 'Aún no hay recolecciones publicadas' }).waitFor()
    assert.equal(await page.locator('article').count(), 0)
    mode = 'error'
    await page.reload()
    await page.getByRole('heading', { name: 'No se pudieron cargar las recolecciones' }).waitFor()
    assert.match(await page.locator('main').innerText(), /Resumen global no disponible/)
    assert.match(await page.locator('section').first().innerText(), /Cantidades no disponibles/)
    assert.equal(await page.locator('article').count(), 0)
  })
  await check('Anonymous API requests send no authentication or session cookies', async () => {
    assert(requests.length > 10)
    assert(requests.every(request => !request.authorization && !request.cookie))
    assert.deepEqual(errors, [])
  })
} finally {
  await writeFile(new URL('results.json', out), JSON.stringify({ results, errors }, null, 2))
  await browser.close()
}
if (results.some(result => !result.passed) || errors.length) process.exitCode = 1
