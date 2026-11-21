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
const PLACE_LEVEL_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e5'
const OWN_LAYER_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e6'
const SUBPROJECT_ID = 'a0b0c0d0-0000-7000-8000-00000000e2e8'

// no spaces: the layer name becomes part of the leaflet pane class
const VECTOR_NAME = 'E2eVec'
const WMS_LABEL = 'E2eWms'
// own table layer: the label comes from the place level's name_plural
const OWN_LABEL = 'E2eOwns'
const OWN_NAME = 'E2eOwnLayer'

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

    INSERT INTO wms_services (wms_service_id, project_id, url)
    VALUES ('${WMS_SERVICE_ID}', '${PROJECT_ID}', 'https://example.com/e2e-wms')
    ON CONFLICT DO NOTHING;

    INSERT INTO wms_layers (wms_layer_id, project_id, wms_service_id, wms_service_layer_name, label)
    VALUES ('${WMS_LAYER_ID}', '${PROJECT_ID}', '${WMS_SERVICE_ID}', 'e2e.layer', '${WMS_LABEL}')
    ON CONFLICT DO NOTHING;

    INSERT INTO vector_layers (vector_layer_id, project_id, type, name)
    VALUES ('${VECTOR_LAYER_ID}', '${PROJECT_ID}', 'wfs', '${VECTOR_NAME}')
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
  `)
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'own',
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
  `)
})

// the Own section only renders with a subproject in the url
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
  await openDrawer(page)
  const drawer = page.locator('.map-layers-drawer')

  await toggleOf(page, VECTOR_NAME).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, VECTOR_NAME)).toBe(true)
  // an empty vector layer renders a zero-size pane: it exists, but is
  // never "visible" in the bounding-box sense
  await expect(
    page.locator(`.leaflet-pane[class*="${VECTOR_NAME}-pane"]`),
  ).toBeAttached()

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

test('own table layer: checkbox, Active section, pane — and back', async ({
  page,
}) => {
  await openDrawer(page, SUBPROJECT_ID)
  const drawer = page.locator('.map-layers-drawer')

  await toggleOf(page, OWN_LABEL).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(1, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, OWN_LABEL)).toBe(true)
  await expect(
    page.locator(`.leaflet-pane[class*="${OWN_NAME}-pane"]`),
  ).toBeAttached()

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

  await toggleOf(page, OWN_LABEL).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(0, { timeout: 20_000 })
  await expect.poll(() => listedUnderActive(page, OWN_LABEL)).toBe(false)
  await expect(
    page.locator(`.leaflet-pane[class*="${OWN_NAME}-pane"]`),
  ).toHaveCount(0)
})
