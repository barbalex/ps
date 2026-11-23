import { test, expect } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

/**
 * Tile layers (tile_layers): project-owned raster xyz tile layers. Ones
 * with is_background = true are offered in the drawer's Hintergrundkarte
 * section — choosing one is pure view state (render list membership, like
 * the osm pseudo layer). Ones without it are stackable layers toggled in
 * the Active section like wms layers.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-tilelayers@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const PROJECT_ID = 'a0b0c0d0-0000-7000-8000-00000000e2f1'
const TILE_BG_ID = 'a0b0c0d0-0000-7000-8000-00000000e2f2'
const TILE_BG_LP = 'a0b0c0d0-0000-7000-8000-00000000e2f3'
const TILE_LAYER_ID = 'a0b0c0d0-0000-7000-8000-00000000e2f4'
const TILE_LAYER_LP = 'a0b0c0d0-0000-7000-8000-00000000e2f5'
const OSM_LAYER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const TILE_BG_LABEL = 'E2eTilesBg'
const TILE_LAYER_LABEL = 'E2eTilesLayer'
const BASE_URL = `/data/projects/${PROJECT_ID}`

test.beforeAll(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Tile Layers',
  })
  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO projects (project_id, name)
    VALUES ('${PROJECT_ID}', 'e2e tile layers')
    ON CONFLICT DO NOTHING;

    -- background tile layer: offered in the Hintergrundkarte section
    INSERT INTO tile_layers (tile_layer_id, project_id, label, url_template, is_background)
    VALUES ('${TILE_BG_ID}', '${PROJECT_ID}', '${TILE_BG_LABEL}', 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', TRUE)
    ON CONFLICT DO NOTHING;

    -- stackable tile layer: toggled in the Active section like wms layers
    INSERT INTO tile_layers (tile_layer_id, project_id, label, url_template, is_background)
    VALUES ('${TILE_LAYER_ID}', '${PROJECT_ID}', '${TILE_LAYER_LABEL}', 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', FALSE)
    ON CONFLICT DO NOTHING;

    INSERT INTO layer_presentations (layer_presentation_id, tile_layer_id, project_id, active)
    VALUES ('${TILE_BG_LP}', '${TILE_BG_ID}', '${PROJECT_ID}', FALSE)
    ON CONFLICT DO NOTHING;

    INSERT INTO layer_presentations (layer_presentation_id, tile_layer_id, project_id, active)
    VALUES ('${TILE_LAYER_LP}', '${TILE_LAYER_ID}', '${PROJECT_ID}', TRUE)
    ON CONFLICT DO NOTHING;
  `)
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'own',
  })
})

test.beforeEach(() => {
  // reset leftovers of failed previous runs: the seeded rows' flags, plus
  // rows a previous UI-add run created (unnamed, never filled in) — the
  // presentation rows go with them through the FK cascade
  psql(`
    SET electric.syncing TO 'true';
    UPDATE layer_presentations SET active = TRUE WHERE layer_presentation_id = '${TILE_LAYER_LP}';
    UPDATE layer_presentations SET active = FALSE WHERE layer_presentation_id = '${TILE_BG_LP}';
    DELETE FROM tile_layers
    WHERE project_id = '${PROJECT_ID}'
      AND (label IS NULL AND url_template IS NULL OR label = 'E2eTilesAdded');
  `)
})

const openDrawer = async (page: import('@playwright/test').Page) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(`${BASE_URL}?panes=map`)
  const drawer = page.locator('.map-layers-drawer')
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  // let the initial sync and the drawer's live queries settle before
  // interacting (same settle wait the other layer specs use)
  await page.waitForTimeout(3000)
  return drawer
}

test('a background tile layer is offered and chosen in the Hintergrundkarte section', async ({
  page,
}) => {
  const drawer = await openDrawer(page)

  // the seeded background tile layer is listed next to the pseudo options
  // in the Hintergrundkarte section (it also appears in the Tiles section
  // as a config row — the option buttons carry the section's _row_ class,
  // so scope by that); wait for the sync to deliver it
  const bgOption = drawer
    .locator('button[class*="_row_"]')
    .filter({ hasText: TILE_BG_LABEL })
  await expect(bgOption).toBeVisible({ timeout: 60_000 })

  // choosing it swaps the render list: the osm id is replaced by the tile
  // layer's presentation id (no url param — no override is active)
  await bgOption.click()
  // the swap is the cause, the tiles follow: poll the atom first
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.localStorage.getItem('mapLayerSortingAtom'),
        ),
      { timeout: 20_000 },
    )
    .toContain(TILE_BG_LP)
  await expect(
    page.locator('img.leaflet-tile[src*="light_all"]').first(),
  ).toBeVisible({ timeout: 30_000 })
  await expect(
    page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]'),
  ).toHaveCount(0)
  const sorting = await page.evaluate(() =>
    window.localStorage.getItem('mapLayerSortingAtom'),
  )
  expect(sorting).not.toContain(OSM_LAYER_ID)

  // the choice survives a reload
  await page.reload()
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await expect(
    page.locator('img.leaflet-tile[src*="light_all"]').first(),
  ).toBeVisible({ timeout: 30_000 })

  // back to the default background
  await drawer
    .locator('button[class*="_row_"]')
    .filter({ hasText: 'OpenStreetMap' })
    .click()
  await expect(
    page.locator('img.leaflet-tile[src*="tile.openstreetmap.org"]').first(),
  ).toBeVisible({ timeout: 30_000 })
  const sortingAfter = await page.evaluate(() =>
    window.localStorage.getItem('mapLayerSortingAtom'),
  )
  expect(sortingAfter).toContain(OSM_LAYER_ID)
})

test('adding a tile layer through the drawer UI works', async ({ page }) => {
  const drawer = await openDrawer(page)

  // the add button sits below the fold of the scrollable drawer and fluent
  // headers swallow synthesized pointer clicks in this environment (see the
  // wms-ui test in layer-activation.spec) — dispatch the click directly
  await drawer
    .getByRole('button', { name: 'Add tile layer', exact: true })
    .dispatchEvent('click')

  // createTileLayer adds the presentation right away: the new row opens
  // with the config tab (no url template yet)
  const unnamedRow = drawer.getByRole('button', {
    name: 'Tile layer without a name',
    exact: true,
  })
  await expect(unnamedRow).toBeVisible({ timeout: 20_000 })

  // fill the config form (the shared text fields commit on blur)
  const urlField = drawer.getByLabel('URL template')
  await expect(urlField).toBeVisible({ timeout: 10_000 })
  await urlField.fill(
    'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  )
  await urlField.press('Tab')
  const labelField = drawer.getByLabel('Label')
  await labelField.fill('E2eTilesAdded')
  await labelField.press('Tab')

  // the row label follows the stored label (live query)
  await expect(
    drawer.getByRole('button', { name: 'E2eTilesAdded', exact: true }),
  ).toBeVisible({ timeout: 20_000 })

  // flipping is_background lists it in the Hintergrundkarte section.
  // el.click() instead of locator.check: the switch input is React-
  // controlled and synthesized CDP clicks don't reach its onChange in this
  // environment (same fluent quirk as the accordion headers), so the
  // controlled value reverts. el.click() flips checked before the event
  // dispatches, so the handler sees the new state
  const bgSwitch = drawer.getByRole('switch', { name: 'Background map' })
  await bgSwitch.evaluate((el: HTMLInputElement) => el.click())
  await expect(bgSwitch).toBeChecked({ timeout: 5_000 })
  const bgOption = drawer
    .locator('button[class*="_row_"]')
    .filter({ hasText: 'E2eTilesAdded' })
  await expect(bgOption).toBeVisible({ timeout: 20_000 })

  // choosing it renders its tiles (view state, no db write needed).
  // :visible because leaflet keeps stale/fading tiles in the DOM hidden —
  // the first tile in DOM order is not necessarily a displayed one
  await bgOption.click()
  await expect(
    page.locator('img.leaflet-tile[src*="voyager"]:visible').first(),
  ).toBeVisible({ timeout: 30_000 })
})

test('a stackable tile layer renders and toggles like a wms layer', async ({
  page,
}) => {
  const drawer = await openDrawer(page)

  // the seeded active tile layer renders its tiles; wait for the sync to
  // deliver it into the Active section. its anchor carries the Active
  // section's _headerButton_ class (the Tiles-section config row uses
  // _labelButton_ and the zoom-to buttons are plain buttons), so the
  // anchor locator is unambiguous
  const toggle = drawer.locator("a[class*='_headerButton_'][aria-pressed]")
  await expect(toggle).toHaveCount(1, { timeout: 60_000 })
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.locator('img.leaflet-tile[src*="dark_all"]').first(),
  ).toBeVisible({ timeout: 30_000 })

  // deactivating removes the row from Active and stops rendering it
  await toggle.click()
  await expect(toggle).toHaveCount(0, { timeout: 20_000 })
  await expect(
    page.locator('img.leaflet-tile[src*="dark_all"]'),
  ).toHaveCount(0, { timeout: 20_000 })
})
