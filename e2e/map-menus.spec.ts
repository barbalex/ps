import { test, expect, type Page } from '@playwright/test'
import { ensureUser, login } from './helpers.ts'

/**
 * On narrow layouts the map menus stack into one right-edge column
 * (BottomRightControl): the bottom menu (scale, scale switch,
 * coordinates) used to span the map's bottom edge, where it collided
 * with the layer-drawer toggle, the notifications and the attribution.
 * The stacked column must hug the right edge and stay inside the map
 * area. Wide layouts keep the horizontal bottom bar.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-mapmenus@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const openMapWithDrawerClosed = async (page: Page) => {
  await page.goto('/data/projects?panes=map')
  await page.waitForSelector('.map-layers-drawer', { timeout: 60_000 })
  await page.locator('button[title="Close Layer Menu"]').click()
  await page.waitForTimeout(700)
}

const controlsGeometry = (page: Page) =>
  page.evaluate(() => {
    const rect = (el: HTMLElement) => {
      const r = el.getBoundingClientRect()
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      }
    }
    return {
      map: rect(document.querySelector('#map') as HTMLElement),
      controls: rect(
        document.querySelector('#map .map-own-controls') as HTMLElement,
      ),
    }
  })

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Map Menus',
  })
  if (!userId) throw new Error('e2e user missing')
})

test.describe('narrow map', () => {
  test.use({ viewport: { width: 390, height: 700 } })

  test('the map menus stack into a right-edge column', async ({ page }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await openMapWithDrawerClosed(page)

    const { map, controls } = await controlsGeometry(page)

    // a column, not a bottom-spanning bar
    expect(controls.width).toBeLessThan(map.width * 0.6)
    // anchored at the right edge, clear of the bottom-left drawer toggle
    expect(controls.right).toBeGreaterThan(map.right - 60)
    expect(controls.left).toBeGreaterThan(map.left + 60)
    // the whole column stays inside the map area
    expect(controls.top).toBeGreaterThanOrEqual(map.top - 1)
    expect(controls.bottom).toBeLessThanOrEqual(map.bottom + 1)
  })
})

test.describe('wide map', () => {
  test.use({ viewport: { width: 1100, height: 700 } })

  test('the map menus keep the horizontal bottom bar', async ({ page }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await openMapWithDrawerClosed(page)

    const { map, controls } = await controlsGeometry(page)

    // the bottom menu spans a wide bar reaching far into the map
    expect(controls.width).toBeGreaterThan(map.width * 0.3)
    expect(controls.right).toBeGreaterThan(map.right - 60)
  })
})
