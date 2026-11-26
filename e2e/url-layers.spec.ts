import { test, expect } from '@playwright/test'
import { psql, login } from './helpers.ts'

/**
 * Layer visibility is view state: the ?layers= url param is the map's render
 * list and overrides the layer_presentations.active design flags. With an
 * override active the drawer toggles write the param; without one they write
 * the mapLayerSorting atom (the render list fallback, useLayerActivation.ts)
 * and leave the url alone — the param is for overrides and shareable links.
 */

const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'
const SUBPROJECT_ID = '018cfd27-ee92-7000-b678-e75497d6c60e'
const PLACES_URL = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places`
const OSM_LAYER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const POSITRON_LAYER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

// Other demo layers may also be active. Target the two seeded rows.
const fixtureRows = (drawer: import('@playwright/test').Locator) =>
  drawer.locator('section').filter({ has: drawer.page().getByRole('heading', { name: 'Active', exact: true }) })
    .getByRole('button', { name: /^(Populationen|Population: Kontrollen)$/ })

// self-heal after a dev db rebuild: the demo project's vector layers are
// recreated by the projects trigger, but their layer_presentations are
// created by the app on demand — insert the missing ones so the queries
// below find an id (layer_presentations has no write trigger, so no
// electric.syncing is needed)
psql(`
  INSERT INTO layer_presentations (layer_presentation_id, vector_layer_id, project_id, active)
  SELECT gen_random_uuid(), vl.vector_layer_id, vl.project_id, true
  FROM vector_layers vl
  WHERE vl.project_id = '${PROJECT_ID}'
    AND vl.own_table IN ('places', 'checks')
    AND vl.own_table_level = 1
    AND NOT EXISTS (
      SELECT 1 FROM layer_presentations lp WHERE lp.vector_layer_id = vl.vector_layer_id
    )
`)

// the places level-1 layer presentation of the demo project
const LP_ID = psql(
  `SELECT lp.layer_presentation_id FROM layer_presentations lp
   JOIN vector_layers vl ON lp.vector_layer_id = vl.vector_layer_id
   WHERE vl.own_table = 'places' AND vl.own_table_level = 1
     AND vl.project_id = '${PROJECT_ID}'`,
)
// the layer must be db-active: without an override it is the default view
psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID}'`)

// a second layer for the reorder test; deactivated by default so the
// other tests keep a single active row
const LP_ID_2 = psql(
  `SELECT lp.layer_presentation_id FROM layer_presentations lp
   JOIN vector_layers vl ON lp.vector_layer_id = vl.vector_layer_id
   WHERE vl.own_table = 'checks' AND vl.own_table_level = 1
     AND vl.project_id = '${PROJECT_ID}'`,
)

// stepped mouse moves: a single hop does not reliably start the drag
async function dragElementBelow(
  page: import('@playwright/test').Page,
  source: import('@playwright/test').Locator,
  target: import('@playwright/test').Locator,
) {
  const srcBox = await source.boundingBox()
  const dstBox = await target.boundingBox()
  if (!srcBox || !dstBox) throw new Error('drag rows not found')

  const srcX = srcBox.x + srcBox.width / 2
  const srcY = srcBox.y + srcBox.height / 2
  const dstX = dstBox.x + dstBox.width / 2
  // release below the middle of the target row: land after it
  const dstY = dstBox.y + dstBox.height * 0.8

  await page.mouse.move(srcX, srcY)
  await page.mouse.down()
  const steps = 12
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      srcX + (dstX - srcX) * (i / steps),
      srcY + (dstY - srcY) * (i / steps),
    )
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(100)
  await page.mouse.up()
}

psql(`UPDATE layer_presentations SET active = false WHERE layer_presentation_id = '${LP_ID_2}'`)

test.use({ locale: 'de-CH' })

test('the drawer layer toggle writes the url override', async ({ page }) => {
  await login(page, 'test@test.ch', 'test-test')

  // override with only the base layer: the db-active layer is hidden and
  // its drawer toggle reflects that
  await page.goto(`${PLACES_URL}?layers=${OSM_LAYER_ID}&panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await page.waitForTimeout(2500)

  const toggle = drawer.getByRole('button', { name: 'Populationen', exact: true }).locator('[aria-pressed]')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false', {
    timeout: 30_000,
  })

  // showing the layer materializes and extends the url override
  await toggle.click()
  await expect(page).toHaveURL(new RegExp(`layers=${OSM_LAYER_ID}%2C${LP_ID}`), {
    timeout: 10_000,
  })
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')

  // reload keeps the layer visible (it is in the url)
  await page.reload()
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await expect(toggle).toHaveAttribute('aria-pressed', 'true', {
    timeout: 30_000,
  })

  // hiding removes it from the param, the base layer remains
  await toggle.click()
  await expect(page).toHaveURL(new RegExp(`layers=${OSM_LAYER_ID}(&|$)`), {
    timeout: 10_000,
  })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
})

test('without the param the design flags apply; toggling writes the sorting atom, not the url', async ({
  page,
}) => {
  // a second active layer keeps the drawer's atom-sync effect running (it
  // early-returns while NO layer is active), so hiding the first layer is
  // observable in the atom
  psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID}'`)
  psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID_2}'`)

  await login(page, 'test@test.ch', 'test-test')

  await page.goto(`${PLACES_URL}?panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  // wait for the sync to deliver the seeded flags: until then the drawer
  // lists no active rows and the first toggle belongs to an Own row
  await expect(
    fixtureRows(drawer).locator("[aria-pressed='true']"),
  ).toHaveCount(2, { timeout: 60_000 })

  // hiding flips the design flag and removes the layer from the render
  // list — the mapLayerSorting atom, not the url (no override is active).
  // the hidden row leaves the drawer; poll the atom because the drawer's
  // sync effect briefly re-adds ids until its live query catches up
  await drawer.getByRole('button', { name: 'Populationen', exact: true }).locator('[aria-pressed]').click()
  await expect(
    fixtureRows(drawer).locator("[aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })
  await expect(page).not.toHaveURL(/layers=/)
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.localStorage.getItem('mapLayerSortingAtom'),
        ),
      { timeout: 10_000 },
    )
    .not.toContain(LP_ID)
  const sorting = await page.evaluate(() =>
    window.localStorage.getItem('mapLayerSortingAtom'),
  )
  expect(sorting).toContain(POSITRON_LAYER_ID)
})

test('the checkbox toggles without opening the form; the label opens it', async ({
  page,
}) => {
  // two active layers: hiding one removes its row, the other remains as
  // the target for the label click
  psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID}'`)
  psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID_2}'`)

  await login(page, 'test@test.ch', 'test-test')

  await page.goto(`${PLACES_URL}?panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await expect(
    fixtureRows(drawer).locator("[aria-pressed='true']"),
  ).toHaveCount(2, { timeout: 60_000 })

  // clicking only the checkbox deactivates the layer (its row leaves the
  // Active list) and must not open the accordion; without an override the
  // toggle writes the sorting atom, leaving the url alone
  await drawer.getByRole('button', { name: 'Populationen', exact: true }).locator('[aria-pressed]').click()
  await expect(
    fixtureRows(drawer).locator("[aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })
  await expect(page).not.toHaveURL(/layers=/)
  await expect(drawer.getByRole('tab', { name: 'Overall Display' })).toHaveCount(0)

  // clicking right of the checkbox (the remaining layer's label) opens the form
  await fixtureRows(drawer).getByText('Population: Kontrollen', { exact: true }).click()
  await expect(drawer.getByRole('tab', { name: 'Overall Display' })).toBeVisible({
    timeout: 10_000,
  })
})

test('drag reordering rewrites the layers param under an override', async ({
  page,
}) => {
  // a second active layer, so reordering has two rows to work with
  // (earlier tests toggled the first one off — queued flips may or may not
  // have reached the server, so set both explicitly)
  psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID}'`)
  psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID_2}'`)

  await login(page, 'test@test.ch', 'test-test')

  // override with base layer + the two active layers in a known order
  await page.goto(
    `${PLACES_URL}?layers=${OSM_LAYER_ID},${LP_ID},${LP_ID_2}&panes=map`,
  )
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await page.waitForTimeout(2500)

  const handles = fixtureRows(drawer).locator('[title="drag to reorder"]')
  await expect(handles.nth(1)).toBeVisible({ timeout: 30_000 })

  // drag the first active layer below the second: the url override must
  // reflect the new draw order
  await dragElementBelow(page, handles.nth(0), handles.nth(1))
  await expect(page).toHaveURL(
    new RegExp(`layers=${OSM_LAYER_ID}%2C${LP_ID_2}%2C${LP_ID}(&|$)`),
    { timeout: 10_000 },
  )
})
