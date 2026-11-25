import { test, expect, type Page } from '@playwright/test'
import { ensureUser, login, toolbarTopLeft } from './helpers.ts'

/**
 * Dragging the layer drawer's resizer below 40px snaps the drawer shut —
 * and so does dragging it past the map's left edge. That used to compute a
 * negative size, which the browser treats like 'auto': the drawer showed at
 * its content width while its toggle offered to open it.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-drawerresize@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

// the drawer's size lives in the --left-drawer-size css variable
// (negative ones included: they are what this spec is about)
const drawerSize = (page: Page) =>
  page
    .locator('.map-layers-drawer')
    .getAttribute('style')
    .then((style) =>
      Number(style?.match(/--left-drawer-size:\s*(-?[\d.]+)px/)?.[1] ?? NaN),
    )

// only the toggle stays reachable in a closed drawer
const closedSliver = 5

// left edge of the map area, three levels up from the drawer
const mapLeft = (page: Page) =>
  page
    .locator('.map-layers-drawer')
    .evaluate(
      (el) =>
        el.parentElement!.parentElement!.parentElement!.getBoundingClientRect()
          .left,
    )

// drags the drawer's resizer to an absolute x position, at the resizer's
// own height unless a y is given
const dragResizerTo = async (page: Page, x: number, y?: number) => {
  const resizer = page.locator('.map-layers-drawer [class*="resizer"]')
  // hover waits until the resizer is stable — the drawer may still animate
  await resizer.hover()
  const box = (await resizer.boundingBox())!
  await page.mouse.down()
  await page.mouse.move(x, y ?? box.y + box.height / 2, { steps: 12 })
  await page.mouse.up()
}

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Drawer Resize',
  })
  if (!userId) throw new Error('e2e user missing')
})

test('dragging the layer drawer shut closes it, also past the map edge', async ({
  page,
}) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto('/data/projects?panes=map')
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeAttached({ timeout: 60_000 })
  // open by default on a wide map
  await expect.poll(() => drawerSize(page)).toBeGreaterThan(40)
  const left = await mapLeft(page)

  // dragged below 40px: snaps shut
  await dragResizerTo(page, left + 20)
  await expect.poll(() => drawerSize(page)).toBe(closedSliver)

  // dragged past the map's left edge — here out of the window; a drag into
  // a pane left of the map ends up at the same x
  await page.locator('button[name="layer_menu"][aria-expanded="false"]').click()
  await expect.poll(() => drawerSize(page)).toBeGreaterThan(40)
  await dragResizerTo(page, left - 40)
  await expect.poll(() => drawerSize(page)).toBe(closedSliver)
  // closed for real, not at the content width a negative size collapses to
  await expect
    .poll(() =>
      drawer.evaluate((el) => Math.round(el.getBoundingClientRect().width)),
    )
    .toBeLessThanOrEqual(closedSliver + 1)
  await expect(page.locator('button[name="layer_menu"][aria-expanded="false"]')).toBeVisible()

  // and it opens again
  await page.locator('button[name="layer_menu"][aria-expanded="false"]').click()
  await expect.poll(() => drawerSize(page)).toBeGreaterThan(40)
})

test('the drag is over wherever the pointer is released', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto('/data/projects?panes=map')
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeAttached({ timeout: 60_000 })
  // open by default on a wide map
  const sizeBefore = await drawerSize(page)

  // released over the toolbar's top button, which swallows the mouseup: the
  // drawer must not keep following the pointer, and its toggle must work
  const onButton = await toolbarTopLeft(page)
  await dragResizerTo(page, onButton.x, onButton.y)
  const sizeAtRelease = await drawerSize(page)
  expect(sizeAtRelease).toBeGreaterThan(sizeBefore)
  await page.mouse.move(600, 300, { steps: 8 })
  await expect.poll(() => drawerSize(page)).toBe(sizeAtRelease)
  await page.locator('button[name="layer_menu"][aria-expanded="true"]').click()
  await expect.poll(() => drawerSize(page)).toBe(closedSliver)
})
