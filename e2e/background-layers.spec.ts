import { test, expect } from '@playwright/test'
import { login } from './helpers.ts'

/**
 * Background (base) maps are pseudo layers rendered client-side
 * (layers/backgroundLayers.ts): reserved ids in the render list, no db rows.
 * The drawer's Hintergrundkarte section swaps the background id in the
 * effective render list — the mapLayerSorting atom without a ?layers=
 * override, the url param with one. OSM is the default.
 */

const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'
const SUBPROJECT_ID = '018cfd27-ee92-7000-b678-e75497d6c60e'
const PLACES_URL = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places`
const OSM_LAYER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const POSITRON_LAYER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const DARK_MATTER_LAYER_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'

test.use({ locale: 'de-CH' })

test('picking a background swaps it in the render list and persists', async ({
  page,
}) => {
  await login(page, 'test@test.ch', 'test-test')

  await page.goto(`${PLACES_URL}?panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })

  // the default background (osm) renders its tiles
  await expect(
    page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]').first(),
  ).toBeVisible({ timeout: 30_000 })

  // pick dark matter: its tiles replace the osm ones and the atom records it
  await drawer
    .getByRole('button', { name: 'Dark Matter (dunkel)' })
    .click()
  await expect(
    page.locator('img.leaflet-tile[src*="dark_all"]').first(),
  ).toBeVisible({ timeout: 30_000 })
  await expect(
    page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]'),
  ).toHaveCount(0)
  const sorting = await page.evaluate(() =>
    window.localStorage.getItem('mapLayerSortingAtom'),
  )
  expect(sorting).toContain(DARK_MATTER_LAYER_ID)
  expect(sorting).not.toContain(OSM_LAYER_ID)

  // the choice survives a reload
  await page.reload()
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await expect(
    page.locator('img.leaflet-tile[src*="dark_all"]').first(),
  ).toBeVisible({ timeout: 30_000 })

  // back to the default background
  await drawer.getByRole('button', { name: 'OpenStreetMap' }).click()
  await expect(
    page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]').first(),
  ).toBeVisible({ timeout: 30_000 })
  const sortingAfter = await page.evaluate(() =>
    window.localStorage.getItem('mapLayerSortingAtom'),
  )
  expect(sortingAfter).toContain(OSM_LAYER_ID)
})

test('picking a background under a ?layers= override writes the param', async ({
  page,
}) => {
  await login(page, 'test@test.ch', 'test-test')

  await page.goto(`${PLACES_URL}?layers=${OSM_LAYER_ID}&panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })

  // under an override the swap rewrites the param like the layer toggles do
  await drawer.getByRole('button', { name: 'Dark Matter (dunkel)' }).click()
  await expect(page).toHaveURL(
    new RegExp(`layers=${DARK_MATTER_LAYER_ID}(&|$)`),
    { timeout: 10_000 },
  )
  await drawer.getByRole('button', { name: 'Positron (hell)' }).click()
  await expect(page).toHaveURL(new RegExp(`layers=${POSITRON_LAYER_ID}(&|$)`), {
    timeout: 10_000,
  })
  await drawer.getByRole('button', { name: 'OpenStreetMap' }).click()
  await expect(page).toHaveURL(
    new RegExp(`layers=${OSM_LAYER_ID}(&|$)`),
    { timeout: 10_000 },
  )
})
