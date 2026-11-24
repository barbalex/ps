import { test, expect, type Page } from '@playwright/test'
import type { CDPSession } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

/**
 * Swipe-to-delete on list rows (components/shared/Row.tsx), gmail-style:
 *
 * - swiping right shows a bin that turns red past the 30% threshold
 * - releasing below the threshold slides the row back, nothing deleted
 * - releasing past the threshold deletes: the row collapses (rows below
 *   slide up, the bin squishes) and the live query removes it
 *
 * Uses a dedicated fixture project (own role) so the delete never touches
 * shared dev data: two check reports on a level-2 place, one is deleted.
 * The gesture is real touch input through CDP, so React's touch handlers
 * on the row fire.
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
// the 2020 report carries a quantity, so deleting it cascades and must
// trigger the confirm dialog
const REPORT_2020_ID = 'e2e00000-0000-7000-8000-000000000009'
const QUANTITY_ID = 'e2e00000-0000-7000-8000-00000000000a'

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
      ('${REPORT_2022_ID}', '${PLACE2_ID}', 2022),
      ('${REPORT_2020_ID}', '${PLACE2_ID}', 2020)
    ON CONFLICT DO NOTHING;

    INSERT INTO check_report_quantities
      (place_check_report_quantity_id, place_check_report_id, quantity_integer)
    VALUES ('${QUANTITY_ID}', '${REPORT_2020_ID}', 7)
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

/** Real touch gestures through the input pipeline (not synthetic DOM events). */
const makeTouch = (page: Page) => {
  let session: CDPSession | null = null
  const send = async (message: Parameters<CDPSession['send']>[0], args: object) => {
    session ??= await page.context().newCDPSession(page)
    await session.send(message, args)
  }
  return {
    start: (x: number, y: number) =>
      send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y }],
      }),
    move: (x: number, y: number) =>
      send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y }],
      }),
    end: () => send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }),
  }
}

/** full swipe right past the 30% threshold on the given row (deletes on release) */
const swipeRow = async (page: Page, rowLocator: ReturnType<Page['locator']>) => {
  const touch = makeTouch(page)
  const box = await rowLocator.boundingBox()
  if (!box) throw new Error('row has no bounding box')
  const y = box.y + box.height / 2
  await touch.start(box.x + 10, y)
  await touch.move(box.x + 10 + box.width * 0.2, y)
  await page.waitForTimeout(150)
  await touch.move(box.x + 10 + box.width * 0.6, y)
  await page.waitForTimeout(200) // let the bin's red filter transition settle
  await touch.end()
}

test('short swipe slides back, swipe past the red bin deletes with collapse', async ({
  page,
}) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(listUrl)

  const row2021 = page.locator('.list-container .row', { hasText: '2021' })
  const row2022 = page.locator('.list-container .row', { hasText: '2022' })
  await expect(row2021).toBeVisible({ timeout: 120_000 })
  await expect(row2022).toBeVisible()

  const touch = makeTouch(page)
  const bin = row2021.getByText('🗑️')
  await expect(bin).toHaveCount(1)

  // --- release below the threshold: nothing deleted, the row slides back ---
  let box = (await row2021.boundingBox())!
  let y = box.y + box.height / 2
  await touch.start(box.x + 10, y)
  await touch.move(box.x + 10 + box.width * 0.15, y)
  // let react commit the move, then the bin must be white
  // (chrome normalizes 100% to 1 in computed filters)
  await page.waitForTimeout(150)
  expect(await bin.evaluate((el) => getComputedStyle(el).filter)).toContain(
    'grayscale(1)',
  )
  await touch.end()
  await page.waitForTimeout(600) // slide-back transition
  await expect(row2021).toBeVisible()
  const settled = await row2021.evaluate((el) =>
    getComputedStyle(el.lastElementChild as Element).transform,
  )
  expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(settled)

  // --- release past the threshold: bin red, row collapses and is deleted ---
  const yBefore = (await row2022.boundingBox())!.y
  box = (await row2021.boundingBox())!
  y = box.y + box.height / 2
  await touch.start(box.x + 10, y)
  await touch.move(box.x + 10 + box.width * 0.2, y)
  await page.waitForTimeout(150)
  await touch.move(box.x + 10 + box.width * 0.6, y)
  // the filter transitions white->red over 0.2s: poll until it settled
  // (chrome normalizes 100% to 1 in computed filters)
  await expect
    .poll(() => bin.evaluate((el) => getComputedStyle(el).filter), {
      timeout: 2_000,
    })
    .toContain('grayscale(0)')
  await touch.end()
  // the row collapses (rows below slide up, the bin squishes) and the
  // live query unmounts it quickly — locator.evaluate auto-waits for the
  // element instead of throwing once it is gone, so short-circuit it with
  // a timeout and treat "gone" as fully collapsed
  await expect
    .poll(async () => {
      try {
        return await row2021.evaluate(
          (el) => el.getBoundingClientRect().height,
          undefined,
          { timeout: 300 },
        )
      } catch {
        return 0
      }
    }, { timeout: 5_000 })
    .toBeLessThan(51)
  await expect(row2021).toHaveCount(0, { timeout: 30_000 })
  const yAfter = (await row2022.boundingBox())!.y
  expect(yAfter).toBeLessThan(yBefore)
})

test.describe('mobile undo bar', () => {
  // isMobileView derives from window width (constants.mobileViewMaxWidth)
  test.use({ viewport: { width: 500, height: 800 } })

  test('undo restores the deleted row', async ({ page }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await page.goto(listUrl)

    const row2021 = page.locator('.list-container .row', { hasText: '2021' })
    const row2022 = page.locator('.list-container .row', { hasText: '2022' })
    await expect(row2021).toBeVisible({ timeout: 120_000 })
    await expect(row2022).toBeVisible()

    await swipeRow(page, row2021)
    await expect(row2021).toHaveCount(0, { timeout: 30_000 })

    // the undo bar slides up from the bottom, naming the deleted row
    const bar = page.getByTestId('undo-delete-bar')
    await expect(bar).toBeVisible()
    await expect(bar).toContainText('2021')

    // undo: the row comes back, the bar slides down
    await bar.getByRole('button').click()
    await expect(row2021).toBeVisible({ timeout: 30_000 })
    await expect(row2022).toBeVisible()
    await expect(bar).toHaveAttribute('data-visible', 'false', {
      timeout: 10_000,
    })
  })

  test('cascade confirm dialog guards child rows and undo restores them', async ({
    page,
  }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)

    // warm-up: the quantity must have synced before the swipe, otherwise
    // the cascade capture sees no children and skips the dialog. its own
    // list is the ui-visible proof that it arrived.
    await page.goto(
      `${listUrl}/${REPORT_2020_ID}/quantities`,
    )
    await expect(
      page.locator('.list-container .row').first(),
    ).toBeVisible({ timeout: 120_000 })

    await page.goto(listUrl)
    // the 2020 report has a quantity: swiping it must ask before deleting
    const row2020 = page.locator('.list-container .row', { hasText: '2020' })
    await expect(row2020).toBeVisible({ timeout: 120_000 })

    await swipeRow(page, row2020)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('2020')

    // cancel: the row slides back open, nothing deleted
    await dialog.getByRole('button', { name: 'Abbrechen' }).click()
    await expect(dialog).toBeHidden()
    await expect(row2020).toBeVisible()

    // confirm: the row goes away
    await swipeRow(page, row2020)
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Löschen' }).click()
    await expect(row2020).toHaveCount(0, { timeout: 30_000 })

    // undo restores the report and its quantity
    const bar = page.getByTestId('undo-delete-bar')
    await expect(bar).toBeVisible()
    await bar.getByRole('button').click()
    await expect(row2020).toBeVisible({ timeout: 30_000 })
  })
})
