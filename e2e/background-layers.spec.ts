import { test, expect } from '@playwright/test'
import { login } from './helpers.ts'

/**
 * Background (base) maps are pseudo layers rendered client-side
 * (layers/backgroundLayers.ts): reserved ids in the render list, no db rows.
 * The drawer's Hintergrundkarte section swaps the background id in the
 * effective render list — the mapLayerSorting atom without a ?layers=
 * override, the url param with one. The default follows the resolved theme.
 */

const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'
const SUBPROJECT_ID = '018cfd27-ee92-7000-b678-e75497d6c60e'
const PLACES_URL = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places`
const OSM_LAYER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const POSITRON_LAYER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const DARK_MATTER_LAYER_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
const ESRI_LAYER_ID = 'dddddddd-dddd-dddd-dddd-dddddddddddd'

test.use({ locale: 'de-CH' })

test('a shared imagery selection renders credited Esri tiles or OSM when unconfigured', async ({page}) => {
  let requests = 0
  await page.route('https://ibasemaps-api.arcgis.com/**', async route => {
    requests++
    await route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') })
  })
  await login(page, 'test@test.ch', 'test-test')
  await page.goto(`${PLACES_URL}?layers=${OSM_LAYER_ID}&panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer.getByRole('button', {name:'OpenStreetMap'})).toBeVisible({timeout:60_000})
  expect(requests).toBe(0)
  const imagery = drawer.getByRole('button', {name:'Satellit / Luftbild (Esri)'})
  if (await imagery.count()) {
    await imagery.click()
    await expect(page).toHaveURL(new RegExp(`layers=${ESRI_LAYER_ID}(&|$)`))
    await expect(page.locator('.leaflet-control-attribution')).toContainText('Powered by Esri')
    await expect.poll(() => requests).toBeGreaterThan(0)
  } else {
    await page.goto(`${PLACES_URL}?layers=${ESRI_LAYER_ID}&panes=map`)
    await expect(page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]').first()).toBeVisible({timeout:60_000})
    expect(requests).toBe(0)
  }
  await drawer.getByRole('button', {name:'Positron (hell)'}).click()
  await expect(page).toHaveURL(new RegExp(`layers=${POSITRON_LAYER_ID}(&|$)`))
  await expect(page.locator('.leaflet-control-attribution')).not.toContainText('Powered by Esri')
})

test('picking a background swaps it in the render list and persists', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await login(page, 'test@test.ch', 'test-test')

  await page.goto(`${PLACES_URL}?panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })

  // The default follows live system appearance in both directions.
  await expect(
    page.locator('img.leaflet-tile[src*="dark_all"]').first(),
  ).toBeVisible({ timeout: 30_000 })
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('img.leaflet-tile[src*="light_all"]').first()).toBeVisible()
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('img.leaflet-tile[src*="dark_all"]').first()).toBeVisible()
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('img.leaflet-tile[src*="light_all"]').first()).toBeVisible()

  // A deliberately contrasting selection survives a reload.
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

  // An unrelated choice is preserved on a theme change.
  await drawer.getByRole('button', { name: 'OpenStreetMap' }).click()
  await expect(
    page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]').first(),
  ).toBeVisible({ timeout: 30_000 })
  const sortingAfter = await page.evaluate(() =>
    window.localStorage.getItem('mapLayerSortingAtom'),
  )
  expect(sortingAfter).toContain(OSM_LAYER_ID)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]').first()).toBeVisible()
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
  await page.getByRole('button', { name: 'Darstellung: wie System' }).click()
  await page.getByRole('button', { name: 'Darstellung: hell' }).click()
  await expect(page).toHaveURL(new RegExp(`layers=${DARK_MATTER_LAYER_ID}(&|$)`))
  await drawer.getByRole('button', { name: 'OpenStreetMap' }).click()
  await expect(page).toHaveURL(
    new RegExp(`layers=${OSM_LAYER_ID}(&|$)`),
    { timeout: 10_000 },
  )
})
