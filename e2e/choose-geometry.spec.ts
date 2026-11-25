import { test, expect, type Page } from '@playwright/test'
import { closeLayerDrawerIfOpen, ensureUser, grantRoles, login, psql } from './helpers.ts'

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
const PRECISE_PLACE_ID = 'a0b0c0d0-0000-7000-8000-00000000e3ec'

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

    INSERT INTO places (place_id, subproject_id, level, label) VALUES
      ('${PRECISE_PLACE_ID}', '${SUBPROJECT_ID}', 1, 'E2ePrecisePoint')
      ON CONFLICT DO NOTHING;
    -- The sync duplicate-insert trigger runs before ON CONFLICT.
    UPDATE places SET geometry = NULL, bbox = NULL, gps_accuracy_m = NULL WHERE place_id = '${PRECISE_PLACE_ID}';
    UPDATE places SET geometry = ST_GeomFromGeoJSON('{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[${LNG},${LAT}]}]}')
      WHERE place_id = '${PLACE_ID}';

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
    placeIds: [PLACE_ID, PRECISE_PLACE_ID],
  })
})

const openMap = async (page: Page, zoom = 17) => {
  psql(`SET electric.syncing TO 'true'; UPDATE layer_presentations SET active = TRUE WHERE layer_presentation_id = '${PRESENTATION_ID}';`)
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(
    `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}?panes=map&c=${LAT}%2C${LNG}&z=${zoom}`,
  )
  // the own layer's pane exists but stays zero-size (like every custom
  // pane — see layer-activation.spec.ts); the place's clickable circle is
  // the signal that the feature actually rendered
  await expect(
    page.locator(`.leaflet-pane[class*="${OWN_NAME}-pane"]`),
  ).toBeAttached({ timeout: 60_000 })
  await page.waitForSelector('.clickable-hitbox', { timeout: 60_000 })
}

const activateChooseTool = async (
  page: Page,
  name = 'Geometrie wählen, um sie zu bearbeiten',
) => {
  await page
    .getByRole('button', { name })
    .click()
  await expect(
    page.locator('.map-container.choosing-geometry-active'),
  ).toHaveCount(1)
}

test('clicking near the edge of a place marker shows its info at low zoom', async ({ page }) => {
  const serviceUrl = 'http://localhost:5176/e2e-incomplete-wfs'
  const serviceId = 'a0b0c0d0-0000-7000-8000-00000000e3e8'
  const layerId = 'a0b0c0d0-0000-7000-8000-00000000e3e9'
  psql(`
    SET electric.syncing TO 'true';
    INSERT INTO wfs_services (wfs_service_id, project_id, url)
    VALUES ('${serviceId}', '${PROJECT_ID}', '${serviceUrl}') ON CONFLICT DO NOTHING;
    INSERT INTO wfs_service_layers (wfs_service_layer_id, wfs_service_id, name)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e3eb', '${serviceId}', 'available') ON CONFLICT DO NOTHING;
    INSERT INTO vector_layers (vector_layer_id, project_id, type, wfs_service_id)
    VALUES ('${layerId}', '${PROJECT_ID}', 'wfs', '${serviceId}') ON CONFLICT DO NOTHING;
    INSERT INTO layer_presentations (layer_presentation_id, vector_layer_id, project_id, active)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e3ea', '${layerId}', '${PROJECT_ID}', TRUE) ON CONFLICT DO NOTHING;
  `)
  const featureRequests: string[] = []
  await page.route(`${serviceUrl}**`, (route) => {
    const url = new URL(route.request().url())
    if (url.searchParams.get('request') === 'GetFeature') featureRequests.push(url.href)
    return route.fulfill({ json: { type: 'FeatureCollection', features: [] } })
  })
  await openMap(page, 10)
  const hitbox = await page.locator('.clickable-hitbox').first().boundingBox()
  if (!hitbox) throw new Error('Place marker is not visible')
  await page.mouse.click(hitbox.x + hitbox.width - 2, hitbox.y + hitbox.height / 2)
  await expect(page.locator('.map-info-drawer')).toContainText(PLACE_ID)
  expect(featureRequests).toEqual([])
})

test('choosing a geometry starts editing it', async ({ page }) => {
  // The app language, not the German browser locale, determines tool labels.
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await openMap(page)
  await activateChooseTool(page, 'Choose a geometry to edit it')

  const hitbox = page.locator('.clickable-hitbox').first()
  const box = await hitbox.boundingBox()
  if (!box) throw new Error('Place marker is not visible')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

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

  await closeLayerDrawerIfOpen(page)
  const marker = page.getByRole('button', { name: 'Draw Marker', exact: true })
  await marker.hover({ timeout: 15_000 })
  await expect(page.getByRole('tooltip', { name: 'Draw Marker' })).toBeVisible()
  await marker.click()
  const cancel = page.locator('.leaflet-geoman-toolbar').getByRole('button', {
    name: 'Cancel', exact: true,
  })
  await cancel.focus()
  await expect(page.getByRole('tooltip', { name: 'Cancel' })).toBeVisible()
  await cancel.press('Enter')
  await expect(cancel).toBeHidden()

  await page.getByRole('button', { name: 'Edit Layers', exact: true }).click()
  const point = page.locator('.geometry-editing.leaflet-geoman-draggable')
  await expect(point).toBeVisible()
  const bounds = await point.boundingBox()
  if (!bounds) throw new Error('Editable point is not visible')
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  const startLng = Number(psql(`SELECT ST_X(ST_GeometryN(geometry, 1)) FROM places WHERE place_id = '${PLACE_ID}'`))
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 60, y, { steps: 12 })
  await page.mouse.up()
  // Moving 60 pixels east at zoom 17 changes longitude, not latitude.
  await expect.poll(() => psql(`
    SELECT ST_NumGeometries(geometry) = 1 AND
      abs(ST_X(ST_GeometryN(geometry, 1)) - ${startLng + 60 * 360 / (256 * 2 ** 17)}) < 0.00002 AND
      abs(ST_Y(ST_GeometryN(geometry, 1)) - ${LAT}) < 0.00002
    FROM places WHERE place_id = '${PLACE_ID}'
  `), { timeout: 30_000 }).toBe('t')
  await page.locator('button[name="edit_geometry"]').click()
  await expect(page.locator('.geometry-editing')).toHaveCount(0)
  await expect(hitbox).toBeVisible()
  const moved = await hitbox.boundingBox()
  if (!moved) throw new Error('Moved place marker is not visible')
  const clickPlace = () => page.mouse.click(moved.x + moved.width / 2, moved.y + moved.height / 2)
  await clickPlace()
  const drawer = page.locator('.map-info-drawer')
  await expect(drawer).toContainText(PLACE_ID)
  await drawer.getByTitle('Close').click()
  await page.locator('button[name="layer_menu"]').click()
  await page.getByRole('button', { name: 'E2eChooseOrte', exact: true })
    .locator('[aria-pressed="true"]').click()
  await expect(hitbox).toHaveCount(0)
  await closeLayerDrawerIfOpen(page)
  await clickPlace()
  await expect(drawer).toContainText('No Data found at this location')
  await drawer.getByTitle('Close').click()
  await page.locator('button[name="edit_geometry"]').click()
  await expect(page.locator('.geometry-editing')).toBeVisible()
  await page.reload()
  await expect(page.locator('button[name="edit_geometry"]')).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('.geometry-editing')).toHaveCount(0)
  await expect(hitbox).toHaveCount(0)
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

test('precise placement previews without writing and moves the same point on Apply', async ({ page }) => {
  psql(`SET electric.syncing TO 'true';
    INSERT INTO project_crs (project_crs_id, project_id, crs_id, code, proj4)
    SELECT 'a0b0c0d0-0000-7000-8000-00000000e3ed', '${PROJECT_ID}', crs_id, code, proj4
    FROM crs WHERE code = 'EPSG:2056' ON CONFLICT DO NOTHING;
    UPDATE projects SET map_presentation_crs = 'EPSG:2056' WHERE project_id = '${PROJECT_ID}';`)
  await page.setViewportSize({ width: 390, height: 700 })
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(`/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/${PRECISE_PLACE_ID}/place?panes=map&c=${LAT}%2C${LNG}&z=17`)
  await closeLayerDrawerIfOpen(page)
  await page.locator('button[name="edit_geometry"]').click()
  const place = page.getByRole('button', { name: 'Place point precisely' })
  await place.click({ timeout: 60_000 })
  const input = page.getByPlaceholder('2600000 / 1200000')
  const apply = page.getByRole('button', { name: 'Apply point' })
  const preview = page.getByRole('button', { name: 'Preview', exact: true })
  await input.fill('1200000 / 2600000')
  await preview.click()
  await expect(page.getByRole('alert')).toContainText('Invalid coordinates for EPSG:2056')
  await expect(apply).toBeDisabled()
  await input.fill("2'600'000 / 1'200'000")
  await preview.click()
  await expect(apply).toBeEnabled()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.locator('.geometry-editing')).toHaveCount(0)
  // The preview centered the map on the LV95 origin. Place at that crosshair,
  // then move by an exact coordinate pair; both writes must reach PostGIS.
  const storedPoint = () => psql(`SELECT round(ST_X(p)) || '/' || round(ST_Y(p))
    FROM (SELECT ST_Transform(ST_GeometryN(geometry, 1), 2056) AS p
      FROM places WHERE place_id = '${PRECISE_PLACE_ID}' AND ST_NumGeometries(geometry) = 1) q`)
  await place.click()
  await apply.click()
  await expect.poll(storedPoint, { timeout: 30_000 }).toBe('2600000/1200000')
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.locator('.geometry-editing')).toHaveCount(0)
  await expect.poll(storedPoint, { timeout: 30_000 }).toBe('')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.locator('.geometry-editing')).toHaveCount(1)
  await expect.poll(storedPoint, { timeout: 30_000 }).toBe('2600000/1200000')
  await place.click()
  await input.fill('2600100, 1200020')
  await preview.click()
  await apply.click()
  await expect.poll(storedPoint, { timeout: 30_000 }).toBe('2600100/1200020')

  await place.click()
  await input.fill('2600200, 1200040')
  await preview.click()
  psql(`SET electric.syncing TO 'true';
    UPDATE projects SET map_presentation_crs = NULL WHERE project_id = '${PROJECT_ID}';`)
  await expect(input).toHaveCount(0)
  await place.click()
  await page.getByRole('textbox', { name: /EPSG:4326/ }).fill('-1.23 / 48.56')
  await preview.click()
  await apply.click()
  await expect.poll(() => psql(`SELECT ST_AsText(ST_GeometryN(geometry, 1))
    FROM places WHERE place_id = '${PRECISE_PLACE_ID}'`), { timeout: 30_000 }).toBe('POINT(-1.23 48.56)')
})

test('GPS preview saves the fix and reported accuracy only on Apply', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: LAT, longitude: LNG, accuracy: 8.25 })
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(`/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/${PRECISE_PLACE_ID}/place?panes=map`)
  await closeLayerDrawerIfOpen(page)
  await page.locator('button[name="edit_geometry"]').click()
  const place = page.getByRole('button', { name: 'Place point precisely' })
  const capture = page.getByRole('button', { name: 'Capture GPS position' })
  const apply = page.getByRole('button', { name: 'Apply point' })
  const stored = () => psql(`SELECT ST_AsText(ST_GeometryN(geometry, 1)) || '/' || gps_accuracy_m
    FROM places WHERE place_id = '${PRECISE_PLACE_ID}'`)
  const before = stored()
  await place.click({ timeout: 60_000 })
  await capture.click()
  await expect(page.getByText('Horizontal accuracy: ±8.25 m')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  expect(stored()).toBe(before)
  await place.click()
  await capture.click()
  await expect(page.getByText('Horizontal accuracy: ±8.25 m')).toBeVisible()
  await apply.click()
  await expect.poll(stored, { timeout: 30_000 }).toBe(`POINT(${LNG} ${LAT})/8.25`)
  await page.reload()
  await page.locator('button[name="edit_geometry"]').click()
  await place.click()
  await expect(page.getByText('Saved GPS accuracy: ±8.25 m')).toBeVisible()
  const undo = page.getByRole('button', { name: 'Undo', exact: true })
  const redo = page.getByRole('button', { name: 'Redo', exact: true })
  const versions = () => Number(psql(`SELECT count(*) FROM places_history WHERE place_id = '${PRECISE_PLACE_ID}'`))
  const initialVersions = versions()
  await expect(page.getByText('Editing geometry: E2ePrecisePoint')).toBeVisible()
  await expect(undo).toBeDisabled()
  await apply.click()
  await expect.poll(stored, { timeout: 30_000 }).toBe('')
  await undo.click()
  await expect.poll(stored, { timeout: 30_000 }).toBe(`POINT(${LNG} ${LAT})/8.25`)
  await expect(page.locator('.geometry-editing')).toHaveCount(1)
  await redo.click()
  await expect.poll(stored, { timeout: 30_000 }).toBe('')
  await expect.poll(versions, { timeout: 30_000 }).toBe(initialVersions + 3)
  await undo.click()
  await place.click()
  await expect(page.getByText('Saved GPS accuracy: ±8.25 m')).toBeVisible()
  await apply.click()
  await expect(redo).toBeDisabled()
  const listenerWarnings: string[] = []
  page.on('console', message => {
    if (message.type() === 'warning' && message.text().includes('wrong listener type'))
      listenerWarnings.push(message.text())
  })
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await expect(page.locator('.geometry-editing')).toHaveCount(0)
  expect(listenerWarnings).toEqual([])
  await page.locator('button[name="edit_geometry"]').click()
  await expect(undo).toBeDisabled()
  await context.setGeolocation(null)
  await place.click()
  await capture.click()
  await expect(capture).toBeEnabled()
  await expect(apply).toBeDisabled()
})

test('GPS averaging previews five fresh fixes across the date line before persisting', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(`/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/${PRECISE_PLACE_ID}/place?panes=map`)
  await closeLayerDrawerIfOpen(page)
  await page.locator('button[name="edit_geometry"]').click()
  await page.getByRole('button', { name: 'Place point precisely' }).click({ timeout: 60_000 })
  await page.evaluate(() => {
    let index = 0
    let firstTimestamp = 0
    const longitudes = [179.9998, 0, 179.9999, 180, -179.9999, -179.9998]
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      value: (success: (fix: { coords: Pick<GeolocationCoordinates, 'latitude' | 'longitude' | 'accuracy'>; timestamp: number }) => void) => {
        if (!index) firstTimestamp = Date.now()
        const longitude = longitudes[index]
        const timestamp = index === 1 ? firstTimestamp : Date.now()
        index++
        success({
          coords: { latitude: 0, longitude, accuracy: 3 },
          timestamp,
        })
      },
    })
  })
  const apply = page.getByRole('button', { name: 'Apply point' })
  const stored = () => psql(`SELECT concat_ws('/', abs(ST_X(ST_GeometryN(geometry,1)))::numeric(9,5),
    ST_Y(ST_GeometryN(geometry,1))::numeric(9,5), round(gps_accuracy_m::numeric,2))
    FROM places WHERE place_id = '${PRECISE_PLACE_ID}'`)
  const before = stored()
  await page.getByRole('button', { name: 'Average 5 GPS fixes' }).click()
  await expect(page.getByText('Stand still: collected 1 of 5 GPS fixes.')).toBeVisible()
  await expect(apply).toBeDisabled()
  await expect(page.getByText(/Average of 5 fixes\. Radius covering all accuracy circles: 25\.239 m/)).toBeVisible({ timeout: 15_000 })
  expect(stored()).toBe(before)
  await apply.click()
  await expect.poll(stored, { timeout: 30_000 }).toBe('180.00000/0.00000/25.24')
})

for (const shape of ['point', 'line', 'polygon'] as const) {
  test(`dragging a whole ${shape} translates every vertex and can be undone`, async ({
    page,
  }) => {
    const wkt =
      shape === 'point' ? 'POINT(8.54 47.37)'
      : shape === 'line' ?
        'LINESTRING(8.5395 47.37,8.54 47.37,8.5405 47.37)'
      : 'POLYGON((8.5395 47.3698,8.5405 47.3698,8.54 47.3702,8.5395 47.3698))'
    const id = PRECISE_PLACE_ID
    const zoom = shape === 'polygon' ? 16 : 17
    psql(
      `SET electric.syncing TO 'true'; UPDATE places SET geometry = ST_GeomFromText('GEOMETRYCOLLECTION(${wkt},POINT(8.542 47.37))',4326), gps_accuracy_m = NULL WHERE place_id = '${id}';`,
    )
    await page.addInitScript(() => localStorage.setItem('language', '"en"'))
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await page.goto(
      `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/${id}/place?panes=map&c=${LAT}%2C${LNG}&z=${zoom}`,
    )
    await closeLayerDrawerIfOpen(page)
    await page.locator('button[name="edit_geometry"]').click()
    const drag = page.getByRole('button', { name: 'Drag Layers', exact: true })
    await expect(page.locator('.geometry-editing')).toHaveCount(2, {
      timeout: 60_000,
    })
    await closeLayerDrawerIfOpen(page)
    await drag.click({ timeout: 10_000 })
    const path = page
      .locator('.geometry-editing.leaflet-geoman-draggable')
      .first()
    const bounds = await path.boundingBox()
    if (!bounds) throw new Error(`Editable ${shape} not visible`)
    const x = bounds.x + bounds.width / 2
    const y = bounds.y + bounds.height / 2
    const historyCount = () =>
      Number(
        psql(`SELECT count(*) FROM places_history WHERE place_id = '${id}'`),
      )
    const before = historyCount()
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 40, y, { steps: 10 })
    await page.mouse.up()
    const matches = (pixels: number) =>
      psql(`SELECT ST_OrderingEquals(
              ST_SnapToGrid(ST_GeometryN(geometry,1), 0.000001),
              ST_SnapToGrid(ST_Translate(ST_GeomFromText('${wkt}',4326), ${pixels} * 360.0 / (256 * 2^${zoom}), 0), 0.000001))
              AND ST_AsText(ST_GeometryN(geometry,2)) = 'POINT(8.542 47.37)'
              FROM places WHERE place_id = '${id}'`)
    await expect.poll(() => matches(40), { timeout: 30_000 }).toBe('t')
    await expect.poll(historyCount).toBe(before + 1)
    if (shape === 'point') {
      await drag.click()
      await drag.click()
      await page.mouse.click(x + 40, y)
    }
    await expect(page.locator('.geometry-nudge-target')).toHaveCount(1)
    await page.keyboard.press('ArrowRight')
    const fine = 0.3 * 96 / 25.4
    await expect.poll(() => matches(40 + fine), { timeout: 30_000 }).toBe('t')
    await page.keyboard.press('Shift+ArrowLeft')
    await expect.poll(() => matches(40 + fine - 2 * 96 / 25.4), { timeout: 30_000 }).toBe('t')
    await drag.click()
    const undo = page.getByRole('button', { name: 'Undo', exact: true })
    await undo.click()
    await expect.poll(() => matches(40 + fine)).toBe('t')
    await undo.click()
    await expect.poll(() => matches(40)).toBe('t')
    await undo.click()
    await expect.poll(() => matches(0), { timeout: 30_000 }).toBe('t')
  })
}
