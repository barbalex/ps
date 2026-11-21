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

// no spaces: the layer name becomes part of the leaflet pane class
const VECTOR_NAME = 'E2eVec'
const WMS_LABEL = 'E2eWms'

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
  `)
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'own',
  })
})

test.beforeEach(() => {
  // reset leftovers of a failed previous run so the pressed-toggle
  // counts below stay unambiguous
  psql(`UPDATE layer_presentations SET active = FALSE WHERE project_id = '${PROJECT_ID}'`)
})

const openDrawer = async (page: Page) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)
  await page.goto(`/data/projects/${PROJECT_ID}?panes=map&leftMapDrawerTab=layers`)
  await page.waitForSelector('.map-layers-drawer', { timeout: 60_000 })
  // wait for the initial sync to list the seeded layers
  await expect(
    page.getByRole('button', { name: VECTOR_NAME, exact: true }),
  ).toBeVisible({ timeout: 60_000 })
  await expect(
    page.getByRole('button', { name: WMS_LABEL, exact: true }),
  ).toBeVisible({ timeout: 60_000 })
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
  await expect(listedUnderActive(page, VECTOR_NAME)).resolves.toBe(true)
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
          `SELECT active FROM layer_presentations WHERE vector_layer_id = '${VECTOR_LAYER_ID}'`,
        ),
      { timeout: 30_000 },
    )
    .toBe('t')

  await toggleOf(page, VECTOR_NAME).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(0, { timeout: 20_000 })
  await expect(listedUnderActive(page, VECTOR_NAME)).resolves.toBe(false)
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
  await expect(listedUnderActive(page, WMS_LABEL)).resolves.toBe(true)
  await expect(
    page.locator(`.leaflet-pane[class*="${WMS_LABEL}-pane"]`),
  ).toBeAttached()

  await expect
    .poll(
      () =>
        psql(
          `SELECT active FROM layer_presentations WHERE wms_layer_id = '${WMS_LAYER_ID}'`,
        ),
      { timeout: 30_000 },
    )
    .toBe('t')

  await toggleOf(page, WMS_LABEL).click()
  await expect(
    drawer.locator("a[role='button'][aria-pressed='true']"),
  ).toHaveCount(0, { timeout: 20_000 })
  await expect(listedUnderActive(page, WMS_LABEL)).resolves.toBe(false)
  await expect(
    page.locator(`.leaflet-pane[class*="${WMS_LABEL}-pane"]`),
  ).toHaveCount(0)
})
