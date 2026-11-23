import { test, expect, type Page } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

/**
 * Swipe-to-delete on list rows (components/shared/Row.tsx).
 *
 * Uses a dedicated fixture project (own role) so the delete never touches
 * shared dev data: two check reports on a level-2 place. The row is swiped
 * right with real touch events (CDP), which must open the confirm/cancel
 * overlay; cancel keeps the row, confirm deletes it.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-swipedelete@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const PROJECT_ID = 'e2e00000-0000-7000-8000-000000000001'
const SUBPROJECT_ID = 'e2e00000-0000-7000-8000-000000000002'
const PLACE_LEVEL1_ID = 'e2e00000-0000-7000-8000-000000000003'
const PLACE_LEVEL2_ID = 'e2e00000-0000-7000-8000-000000000004'
const PLACE1_ID = 'e2e00000-0000-7000-8000-000000000005'
const PLACE2_ID = 'e2e00000-0000-7000-8000-000000000006'
const REPORT_2021_ID = 'e2e00000-0000-7000-8000-000000000007'
const REPORT_2022_ID = 'e2e00000-0000-7000-8000-000000000008'

const listUrl =
  `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}` +
  `/places/${PLACE1_ID}/places/${PLACE2_ID}/check-reports`

// the app follows the browser language; labels are generated from the year
test.use({ locale: 'de-DE', hasTouch: true })

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Swipe Delete',
  })
  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO projects (project_id, name)
    VALUES ('${PROJECT_ID}', 'swipe delete e2e')
    ON CONFLICT DO NOTHING;

    INSERT INTO place_levels (place_level_id, project_id, level, name_singular_de, name_plural_de)
    VALUES
      ('${PLACE_LEVEL1_ID}', '${PROJECT_ID}', 1, 'Population', 'Populationen'),
      ('${PLACE_LEVEL2_ID}', '${PROJECT_ID}', 2, 'Teilpopulation', 'Teilpopulationen')
    ON CONFLICT DO NOTHING;

    INSERT INTO subprojects (subproject_id, project_id, name)
    VALUES ('${SUBPROJECT_ID}', '${PROJECT_ID}', 'swipe delete e2e subproject')
    ON CONFLICT DO NOTHING;

    INSERT INTO places (place_id, subproject_id, level, name)
    VALUES ('${PLACE1_ID}', '${SUBPROJECT_ID}', 1, 'swipe place 1')
    ON CONFLICT DO NOTHING;

    INSERT INTO places (place_id, subproject_id, parent_id, level, name)
    VALUES ('${PLACE2_ID}', '${SUBPROJECT_ID}', '${PLACE1_ID}', 2, 'swipe place 2')
    ON CONFLICT DO NOTHING;

    INSERT INTO check_reports (place_check_report_id, place_id, year)
    VALUES
      ('${REPORT_2021_ID}', '${PLACE2_ID}', 2021),
      ('${REPORT_2022_ID}', '${PLACE2_ID}', 2022)
    ON CONFLICT DO NOTHING;
  `)
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'own',
    // sync filters need a role row per level (see shapeDefinitions.mjs):
    // a project role alone does not sync subprojects/places
    subprojectIds: [SUBPROJECT_ID],
    placeIds: [PLACE1_ID, PLACE2_ID],
  })
})

/**
 * A real touch gesture through the input pipeline (not synthetic DOM
 * events), so React's touch handlers on the row fire.
 */
const swipeRight = async (page: Page, x: number, y: number, dx: number) => {
  const session = await page.context().newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  })
  const steps = 12
  for (let i = 1; i <= steps; i++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + (dx * i) / steps, y }],
    })
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
}

const swipeRow = async (page: Page, rowLocator: ReturnType<Page['locator']>) => {
  const box = await rowLocator.boundingBox()
  if (!box) throw new Error('row has no bounding box')
  await swipeRight(page, box.x + 10, box.y + box.height / 2, box.width * 0.6)
}

test('swipe-to-delete removes a place report row after confirm', async ({
  page,
}) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(listUrl)

  const row2021 = page.locator('.list-container .row', { hasText: '2021' })
  const row2022 = page.locator('.list-container .row', { hasText: '2022' })
  await expect(row2021).toBeVisible({ timeout: 120_000 })
  await expect(row2022).toBeVisible()

  // swipe right past the 30% threshold: confirm/cancel overlay appears
  await swipeRow(page, row2021)
  const confirmButton = page.getByText('✓')
  const cancelButton = page.getByText('✕')
  await expect(confirmButton).toBeVisible()
  await expect(cancelButton).toBeVisible()

  // cancel keeps the row (and closes the overlay)
  await cancelButton.click()
  await expect(confirmButton).toHaveCount(0)
  await expect(row2021).toBeVisible()

  // swipe again and confirm: the row disappears, the other one stays
  await swipeRow(page, row2021)
  await expect(confirmButton).toBeVisible()
  await confirmButton.click()
  await expect(row2021).toHaveCount(0, { timeout: 30_000 })
  await expect(row2022).toBeVisible()
})
