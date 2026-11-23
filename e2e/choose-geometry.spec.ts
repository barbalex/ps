import { test, expect, type Page } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

/**
 * The choosing tool: activated from the map toolbar, one click on a
 * geometry of an own layer starts editing that geometry — the row's form
 * route opens (with the map pane) and the geoman draw/edit toolbar of the
 * DrawControl mounts. Clicking a spot without own-layer geometry warns
 * and keeps the mode active.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-choosegeometry@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

test.use({ locale: 'de-DE' })

const PROJECT_ID = 'a0b0c0d0-0000-7000-8000-00000000e3e1'
const PLACE_LEVEL_ID = 'a0b0c0d0-0000-7000-8000-00000000e3e2'
const OWN_LAYER_ID = 'a0b0c0d0-0000-7000-8000-00000000e3e3'
const PRESENTATION_ID = 'a0b0c0d0-0000-7000-8000-00000000e3e4'
const SUBPROJECT_ID = 'a0b0c0d0-0000-7000-8000-00000000e3e5'
const PLACE_ID = 'a0b0c0d0-0000-7000-8000-00000000e3e6'

// no spaces: the layer name becomes part of the leaflet pane class
const OWN_NAME = 'E2eChooseOwn'
const PLACE_LABEL = 'E2eChoosePlace'
// the seeded point geometry; the map opens centered on it (?c=…&z=…)
const LAT = 47.37
const LNG = 8.54

test.beforeAll(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Choose Geometry',
  })
  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO projects (project_id, name)
    VALUES ('${PROJECT_ID}', 'e2e choose geometry')
    ON CONFLICT DO NOTHING;

    INSERT INTO place_levels (
      place_level_id, project_id, level,
      name_singular_de, name_plural_de,
      name_singular_en, name_plural_en,
      name_singular_fr, name_plural_fr,
      name_singular_it, name_plural_it
    )
    VALUES (
      '${PLACE_LEVEL_ID}', '${PROJECT_ID}', 1,
      'E2eChooseOrt', 'E2eChooseOrte',
      'E2eChooseOrt', 'E2eChooseOrte',
      'E2eChooseOrt', 'E2eChooseOrte',
      'E2eChooseOrt', 'E2eChooseOrte'
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO vector_layers (
      vector_layer_id, project_id, type, name, own_table, own_table_level
    )
    VALUES (
      '${OWN_LAYER_ID}', '${PROJECT_ID}', 'own', '${OWN_NAME}', 'places', 1
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO subprojects (subproject_id, project_id, name)
    VALUES ('${SUBPROJECT_ID}', '${PROJECT_ID}', 'e2e choose sub')
    ON CONFLICT DO NOTHING;

    INSERT INTO places (place_id, subproject_id, level, label, geometry) VALUES
      ('${PLACE_ID}', '${SUBPROJECT_ID}', 1, '${PLACE_LABEL}',
        ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[${LNG},${LAT}]}]}'))
      ON CONFLICT (place_id) DO UPDATE SET geometry = EXCLUDED.geometry;

    -- active presentation: the default view (no ?layers= override) shows
    -- the layer, so no drawer interaction is needed
    INSERT INTO layer_presentations (layer_presentation_id, vector_layer_id, project_id, active)
    VALUES (
      '${PRESENTATION_ID}', '${OWN_LAYER_ID}', '${PROJECT_ID}', TRUE
    )
    ON CONFLICT DO NOTHING;

    -- TableLayer renders nothing without a display row (the app's
    -- properties provider normally auto-creates them)
    INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e3e7', '${OWN_LAYER_ID}')
    ON CONFLICT DO NOTHING;
  `)
  // role rows on every level: the sync shapes gate subprojects and places
  // on subproject_roles/place_roles rows (normally created by the insert
  // triggers — but the place here is seeded before the roles exist, and
  // the ON CONFLICT update path does not fire them again)
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'write-all',
    subprojectIds: [SUBPROJECT_ID],
    placeIds: [PLACE_ID],
  })
})

const openMap = async (page: Page) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(
    `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}?panes=map&c=${LAT}%2C${LNG}&z=17`,
  )
  // the own layer's pane exists but stays zero-size (like every custom
  // pane — see layer-activation.spec.ts); the place's clickable circle is
  // the signal that the feature actually rendered
  await expect(
    page.locator(`.leaflet-pane[class*="${OWN_NAME}-pane"]`),
  ).toBeAttached({ timeout: 60_000 })
  await page.waitForSelector('.clickable-hitbox', { timeout: 60_000 })
}

const activateChooseTool = async (page: Page) => {
  await page
    .getByRole('button', { name: 'Geometrie wählen, um sie zu bearbeiten' })
    .click()
  await expect(
    page.locator('.map-container.choosing-geometry-active'),
  ).toHaveCount(1)
}

test('choosing a geometry starts editing it', async ({ page }) => {
  await openMap(page)
  await activateChooseTool(page)

  // click the map center — where the seeded point sits
  const map = page.locator('#map .leaflet-container')
  const box = await map.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)

  // the place form route opened for the chosen row
  await expect(page).toHaveURL(new RegExp(`/places/${PLACE_ID}/place`), {
    timeout: 20_000,
  })
  // the DrawControl mounted with geoman's draw/edit toolbar
  await expect(
    page.locator('.leaflet-geoman-toolbar').first(),
  ).toBeVisible({ timeout: 20_000 })
  // the choosing mode has ended
  await expect(
    page.locator('.map-container.choosing-geometry-active'),
  ).toHaveCount(0)
})

test('clicking a spot without geometry warns and keeps the mode', async ({
  page,
}) => {
  await openMap(page)
  await activateChooseTool(page)

  // top-right of the map: far from the centered feature and clear of the
  // layers drawer (left) and the controls (top-left/bottom-right)
  const map = page.locator('#map .leaflet-container')
  const box = await map.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.click(box!.x + box!.width * 0.75, box!.y + box!.height * 0.25)

  await page.waitForSelector('text=Keine Geometrie', { timeout: 10_000 })
  // the mode stays on for the next click
  await expect(
    page.locator('.map-container.choosing-geometry-active'),
  ).toHaveCount(1)
})
