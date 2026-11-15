import { test, expect } from '@playwright/test'
import { ensureUser, login } from './helpers.ts'

/**
 * The visible layout panes (tree / data / map) are linkable via
 * ?panes=tree,data (modules/useUrlPanes.ts): toggling panes writes the
 * param, urls win over the localStorage fallback, the default layout
 * produces no param.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-urlpanes@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

test.use({ locale: 'de-DE' })

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Url Panes',
  })
  if (!userId) throw new Error('e2e user missing')
})

test('toggling panes round-trips through the url', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await expect(page).toHaveURL(/\/data\/projects$/)

  // default layout (tree + data): no panes param
  await expect(page).not.toHaveURL(/panes=/)

  // enable the map pane via the toolbar toggle
  await page.getByRole('toolbar', { name: 'active tabs' }).getByRole('button', { name: 'Karte' }).click()
  await expect(page.locator('#map .leaflet-container')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page).toHaveURL(/panes=tree%2Cdata%2Cmap/)
  await expect(page.getByRole('toolbar', { name: 'active tabs' }).getByRole('button', { name: 'Karte' })).toHaveAttribute('aria-pressed', 'true')

  // reload keeps the layout (it is in the url)
  await page.reload()
  await expect(page.locator('#map .leaflet-container')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByRole('toolbar', { name: 'active tabs' }).getByRole('button', { name: 'Karte' })).toHaveAttribute('aria-pressed', 'true')

  // toggling back to the default layout removes the param
  await page.getByRole('toolbar', { name: 'active tabs' }).getByRole('button', { name: 'Karte' }).click()
  await expect(page).not.toHaveURL(/panes=/)
})

test('a deep link opens the panes from the url', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)

  // map only, no tree and no data pane
  await page.goto('/data/users?panes=map')
  await expect(page.locator('#map .leaflet-container')).toBeVisible({
    timeout: 60_000,
  })
  // the data pane (the users list heading) is not rendered
  await expect(
    page.getByRole('heading', { name: /^Benutzer/ }),
  ).toHaveCount(0)
  await expect(page.getByRole('toolbar', { name: 'active tabs' }).getByRole('button', { name: 'Daten' })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('toolbar', { name: 'active tabs' }).getByRole('button', { name: 'Karte' })).toHaveAttribute('aria-pressed', 'true')
})
