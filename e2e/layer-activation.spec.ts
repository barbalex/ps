import { test, expect, type Page } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

/**
 * Activating a layer in the map drawer must do three things at once —
 * check the row's checkbox, move the layer into the Active section, and
 * render its pane on the map — for WMS and vector layers alike.
 * Regression: the vector checkbox was hardcoded unchecked, vector
 * activation never joined the render list, and WMS activation never set
 * the layer_presentations.active flag.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-layeractivation@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const PROJECT_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e1'
const WMS_SERVICE_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e2'
const WMS_LAYER_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e3'
const VECTOR_LAYER_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e4'
const WFS_SERVICE_ID = 'a0b0c0d0-0000-7000-8000-00000000e2ed'
const PLACE_LEVEL_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e5'
const OWN_LAYER_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e6'
const SUBPROJECT_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e8'
const UPLOAD_ID = 'a0b0c0d0-0000-7000-8000-00000000e2ea'

// no spaces: the layer name becomes part of the leaflet pane class
const VECTOR_NAME = 'E2eVec'
const WMS_LABEL = 'E2eWms'
// own table layer: the label comes from the place level's name_plural
const OWN_LABEL = 'E2eOwns'
const OWN_NAME = 'E2eOwnLayer'
const ownPlaceIds = ['a0b0c0d0-0000-7000-8000-00000000ce01', 'a0b0c0d0-0000-7000-8000-00000000ce02']

test.beforeAll(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Layer Activation',
  })
  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO projects (project_id, name)
    VALUES ('${PROJECT_ID}', 'e2e layer activation')
    ON CONFLICT DO NOTHING;

    -- the url must be a same-origin path: the served index.html (200,
    -- unparseable capabilities) makes AutoFetchCapabilities mark the
    -- service seen, while an external url failing CORS counts as a
    -- network error and is retried on every reload, forever.
    -- Upsert heals dev dbs seeded with the former example.com url.
    INSERT INTO wms_services (wms_service_id, project_id, url)
    VALUES ('${WMS_SERVICE_ID}', '${PROJECT_ID}', '/e2e-wms')
    ON CONFLICT (wms_service_id) DO UPDATE SET url = EXCLUDED.url;

    INSERT INTO wms_layers (wms_layer_id, project_id, wms_service_id, wms_service_layer_name, label)
    VALUES ('${WMS_LAYER_ID}', '${PROJECT_ID}', '${WMS_SERVICE_ID}', 'e2e.layer', '${WMS_LABEL}')
    ON CONFLICT DO NOTHING;

    INSERT INTO wms_service_layers (wms_service_layer_id, wms_service_id, name, queryable)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e2e9', '${WMS_SERVICE_ID}', 'e2e.layer', FALSE)
    ON CONFLICT DO NOTHING;

    INSERT INTO wfs_services(wfs_service_id, project_id, url, version, default_crs)
    VALUES ('${WFS_SERVICE_ID}', '${PROJECT_ID}', '/e2e-wfs', '2.0.0', 'EPSG:4326')
    ON CONFLICT DO NOTHING;
    INSERT INTO wfs_service_layers(wfs_service_layer_id, wfs_service_id, name)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e2ee', '${WFS_SERVICE_ID}', 'e2e.layer')
    ON CONFLICT DO NOTHING;
    INSERT INTO vector_layers (vector_layer_id, project_id, type, name)
    VALUES ('${VECTOR_LAYER_ID}', '${PROJECT_ID}', 'wfs', '${VECTOR_NAME}')
    ON CONFLICT DO NOTHING;
    -- While syncing, a duplicate insert is skipped by a BEFORE trigger,
    -- before ON CONFLICT DO UPDATE could repair the old unconfigured fixture.
    UPDATE vector_layers SET wfs_service_id = '${WFS_SERVICE_ID}', wfs_service_layer_name = 'e2e.layer',
      display_by_property = 'kind'
    WHERE vector_layer_id = '${VECTOR_LAYER_ID}';
    INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id, display_property_value, color)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e2ef', '${VECTOR_LAYER_ID}', 'test', '#842f62')
    ON CONFLICT DO NOTHING;

    INSERT INTO vector_layers (vector_layer_id, project_id, type, name, display_by_property)
    VALUES ('${UPLOAD_ID}', '${PROJECT_ID}', 'upload', 'E2eUpload', 'kind')
    ON CONFLICT DO NOTHING;
    INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id, display_property_value, color)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e2eb', '${UPLOAD_ID}', 'tree', '#276351')
    ON CONFLICT DO NOTHING;
    INSERT INTO vector_layer_geoms (vector_layer_geom_id, vector_layer_id, geometry, properties)
    VALUES ('a0b0c0d0-0000-7000-8000-00000000e2ec', '${UPLOAD_ID}',
      ST_GeomFromText('GEOMETRYCOLLECTION(POINT(8.54 47.37),POINT(8.5405 47.37))', 4326),
      '{"label":"Beech","kind":"tree","metadata":{"height":12},"place_id":"not an own place"}')
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
      '${OWN_LABEL}', '${OWN_LABEL}',
      '${OWN_LABEL}', '${OWN_LABEL}',
      '${OWN_LABEL}', '${OWN_LABEL}',
      '${OWN_LABEL}', '${OWN_LABEL}'
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
    VALUES ('${SUBPROJECT_ID}', '${PROJECT_ID}', 'e2e sub')
    ON CONFLICT DO NOTHING;

    -- an existing inactive presentation: activating must REUSE it and set
    -- the active flag (the reported bug: it only joined the render list)
    INSERT INTO layer_presentations (layer_presentation_id, vector_layer_id, project_id, active)
    VALUES (
      'a0b0c0d0-0000-7000-8000-00000000e2e7',
      '${OWN_LAYER_ID}', '${PROJECT_ID}', FALSE
    )
    ON CONFLICT DO NOTHING;
    INSERT INTO vector_layer_displays (vector_layer_id)
    SELECT '${OWN_LAYER_ID}' WHERE NOT EXISTS (
      SELECT 1 FROM vector_layer_displays WHERE vector_layer_id = '${OWN_LAYER_ID}'
    );
    INSERT INTO places (place_id, subproject_id, level, geometry)
    SELECT id::uuid, '${SUBPROJECT_ID}', 1, ST_GeomFromText('GEOMETRYCOLLECTION(POINT(7.43 46.95))', 4326)
    FROM (VALUES ('${ownPlaceIds[0]}'), ('${ownPlaceIds[1]}')) seed(id)
    ON CONFLICT DO NOTHING;
  `)
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'own',
    subprojectIds: [SUBPROJECT_ID],
    placeIds: ownPlaceIds,
  })
})

test.beforeEach(() => {
  // reset leftovers of a failed previous run so the pressed-toggle counts
  // and single-row polls below stay unambiguous: deactivate everything and
  // collapse duplicate presentations (a run that out-raced the sync of the
  // seeded presentation created a second one)
  psql(`
    UPDATE layer_presentations SET active = FALSE WHERE project_id = '${PROJECT_ID}';
    DELETE FROM layer_presentations a
    USING layer_presentations b
    WHERE a.project_id = '${PROJECT_ID}'
      AND a.layer_presentation_id < b.layer_presentation_id
      AND a.wms_layer_id IS NOT DISTINCT FROM b.wms_layer_id
      AND a.vector_layer_id IS NOT DISTINCT FROM b.vector_layer_id;

    -- failed runs of the UI-add test leave real unlabeled wms layers
    -- (the sync escape hatch bypasses the write-permission trigger)
    SET electric.syncing TO 'true';
    DELETE FROM wms_layers WHERE project_id = '${PROJECT_ID}' AND label IS NULL;
    SET electric.syncing TO DEFAULT;
  `)
})

const openDrawer = async (page: Page, subprojectId?: string) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  const base = subprojectId ?
    `/data/projects/${PROJECT_ID}/subprojects/${subprojectId}`
  : `/data/projects/${PROJECT_ID}`
  await page.goto(`${base}?panes=map&leftMapDrawerTab=layers`)
  await page.waitForSelector('.map-layers-drawer', { timeout: 60_000 })
  // wait for the initial sync to list the seeded layers
  await expect(
    page.getByRole('button', { name: VECTOR_NAME, exact: true }),
  ).toBeVisible({ timeout: 60_000 })
  await expect(
    page.getByRole('button', { name: WMS_LABEL, exact: true }),
  ).toBeVisible({ timeout: 60_000 })
  if (subprojectId) {
    await expect(
      page.getByRole('button', { name: OWN_LABEL, exact: true }),
    ).toBeVisible({ timeout: 60_000 })
  }
}

/** the label sits between the Active heading and the next section heading */
const listedUnderActive = async (page: Page, label: string) => {
  const drawer = await page.locator('.map-layers-drawer').innerText()
  const activeAt = drawer.indexOf('Active')
  const nextAt = drawer.indexOf('WMS', activeAt)
  const labelAt = drawer.indexOf(label)
  return labelAt > activeAt && labelAt < nextAt
}

// the visibility toggle: the only anchor-button in the row header that
// carries aria-pressed (active rows also have e.g. a "Zoom to layer" button)
const toggleOf = (page: Page, label: string) =>
  page
    .getByRole('button', { name: label, exact: true })
    .locator("a[role='button'][aria-pressed]")

// the row's checked state, asserted via the drawer's pressed toggles:
// during the move between lists react renders both rows for a frame, so
// per-row locators go strict-mode-ambiguous — counts are stable
test('vector layer: checkbox, Active section, pane — and back', async ({
  page,
}) => {
  await page.route('**/e2e-wfs?**', (route) => route.fulfill({
    json: { type: 'FeatureCollection', features: [{
      type: 'Feature', properties: { kind: 'test' },
      geometry: { type: 'Point', coordinates: [8.65, 47.40] },
    }, {
      type: 'Feature', properties: { kind: 'test' },
      geometry: { type: 'Point', coordinates: [8.65, 47.40] },
    }, {
      type: 'Feature', properties: { kind: 'test' },
      geometry: { type: 'LineString', coordinates: [[8.65, 47.4], [8.66, 47.41]] },
    }] },
  }))
  await openDrawer(page)
  const drawer = page.locator('.map-layers-drawer')

  await toggleOf(page, VECTOR_NAME).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, VECTOR_NAME)).toBe(true)
  await expect(page.locator(`.leaflet-${VECTOR_NAME}-pane .marker-cluster`)).toHaveText('2')
  await expect(
    page.locator(`.leaflet-${VECTOR_NAME}-pane path[stroke="#842f62"]`),
  ).toHaveCount(1)

  // the design flag reaches the server
  await expect
    .poll(
      () =>
        psql(
          `SELECT bool_or(active)::text FROM layer_presentations WHERE vector_layer_id = '${VECTOR_LAYER_ID}'`,
        ),
      { timeout: 30_000 },
    )
    .toBe('true')

  await toggleOf(page, VECTOR_NAME).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(0, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, VECTOR_NAME)).toBe(false)
  await expect(
    page.locator(`.leaflet-pane[class*="${VECTOR_NAME}-pane"]`),
  ).toHaveCount(0)
})

test('wms layer: checkbox, Active section, pane — and back', async ({
  page,
}) => {
  const retriedTiles = new Set<string>()
  const featureInfoRequests: string[] = []
  await page.route('**/e2e-wms?**', async (route) => {
    const url = route.request().url()
    if (new URL(url).searchParams.get('request') === 'GetFeatureInfo') {
      featureInfoRequests.push(url)
      return route.fulfill({ json: { type: 'FeatureCollection', features: [] } })
    }
    if (!url.toLowerCase().includes('request=getmap')) return route.continue()
    if (!retriedTiles.has(url)) {
      retriedTiles.add(url)
      return route.abort('connectionreset')
    }
    return route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"/>',
    })
  })
  await openDrawer(page)
  const drawer = page.locator('.map-layers-drawer')

  await toggleOf(page, WMS_LABEL).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, WMS_LABEL)).toBe(true)
  await expect(
    page.locator(`.leaflet-pane[class*="${WMS_LABEL}-pane"]`),
  ).toBeAttached()
  await expect(page.locator('img.leaflet-tile-loaded[src*="/e2e-wms?"]').first()).toBeVisible()

  const map = page.locator('#map .leaflet-container')
  const box = await map.boundingBox()
  if (!box) throw new Error('Map is not visible')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  const info = page.locator('.map-info-drawer')
  await expect(info).toContainText('No Data found at this location')
  expect(featureInfoRequests).toHaveLength(0)
  await info.getByTitle('Close').click()

  await expect
    .poll(
      () =>
        psql(
          `SELECT bool_or(active)::text FROM layer_presentations WHERE wms_layer_id = '${WMS_LAYER_ID}'`,
        ),
      { timeout: 30_000 },
    )
    .toBe('true')

  await toggleOf(page, WMS_LABEL).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(0, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, WMS_LABEL)).toBe(false)
  await expect(
    page.locator(`.leaflet-pane[class*="${WMS_LABEL}-pane"]`),
  ).toHaveCount(0)
})

test('upload: activating shows styled parts; clicking inspects one read-only feature', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(`/data/projects/${PROJECT_ID}?panes=map&leftMapDrawerTab=layers&c=47.37,8.54&z=17&designing=1`)
  await toggleOf(page, 'E2eUpload').click({ timeout: 60_000 })
  await expect.poll(() => listedUnderActive(page, 'E2eUpload')).toBe(true)
  const paths = page.locator('.leaflet-E2eUpload-pane path[stroke="#276351"]')
  const cluster = page.locator('.leaflet-E2eUpload-pane .marker-cluster')
  await expect(cluster).toHaveText('2', { timeout: 30_000 })
  await expect(paths).toHaveCount(0)
  const clusterLabel = /^(Punktmarker gruppieren|Cluster point markers)$/i
  const menu = page.getByRole('button', { name: clusterLabel })
  await menu.hover()
  await expect(page.getByText(clusterLabel, { exact: true })).toBeVisible()
  await menu.click()
  await page.getByRole('menuitemradio', { name: /Einzeln anzeigen|Show individually/i }).click()
  await expect(paths).toHaveCount(2)
  await page.reload()
  await expect(paths).toHaveCount(2, { timeout: 30_000 })
  await page.getByRole('button', { name: 'E2eUpload', exact: true }).click()
  const projectDefault = page.getByRole('switch', { name: /Punktmarker gruppieren|Cluster point markers/i })
  await expect(projectDefault).toBeVisible()
  const deleteLabel = /^(Delete Layer E2eUpload|Layer E2eUpload löschen)$/i
  const deleteButton = page.getByRole('button', { name: deleteLabel })
  await deleteButton.hover()
  await expect(page.getByText(deleteLabel)).toBeVisible()
  await deleteButton.click()
  await page.getByRole('menuitem', { name: /^(No|Nein)$/i }).click()
  const shared = () => psql(`SELECT cluster_markers FROM layer_presentations WHERE vector_layer_id = '${UPLOAD_ID}' AND active`)
  await projectDefault.click()
  await expect.poll(shared).toBe('f')
  await projectDefault.click()
  await expect.poll(shared).toBe('t')
  await expect(paths).toHaveCount(2)
  await page.getByRole('button', { name: 'E2eUpload', exact: true }).click()
  await menu.click()
  await page.getByRole('menuitemradio', { name: /Projektstandard|Project default/i }).click()
  await expect(cluster).toHaveText('2')
  await cluster.click()
  await expect(page.locator('.map-info-drawer')).toHaveCount(0)
  await expect(paths).toHaveCount(2, { timeout: 30_000 })
  await paths.last().click()
  const info = page.locator('.map-info-drawer')
  await expect(info).toContainText('E2eUpload (1)')
  await expect(info).toContainText('Beech')
  await expect(info).toContainText('{"height":12}')
  await expect(info.getByRole('button', { name: /Zum Formular|Navigate to form/i })).toHaveCount(0)
  await info.getByTitle('Close').click()
  await toggleOf(page, 'E2eUpload').click()
  await expect(paths).toHaveCount(0)
})

test('New in the vector layer header opens a sibling from both the form and an inline display', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  const collection = `/data/projects/${PROJECT_ID}/vector-layers`
  for (const tail of ['vector-layer', 'displays/a0b0c0d0-0000-7000-8000-00000000e2ef/vector-layer-display']) {
    await page.goto(`${collection}/${VECTOR_LAYER_ID}/${tail}?panes=data`)
    const header = page.locator('.form-header').filter({ has: page.getByRole('heading', { name: 'Vector Layer', exact: true }) })
    await header.getByRole('button', { name: 'new', exact: true }).click({ timeout: 45_000 })
    await expect.poll(() => new URL(page.url()).pathname).toMatch(
      new RegExp(`^${collection}/(?!${VECTOR_LAYER_ID}/)[0-9a-f-]{36}/vector-layer$`),
    )
    const id = new URL(page.url()).pathname.split('/').at(-2)
    await expect.poll(() => psql(`SELECT type FROM vector_layers WHERE project_id='${PROJECT_ID}' AND vector_layer_id='${id}'`), { timeout: 30_000 }).toBe('wfs')
  }
})

test('upload form: append and replace share the converted features', async ({ page }) => {
  const layerId = 'a0b0c0d0-0000-7000-8000-00000000e2ef'
  psql(`SET electric.syncing TO 'true';
    INSERT INTO vector_layers(vector_layer_id, project_id, type, name)
    VALUES ('${layerId}','${PROJECT_ID}','upload','E2eImport') ON CONFLICT DO NOTHING;
    DELETE FROM vector_layer_geoms WHERE vector_layer_id = '${layerId}';`)
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(`/data/projects/${PROJECT_ID}/vector-layers/${layerId}/vector-layer?panes=data`)
  const file = page.getByLabel('Choose GIS file')
  await expect(file).toBeVisible({timeout: 60_000})
  const submit = page.getByRole('button', { name: 'Import layer' })
  const items = () => psql(`SELECT string_agg(properties->>'species', ',' ORDER BY properties->>'species')
    FROM vector_layer_geoms WHERE vector_layer_id = '${layerId}';`)
  for (const [species, mode, expected] of [
    ['orchid','append','orchid'], ['beech','append','beech,orchid'], ['oak','replace','oak'],
  ]) {
    await file.setInputFiles({
      name: 'sites.csv', mimeType: 'text/csv',
      buffer: Buffer.from(`longitude,latitude,species\n8.54,47.37,${species}\n`),
    })
    await page.getByLabel('Existing features').selectOption(mode, { timeout: 30_000 })
    await submit.click()
    await expect(page.getByText('Features imported: 1')).toBeVisible({timeout: 30_000})
    expect(items()).toBe(expected)
  }
})

test('own table layer: checkbox, Active section, pane — and back', async ({
  page,
}) => {
  await openDrawer(page, SUBPROJECT_ID)
  await page.goto(`/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}?panes=map&leftMapDrawerTab=layers&c=46.95,7.43&z=17`)
  const drawer = page.locator('.map-layers-drawer')

  await toggleOf(page, OWN_LABEL).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, OWN_LABEL)).toBe(true)
  await expect(
    page.locator(`.leaflet-pane[class*="${OWN_NAME}-pane"]`),
  ).toBeAttached()
  const cluster = page.locator(`.leaflet-${OWN_NAME}-pane .marker-cluster`)
  await expect(cluster).toHaveText('2')
  await expect(page.locator('.clickable-hitbox')).toHaveCount(0)
  await cluster.click()
  await expect(page.locator('.clickable-hitbox')).toHaveCount(2)

  // the design flag reaches the server
  await expect
    .poll(
      () =>
        psql(
          `SELECT bool_or(active)::text FROM layer_presentations WHERE vector_layer_id = '${OWN_LAYER_ID}'`,
        ),
      { timeout: 30_000 },
    )
    .toBe('true')

  await drawer.locator("a[role='button'][aria-pressed='true']").click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(0, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, OWN_LABEL)).toBe(false)
  await expect(
    page.locator(`.leaflet-pane[class*="${OWN_NAME}-pane"]`),
  ).toHaveCount(0)
})

test('create on map: cancel creates nothing; drawing opens the new place form', async ({ page }) => {
  const places = () => psql(`SELECT place_id FROM places WHERE subproject_id = '${SUBPROJECT_ID}' ORDER BY place_id`)
  const before = places()
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await openDrawer(page, SUBPROJECT_ID)
  await toggleOf(page, OWN_LABEL).click()
  const add = page.getByLabel(`Add to ${OWN_LABEL}`, { exact: true })
  await expect(add).toBeVisible({ timeout: 30_000 })
  await page.getByRole('button', { name: 'Zoom to layer', exact: true }).hover()
  await expect(page.getByText('Zoom to layer', { exact: true })).toBeVisible()
  await add.hover()
  await expect(page.getByText(`Add to ${OWN_LABEL}`, { exact: true })).toBeVisible()
  await add.click()
  await expect(page.getByText(/Place a point on the map/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByText(/Place a point on the map/)).toBeHidden()
  expect(places()).toBe(before)

  await add.click()
  const map = page.locator('#map .leaflet-container')
  await expect(map).toHaveClass(/geoman-active/)
  const bounds = await map.boundingBox()
  if (!bounds) throw new Error('Map is not visible')
  await map.click({ position: { x: Math.floor(bounds.width * 0.6), y: Math.floor(bounds.height * 0.5) } })
  const info = page.locator('.map-info-drawer')
  await expect(info.getByRole('button', { name: 'View form' })).toHaveAttribute('aria-pressed', 'true', { timeout: 30_000 })
  await expect(page).toHaveURL(/\/places\/[^/]+\/place\?/)
  const id = new URL(page.url()).pathname.split('/').at(-2)
  await expect.poll(() => psql(`SELECT ST_NumGeometries(geometry) FROM places WHERE subproject_id = '${SUBPROJECT_ID}' AND place_id = '${id}'`), { timeout: 30_000 }).toBe('1')
  expect(places().split('\n').filter(row => !before.split('\n').includes(row))).toEqual([id])
  const name = info.locator('input[name="name"]')
  await name.fill('Map-created site')
  await name.blur()
  await expect.poll(() => psql(`SELECT name FROM places WHERE place_id = '${id}'`), { timeout: 30_000 }).toBe('Map-created site')
})

// the user's flow: a wms layer created through the drawer, activated
// immediately — racing the server's wms_layers_insert_trigger, which
// auto-creates its own (inactive) presentation for every new layer
test('wms layer added through the UI, activated immediately', async ({
  page,
}) => {
  await openDrawer(page)
  const drawer = page.locator('.map-layers-drawer')

  await page.getByRole('button', { name: 'Add WMS layer' }).click()
  // the new row appears locally at once, has no label yet (its generated
  // label is NULL) — the only text-less header carrying a toggle
  const newRowHeader = page.locator(
    `//button[.//a[@role='button']][not(normalize-space(.))]`,
  )
  await newRowHeader.waitFor({ timeout: 20_000 })

  // activate IMMEDIATELY, before the sync can deliver the server's
  // auto-created presentation
  await newRowHeader.locator("a[role='button']").click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })

  // diagnostics: capture the operations-queue badge and any notifications
  // before they expire. innerText must be bounded: the badge is gone once
  // the queue drained (a healthy sync empties it within this wait) and an
  // unbounded visibility wait would hang the test instead of hitting the
  // catch
  await page.waitForTimeout(4000)
  const badge = await page
    .getByRole('button', { name: /^[0-9]+$/ })
    .first()
    .innerText({ timeout: 1000 })
    .catch(() => 'none')
  const alerts = await page
    .locator('[role="alert"]')
    .allTextContents()
    .catch(() => [])
  test.info().annotations.push({
    type: 'diagnostics',
    description: `queue badge: ${JSON.stringify(badge)}, alerts: ${JSON.stringify(alerts)}`,
  })

  // exactly one presentation server-side, and it is active
  const idOf = () =>
    psql(
      `SELECT wms_layer_id FROM wms_layers WHERE project_id = '${PROJECT_ID}' AND label IS NULL LIMIT 1`,
    )
  await expect
    .poll(
      async () => {
        const id = idOf()
        if (!id) return 'none'
        return psql(
          `SELECT coalesce(bool_or(active)::text, 'false') FROM layer_presentations WHERE wms_layer_id = '${id}'`,
        )
      },
      { timeout: 30_000 },
    )
    .toBe('true')
})
