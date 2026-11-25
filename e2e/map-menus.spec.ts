import { test, expect, type Page } from '@playwright/test'
import { closeLayerDrawerIfOpen, ensureUser, login } from './helpers.ts'

/**
 * The map menus (BottomRightControl) respond to the map width: the
 * bottom menu (scale, scale switch, coordinates) stays a horizontal
 * row when the map is wide. On narrow maps it stacks vertically to the
 * left of the toolbar, bottom-aligned with the hide-ui switch. There
 * is no shared group background in either layout — each menu carries
 * its own slight one, and the scale ruler floats over the map.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-mapmenus@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const openMapWithDrawerClosed = async (page: Page) => {
  await page.goto('/data/projects?panes=map')
  await page.waitForSelector('.map-layers-drawer', { timeout: 60_000 })
  // already closed on narrow maps
  await closeLayerDrawerIfOpen(page)
  await page.waitForTimeout(700)
}

// geometry of the controls cluster: toolbar, bottom menu, hide-ui
// switch are the three children of .map-own-controls
const menusGeometry = (page: Page) =>
  page.evaluate(() => {
    const root = document.querySelector('#map .map-own-controls')!
    const rect = (el: Element) => {
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
    const [toolbar, bottomMenu, switchButton] = [...root.children]
    return {
      map: rect(document.querySelector('#map')!),
      root: rect(root),
      toolbar: rect(toolbar),
      switchButton: rect(switchButton),
      bottomMenu: {
        ...rect(bottomMenu),
        background: getComputedStyle(bottomMenu).backgroundColor,
      },
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

  test('the bottom menu stacks vertically beside the toolbar', async ({
    page,
  }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await openMapWithDrawerClosed(page)

    const { map, root, toolbar, bottomMenu, switchButton } =
      await menusGeometry(page)

    // the toolbar stays a narrow column at the right edge
    expect(toolbar.width).toBeLessThan(toolbar.height)
    expect(toolbar.right).toBeGreaterThan(map.right - 60)

    // the bottom menu is stacked vertically (multiple rows tall), left
    // of the toolbar, and does not span the map's bottom edge
    expect(bottomMenu.height).toBeGreaterThan(60)
    expect(bottomMenu.width).toBeLessThan(map.width * 0.6)
    expect(bottomMenu.right).toBeLessThanOrEqual(toolbar.left + 1)
    // clear of the bottom-left layer-drawer toggle
    expect(bottomMenu.left).toBeGreaterThan(map.left + 60)
    // no shared group background: each menu carries its own
    expect(bottomMenu.background).toBe('rgba(0, 0, 0, 0)')
    // the stacked menus' lower border aligns with the switch's
    expect(Math.abs(bottomMenu.bottom - switchButton.bottom)).toBeLessThanOrEqual(1)

    // the cluster stays inside the map area and does not grow past the
    // toolbar's top (the toolbar is its tallest element)
    expect(root.top).toBeGreaterThanOrEqual(map.top - 1)
    expect(root.bottom).toBeLessThanOrEqual(map.bottom + 1)
  })
})

test.describe('wide map', () => {
  test.use({ locale: 'fr-CH', viewport: { width: 1100, height: 700 } })

  test('map controls show translated tooltips on hover and focus', async ({ page }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await openMapWithDrawerClosed(page)
    const toggle = page.getByRole('button', { name: 'Ouvrir le menu des couches' })
    await toggle.hover()
    const tooltip = page.getByRole('tooltip', { name: 'Ouvrir le menu des couches' })
    await expect(tooltip).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(tooltip).toBeHidden()
    const print = page.getByRole('button', { name: 'Imprimer la carte' })
    await print.focus()
    await expect(page.getByRole('tooltip', { name: 'Imprimer la carte' })).toBeVisible()
    await print.press('Enter')
    await expect(page.getByRole('menu')).toBeVisible()
  })

  test('the bottom menu keeps its horizontal bar', async ({ page }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await openMapWithDrawerClosed(page)

    const { map, toolbar, bottomMenu } = await menusGeometry(page)

    // the bottom menu spans a wide row reaching far into the map
    expect(bottomMenu.width).toBeGreaterThan(bottomMenu.height)
    expect(bottomMenu.width).toBeGreaterThan(map.width * 0.3)
    expect(toolbar.right).toBeGreaterThan(map.right - 60)
    // no shared group background here either: each menu carries its own
    expect(bottomMenu.background).toBe('rgba(0, 0, 0, 0)')
  })
})
