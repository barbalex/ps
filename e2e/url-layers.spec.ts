import { test, expect } from '@playwright/test'
import { psql, login } from './helpers.ts'

/**
 * Layer visibility is view state in the ?layers= url param
 * (modules/useUrlLayers.ts): the param is the map's render list and
 * overrides the layer_presentations.active design flags. The drawer
 * toggles write it; a deep link reproduces the layer stack.
 */

const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'
const SUBPROJECT_ID = '018cfd27-ee92-7000-b678-e75497d6c60e'
const PLACES_URL = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places`
const OSM_LAYER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

// the places level-1 layer presentation of the demo project
const LP_ID = psql(
  `SELECT lp.layer_presentation_id FROM layer_presentations lp
   JOIN vector_layers vl ON lp.vector_layer_id = vl.vector_layer_id
   WHERE vl.own_table = 'places' AND vl.own_table_level = 1
     AND vl.project_id = '${PROJECT_ID}'`,
)
// the layer must be db-active: without an override it is the default view
psql(`UPDATE layer_presentations SET active = true WHERE layer_presentation_id = '${LP_ID}'`)

test.use({ locale: 'de-CH' })

test('the drawer layer toggle writes the url override', async ({ page }) => {
  await login(page, 'test@test.ch', 'test-test')

  // override with only the base layer: the db-active layer is hidden and
  // its drawer toggle reflects that
  await page.goto(`${PLACES_URL}?layers=${OSM_LAYER_ID}&panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await page.waitForTimeout(2500)

  const toggle = drawer.locator('[aria-pressed]').first()
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

test('without the param the design flags apply and toggling materializes them', async ({
  page,
}) => {
  await login(page, 'test@test.ch', 'test-test')

  await page.goto(`${PLACES_URL}?panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await page.waitForTimeout(2500)

  const toggle = drawer.locator('[aria-pressed]').first()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true', {
    timeout: 30_000,
  })

  // hiding writes the current view into the url (minus this layer)
  await toggle.click()
  await expect(page).toHaveURL(new RegExp(`layers=${OSM_LAYER_ID}(&|$)`), {
    timeout: 10_000,
  })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
})

test('the checkbox toggles without opening the form; the label opens it', async ({
  page,
}) => {
  await login(page, 'test@test.ch', 'test-test')

  await page.goto(`${PLACES_URL}?panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await page.waitForTimeout(2500)

  // clicking only the checkbox toggles the layer and must not open the
  // accordion (the form is what the header click is for)
  const toggle = drawer.locator('[aria-pressed]').first()
  await toggle.click()
  await expect(page).toHaveURL(/layers=/, { timeout: 10_000 })
  await expect(drawer.getByRole('tab', { name: 'Overall Display' })).toHaveCount(0)

  // clicking right of the checkbox (the layer label) opens the form
  await drawer.locator('p[class*="headerLabel"]').first().click()
  await expect(
    drawer.getByRole('tab', { name: 'Overall Display' }),
  ).toBeVisible({ timeout: 10_000 })
})
