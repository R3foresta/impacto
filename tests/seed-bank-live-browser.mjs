// Real, read-only browser smoke check. The frontend must target the selected API.
// The JSON report contains counts and checks, never seed records or photographs.
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const url = process.env.REVIEW_URL
assert(url, 'Set REVIEW_URL explicitly for the frontend connected to the live API.')
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
const apiRequests = []
const checks = []
page.on('pageerror', error => errors.push(error.message))
page.on('request', request => {
  if (request.url().includes('/api/v1/impact/seed-bank') && !request.url().includes('/photos/')) apiRequests.push(request)
})
let collectionsCount = 0
let photosChecked = 0
try {
  const responsePromise = page.waitForResponse(response => response.url().includes('/seed-bank/collections?') && response.status() === 200)
  await page.goto(new URL('/semillas', url).href)
  const list = (await (await responsePromise).json()).data
  collectionsCount = list.total
  await page.getByRole('heading', { name: 'Banco de semillas', exact: true }).waitFor()
  if (collectionsCount) {
    await page.locator('article').first().waitFor()
    assert.equal(await page.locator('article').count(), list.items.length)
    assert.match(await page.getByRole('status').innerText(), new RegExp(`de ${collectionsCount} recolecciones`))
    checks.push('Live public inventory renders the expected page and total count.')
    if (list.totalPages > 1) {
      await page.getByRole('button', { name: 'Siguiente', exact: true }).click()
      await page.getByText(`Página 2 de ${list.totalPages}`, { exact: true }).waitFor()
      checks.push('Browser pagination loads the next page from the real API.')
    }
    await page.getByRole('link', { name: /^Ver detalle de / }).first().click()
    await page.getByRole('heading', { name: 'Cantidades de esta recolección' }).waitFor()
    checks.push('A real collection opens its public quantity and origin detail.')

    const mintedPromise = page.waitForResponse(response => response.url().includes('/seed-bank/collections?') && response.url().includes('blockchain=with-link') && response.status() === 200)
    await page.goto(new URL('/semillas?blockchain=with-link', url).href)
    const minted = (await (await mintedPromise).json()).data
    if (minted.total) {
      await page.locator('article').first().waitFor()
      await page.getByRole('link', { name: /^Ver detalle de / }).first().click()
      await page.getByRole('heading', { name: 'Trazabilidad en Blockchain' }).waitFor()
      assert.equal(await page.getByRole('link', { name: /^Ver acuñación en Blockchain/ }).getAttribute('href'), minted.items[0].blockchain.explorer_url)
      checks.push('The browser exposes the actual explorer URL for the selected minted collection.')
      const photos = page.locator('figure img')
      for (let index = 0; index < Math.min(await photos.count(), 2); index++) {
        const photo = photos.nth(index)
        await photo.scrollIntoViewIfNeeded()
        await page.waitForFunction(image => image.complete && image.naturalWidth > 0, await photo.elementHandle(), { timeout: 30_000 })
        await photo.evaluate(image => image.decode())
        const source = new URL(await photo.getAttribute('src'))
        assert(source.pathname.includes('/api/v1/impact/seed-bank/collections/'))
        assert(source.pathname.includes('/photos/'))
        photosChecked++
      }
      if (photosChecked) checks.push('Sanitized photographs load from the real backend in the browser.')
    }
  } else {
    await page.getByRole('heading', { name: 'Aún no hay recolecciones publicadas' }).waitFor()
    checks.push('The empty inventory renders explicitly.')
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(new URL('/semillas', url).href)
    if (collectionsCount) await page.locator('article').first().waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  }
  checks.push('Live inventory has no horizontal overflow on desktop and 390/320 px screens.')
  for (const request of apiRequests) {
    const headers = await request.allHeaders()
    assert(!headers.authorization && !headers.cookie)
  }
  assert.deepEqual(errors, [])
  checks.push('Live JSON API requests are anonymous and the browser reports no runtime errors.')
  const result = { checkedAt: new Date().toISOString(), frontendOrigin: new URL(url).origin, collectionsCount, photosChecked, checks, errors, limitations: photosChecked ? [] : ['No published photograph was available in the sampled record.'] }
  console.log(JSON.stringify(result, null, 2))
  if (process.env.SEED_BANK_EVIDENCE_PATH) await writeFile(process.env.SEED_BANK_EVIDENCE_PATH, JSON.stringify(result, null, 2) + '\n')
} finally {
  await browser.close()
}
