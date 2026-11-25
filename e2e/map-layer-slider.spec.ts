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
 *
 * Narrow maps start with the drawer closed, and from its first frame on:
 * the map's width arrives debounced (~100ms), and rendering the wide
 * layout meanwhile covered the whole map.
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

// only the toggle stays reachable in a closed drawer
const closedSliver = 5

// records the drawer's real height in every animation frame, from its
// first frame on
const recordDrawerHeights = (page: Page) =>
  page.addInitScript(() => {
    const sampled = window as unknown as { drawerHeights: number[] }
    sampled.drawerHeights = []
    const tick = () => {
      const drawer = document.querySelector('.map-layers-drawer')
      if (drawer && sampled.drawerHeights.length < 3000) {
        sampled.drawerHeights.push(drawer.getBoundingClientRect().height)
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })

test('the layer drawer starts closed and stays inside the map area', async ({
  page,
}) => {
  await recordDrawerHeights(page)
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto('/data/projects?panes=map')
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeAttached({ timeout: 60_000 })
  // let the pending container measurement arrive, then no frame may have
  // shown more than the closed sliver
  await page.waitForTimeout(700)
  const heights = await page.evaluate(
    () => (window as unknown as { drawerHeights: number[] }).drawerHeights,
  )
  expect(heights.length).toBeGreaterThan(10)
  expect(Math.max(...heights)).toBeLessThanOrEqual(closedSliver + 1)
  await expect.poll(() => drawerSize(page)).toBeLessThanOrEqual(40)

  const mapHeight = await drawer.evaluate(
    (el) =>
      el.parentElement!.parentElement!.parentElement!.getBoundingClientRect()
        .height,
  )

  const openAndCloseAgain = async () => {
    await page.locator('button[title="Open Layer Menu"]').click()
    // open: bigger than the closed sliver …
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
  }

  await openAndCloseAgain()
  // … also across close/reopen cycles. The second open follows the first
  // close immediately: the drawer's size measurement trails a close
  // animation and used to snap the reopened drawer shut again
  await openAndCloseAgain()
})
