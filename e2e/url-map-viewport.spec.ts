import { test, expect } from '@playwright/test'
import { closeLayerDrawerIfOpen, ensureUser, login } from './helpers.ts'

/**
 * The map viewport lives in the url (?c=lat,lng&z=zoom), see
 * modules/useUrlMapViewport.ts: panning writes it, urls win over the
 * localStorage fallback, reload keeps the view.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-urlmap@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

test.use({ locale: 'de-DE' })

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Url Map',
  })
  if (!userId) throw new Error('e2e user missing')
})

test('panning the map puts the viewport into the url', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)

  // open the map pane
  await page.getByRole('button', { name: 'Karte' }).click()
  const map = page.locator('#map .leaflet-container')
  await expect(map).toBeVisible({ timeout: 60_000 })

  // close the layers drawer so it does not cover the map
  // (already closed: next to the data pane the map is narrow)
  await closeLayerDrawerIfOpen(page)

  // wait out the initial-view restore window (BoundsListener suppresses
  // saves for the first ~500ms and retries zoom for 150ms)
  await page.waitForTimeout(1500)

  // pan the map: drag in the lower area free of map controls
  const box = await map.boundingBox()
  expect(box).not.toBeNull()
  const cx = box!.x + box!.width / 2
  const cy = box!.y + box!.height * 0.8
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 100, cy + Math.min(60, box!.height * 0.1), {
    steps: 8,
  })
  await page.mouse.up()

  // the url now carries the viewport
  await expect(page).toHaveURL(/[?&]c=-?\d+\.\d+%2C-?\d+\.\d+/, {
    timeout: 10_000,
  })
  await expect(page).toHaveURL(/[?&]z=\d+/)

  // reload: the view (and the url param) survive
  await page.reload()
  await expect(map).toBeVisible({ timeout: 60_000 })
  await expect(page).toHaveURL(/[?&]c=/)
})

test('a deep link positions the map', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)

  // bern at zoom 12
  await page.goto('/data/users?c=46.94800%2C7.44700&z=12')
  await page.getByRole('button', { name: 'Karte' }).click()
  const map = page.locator('#map .leaflet-container')
  await expect(map).toBeVisible({ timeout: 60_000 })
  await page.waitForTimeout(1500)

  // the params survive the initial restore (no revert to the stored view)
  await expect(page).toHaveURL(/[?&]c=46\.948/)
  await expect(page).toHaveURL(/[?&]z=12/)
})
