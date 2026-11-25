import { test, expect, type Page } from '@playwright/test'
import {
  ensureProjectFixture,
  ensureUser,
  grantRoles,
  login,
  toolbarBottomCentre,
  toolbarTopLeft,
} from './helpers.ts'

/**
 * The info drawer (Map/RightMenuDrawer) has nothing outside of itself: its
 * resizer and its close button sit inside. So a drag must keep it within
 * the map area — dragged beyond, both were clipped out of reach and the
 * drawer covered the map for good — and a drag that ends with less than
 * 40px closes the drawer instead of leaving a sliver no handle is left of.
 *
 * The drag ends on pointerup: released over one of the map's toolbar
 * buttons, no mouseup reaches the window, and a drag that never ends never
 * closes the drawer.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-infodrawer@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

// a project of this spec's own: a click on the map only opens the info
// drawer inside a project
const PROJECT_ID = '7e2d1a10-0000-4000-8000-00000000a001'
const SUBPROJECT_ID = '7e2d1a10-0000-4000-8000-00000000a003'
const PLACES_URL = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places`

const drawer = (page: Page) => page.locator('.map-info-drawer')
const resizer = (page: Page) => drawer(page).locator('[class*="resizer"]')
const closeButton = (page: Page) =>
  drawer(page).locator('button[title="Close"]')

// the drawer's size lives in the --right-drawer-size css variable
const drawerSize = (page: Page) =>
  drawer(page).evaluate((el) =>
    parseFloat(el.style.getPropertyValue('--right-drawer-size')),
  )

// the map area, two levels up from the drawer (which is only in the DOM
// while it is open)
const mapBox = (page: Page) =>
  drawer(page).evaluate((el) => {
    const { left, top, right, bottom, width, height } =
      el.parentElement!.parentElement!.getBoundingClientRect()
    return { left, top, right, bottom, width, height }
  })

// opens the drawer with a click on the map (it shows what is at that point)
const openInfoDrawer = async (page: Page) => {
  if (!(await drawer(page).isVisible())) {
    // the map's centre — with the drawer closed, nothing else is there
    const map = page.locator('#map .leaflet-container')
    await expect(map).toBeVisible({ timeout: 60_000 })
    const box = (await map.boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  }
  await expect(drawer(page)).toBeVisible()
  await expect(resizer(page)).toBeVisible()
}

// drags the drawer's resizer to an absolute point
const dragResizerTo = async (page: Page, x: number, y: number) => {
  await resizer(page).hover()
  await page.mouse.down()
  await page.mouse.move(x, y, { steps: 15 })
  await page.mouse.up()
}

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Info Drawer',
  })
  if (!userId) throw new Error('e2e user missing')
  await ensureProjectFixture({
    projectId: PROJECT_ID,
    projectName: 'E2E Info Drawer',
    placeLevelId: '7e2d1a10-0000-4000-8000-00000000a002',
    subprojectId: SUBPROJECT_ID,
    subprojectName: 'E2E Info Drawer',
    placeId: '7e2d1a10-0000-4000-8000-00000000a004',
    placeName: 'E2E Info Drawer',
  })
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'read-all',
  })
})

test.describe('wide map', () => {
  test('dragging the info drawer shut closes it, dragging it wide keeps it inside the map', async ({
    page,
  }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await page.goto(`${PLACES_URL}?panes=map`)
    await openInfoDrawer(page)
    const sizeBefore = await drawerSize(page)

    // dragged to the window's right edge: closed, not a sliver
    await dragResizerTo(page, page.viewportSize()!.width - 1, 300)
    await expect(drawer(page)).toBeHidden()

    // it opens again, at the size it had before the drag. A pointer that
    // merely leaves the window does not close it: no drag ended there
    await openInfoDrawer(page)
    await expect.poll(() => drawerSize(page)).toBe(sizeBefore)
    await page.evaluate(() =>
      window.dispatchEvent(new MouseEvent('mouseleave')),
    )
    await expect(drawer(page)).toBeVisible()

    // dragged to 45px: not shut yet
    await dragResizerTo(page, page.viewportSize()!.width - 45, 200)
    await expect.poll(() => drawerSize(page)).toBe(45)

    // dragged shut with the pointer released over a toolbar button
    const onButton = await toolbarTopLeft(page)
    expect((await mapBox(page)).right - onButton.x).toBeLessThan(40)
    await dragResizerTo(page, onButton.x, onButton.y)
    await expect(drawer(page)).toBeHidden()

    // dragged into the tree pane, past the map's left edge: no wider than
    // the map, so that its resizer and close button stay inside it
    await page.goto(`${PLACES_URL}?panes=tree,map`)
    await openInfoDrawer(page)
    const map = await mapBox(page)
    await dragResizerTo(page, 0, 300)
    await expect.poll(() => drawerSize(page)).toBe(map.width)
    await closeButton(page).click()
    await expect(drawer(page)).toBeHidden()
  })
})

test.describe('narrow map', () => {
  test.use({ viewport: { width: 390, height: 560 } })

  test('dragging the info drawer shut closes it, dragging it tall keeps it inside the map', async ({
    page,
  }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await page.goto(`${PLACES_URL}?panes=map`)

    // dragged up past the map's top: no taller than the map, so that its
    // resizer and close button stay inside it
    await openInfoDrawer(page)
    const map = await mapBox(page)
    await dragResizerTo(page, 195, 0)
    await expect.poll(() => drawerSize(page)).toBe(map.height)
    await closeButton(page).click()
    await expect(drawer(page)).toBeHidden()

    // dragged down to the window's bottom edge: closed, not a sliver
    await openInfoDrawer(page)
    await dragResizerTo(page, 195, page.viewportSize()!.height - 1)
    await expect(drawer(page)).toBeHidden()

    // released over a toolbar button, the drag is over all the same: the
    // drawer does not keep following the pointer
    await openInfoDrawer(page)
    const onButton = await toolbarBottomCentre(page)
    const sizeThere = (await mapBox(page)).bottom - onButton.y
    await dragResizerTo(page, onButton.x, onButton.y)
    await page.mouse.move(195, 100, { steps: 8 })
    if (sizeThere < 40) await expect(drawer(page)).toBeHidden()
    else await expect.poll(() => drawerSize(page)).toBe(sizeThere)

    // it opens again
    await openInfoDrawer(page)
    await expect(drawer(page)).toBeVisible()
  })
})
