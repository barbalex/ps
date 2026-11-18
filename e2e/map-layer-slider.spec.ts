import { test, expect, type Page } from '@playwright/test'
import { ensureUser, login } from './helpers.ts'

/**
 * On narrow layouts the layer drawer (LeftMenuDrawer) slides up from
 * the bottom of the map area and its only close toggle sits at the
 * drawer's top edge. Reopening used to jump to a fixed 500px — taller
 * than the map area on phones — so the top disappeared behind the
 * breadcrumbs and the drawer could not be closed anymore. The drawer
 * size must stay clamped to the map area (minus a sliver that keeps
 * the toggle reachable), also across close/reopen cycles.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-sliderspec@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

test.use({ locale: 'de-DE', viewport: { width: 390, height: 560 } })

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Slider',
  })
  if (!userId) throw new Error('e2e user missing')
})

// the drawer's size lives in the --left-drawer-size css variable
const drawerSize = (page: Page) =>
  page
    .locator('.map-layers-drawer')
    .getAttribute('style')
    .then(
      (style) =>
        Number(style?.match(/--left-drawer-size:\s*([\d.]+)px/)?.[1] ?? NaN),
    )

test('reopening the layer drawer stays inside the map area', async ({
  page,
}) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto('/data/projects?panes=map')
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeAttached({ timeout: 60_000 })
  // the initial size settles only after the container measurement
  // arrives (~100ms debounce), then exceeds the closed sliver of 5px
  await expect.poll(() => drawerSize(page)).toBeGreaterThan(40)

  const mapHeight = await drawer.evaluate(
    (el) =>
      el.parentElement!.parentElement!.parentElement!.getBoundingClientRect()
        .height,
  )

  await page.locator('button[title="Close Layer Menu"]').click()
  await expect.poll(() => drawerSize(page)).toBeLessThanOrEqual(40)

  await page.locator('button[title="Open Layer Menu"]').click()
  // reopened: bigger than the closed sliver …
  await expect.poll(() => drawerSize(page)).toBeGreaterThan(40)
  // … but leaving a sliver of map (with the toggle) above the drawer.
  // +1 tolerance: clamp uses the ResizeObserver height, the rect width
  // may differ by a fraction
  await expect
    .poll(() => drawerSize(page))
    .toBeLessThanOrEqual(mapHeight - 60 + 1)

  // the top edge stayed reachable: the drawer can be closed again
  await page.locator('button[title="Close Layer Menu"]').click()
  await expect.poll(() => drawerSize(page)).toBeLessThanOrEqual(40)
})
