import { expect, test, type Page } from '@playwright/test'
import {
  closeLayerDrawerIfOpen,
  ensureProjectFixture,
  ensureUser,
  grantRoles,
  login,
  psql,
} from './helpers.ts'

const projectId = 'adae57ff-0000-4000-8000-000000000001'
const subprojectId = 'adae57ff-0000-4000-8000-000000000002'
const placeId = 'adae57ff-0000-4000-8000-000000000003'
const childId = 'adae57ff-0000-4000-8000-000000000008'
const checkId = 'adae57ff-0000-4000-8000-000000000009'
const layerId = 'adae57ff-0000-4000-8000-000000000004'
const obsLayer = 'adae57ff-0000-4000-8000-00000000000a'
const obsId = 'adae57ff-0000-4000-8000-00000000000b'
const obsImport = 'adae57ff-0000-4000-8000-00000000000c'
const writer = 'map-info-form-writer@test.ch'
const reader = 'map-info-form-reader@test.ch'
const password = 'e2e-test-password-123'
const root = `/data/projects/${projectId}/subprojects/${subprojectId}`

test.beforeAll(async () => {
  await ensureProjectFixture({
    projectId,
    subprojectId,
    placeId,
    projectName: 'Map info forms',
    subprojectName: 'Info forms',
    placeName: 'Original',
    placeLevelId: 'adae57ff-0000-4000-8000-000000000005',
  })
  psql(`
    SET electric.syncing TO 'true';
    UPDATE places SET geometry = ST_GeomFromText('GEOMETRYCOLLECTION(POINT(8.54 47.37))', 4326),
      name = 'Original' WHERE place_id = '${placeId}';
    INSERT INTO places (place_id, subproject_id, parent_id, level, name)
      VALUES ('${childId}','${subprojectId}','${placeId}',2,'Child place') ON CONFLICT DO NOTHING;
    INSERT INTO checks (check_id, place_id) VALUES ('${checkId}','${childId}') ON CONFLICT DO NOTHING;
    UPDATE checks SET relevant_for_reports = true WHERE check_id = '${checkId}';
    INSERT INTO vector_layers (vector_layer_id, project_id, type, name, own_table, own_table_level)
      VALUES ('${layerId}','${projectId}','own','InfoFormsPlaces','places',1) ON CONFLICT DO NOTHING;
    INSERT INTO layer_presentations (layer_presentation_id, vector_layer_id, project_id, active)
      VALUES ('adae57ff-0000-4000-8000-000000000006','${layerId}','${projectId}',true) ON CONFLICT DO NOTHING;
    INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id)
      VALUES ('adae57ff-0000-4000-8000-000000000007','${layerId}') ON CONFLICT DO NOTHING;
    INSERT INTO observation_imports (observation_import_id, subproject_id, name)
      VALUES ('${obsImport}','${subprojectId}','Info forms') ON CONFLICT DO NOTHING;
    INSERT INTO observations (observation_id, observation_import_id, place_id, geometry)
      SELECT '${obsId}','${obsImport}',place_id,geometry FROM places WHERE place_id='${placeId}'
      ON CONFLICT DO NOTHING;
    INSERT INTO vector_layers (vector_layer_id, project_id, type, name, own_table, own_table_level)
      VALUES ('${obsLayer}','${projectId}','own','InfoFormsObservations','observations_assigned',1) ON CONFLICT DO NOTHING;
    INSERT INTO layer_presentations (layer_presentation_id, vector_layer_id, project_id, active)
      VALUES ('adae57ff-0000-4000-8000-00000000000d','${obsLayer}','${projectId}',true) ON CONFLICT DO NOTHING;
    INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id)
      VALUES ('adae57ff-0000-4000-8000-00000000000e','${obsLayer}') ON CONFLICT DO NOTHING;
  `)
  for (const [email, role] of [
    [writer, 'write-all'],
    [reader, 'read-all'],
  ]) {
    const userId = await ensureUser({ email, password, name: email })
    await grantRoles({
      email,
      userId,
      projectId,
      role,
      subprojectIds: [subprojectId],
      placeIds: [placeId, childId],
    })
  }
})

const inspectPlace = async (page: Page, email: string) => {
  await login(page, email, password)
  await page.goto(`${root}/places?panes=map&c=47.37%2C8.54&z=17`)
  await closeLayerDrawerIfOpen(page)
  const markers = page.locator('.clickable-hitbox, .draggable-hitbox')
  await expect(markers).toHaveCount(2, { timeout: 60_000 })
  const marker = markers.first()
  await expect(marker).toBeVisible({ timeout: 60_000 })
  const box = (await marker.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  const drawer = page.locator('.map-info-drawer')
  await expect(drawer).toContainText(placeId)
  // The overlapping observation has a place_id but is not a place hit.
  await expect(drawer).toContainText(obsId)
  await expect(drawer.getByTitle('Navigate to form')).toHaveCount(1)
  return drawer
}

test('opening the app repairs a stamped browser database missing map permission helpers', async ({ page, context }) => {
  await login(page, writer, password)
  await page.goto(`${root}?panes=data`)
  await expect.poll(() => page.evaluate(async () => {
    const db = window.__pglite_db__
    if (!db || !(await db.query<{ ready: boolean }>(
      `SELECT to_regprocedure('public.user_can_write_place(uuid,uuid)') IS NOT NULL AS ready`,
    )).rows[0].ready) return false
    return (await db.query(`SELECT value FROM _ps_local_meta WHERE key = 'sql_init_sources_hash'`)).rows.length === 1
  }), { timeout: 60_000 }).toBe(true)
  await page.evaluate(async () => {
    const db = window.__pglite_db__!
    await db.exec(`
      DROP FUNCTION user_can_write_place(uuid,uuid), user_can_write_subproject(uuid,uuid);
      INSERT INTO _ps_local_meta VALUES ('local_data_probe', 'retained');
    `)
    await db.syncToFs()
  })
  const reopened = await context.newPage()
  await reopened.goto(page.url())
  await expect.poll(() => reopened.evaluate(async () => {
    const db = window.__pglite_db__
    if (!db) return []
    return (await db.query(`
      SELECT (SELECT value FROM _ps_local_meta WHERE key = 'local_data_probe') AS value,
        to_regprocedure('public.user_can_write_subproject(uuid,uuid)') IS NOT NULL AS subproject,
        to_regprocedure('public.user_can_write_place(uuid,uuid)') IS NOT NULL AS place
    `)).rows
  }), { timeout: 60_000 }).toEqual([{ value: 'retained', subproject: true, place: true }])
})

test('pencil edits the selected place in Info without opening the data pane', async ({
  page,
}) => {
  const drawer = await inspectPlace(page, writer)
  const pencil = drawer.getByTitle('View form')
  await pencil.click()
  const name = drawer.locator('input[name=name]')
  await expect(name).toHaveValue('Original')
  expect(new URL(page.url()).pathname).toBe(`${root}/places/${placeId}/place`)
  expect(new URL(page.url()).searchParams.get('panes')).toBe('map')
  await name.fill('Changed in Info')
  await name.press('Tab')
  await pencil.click()
  await expect(name).toHaveCount(0)
  await expect(drawer).toContainText(placeId)
  await expect
    .poll(() => psql(`SELECT name FROM places WHERE place_id = '${placeId}'`), {
      timeout: 30_000,
    })
    .toBe('Changed in Info')

  await drawer.getByRole('button', { name: 'Edit geometry' }).click()
  await page
    .getByRole('menuitemcheckbox', { name: 'Edit', exact: true })
    .click()
  await expect(page.locator('.leaflet-geoman-toolbar').first()).toBeVisible()
  expect(new URL(page.url()).searchParams.get('panes')).toBe('map')
})

test('reader can inspect and zoom but cannot change the form or geometry', async ({
  page,
}) => {
  const drawer = await inspectPlace(page, reader)
  await expect(drawer.getByTitle('Navigate to form')).toBeEnabled()
  await expect(drawer.getByTitle('View form')).toHaveCount(0)
  await expect(
    drawer.getByRole('button', { name: 'Edit geometry' }),
  ).toHaveCount(0)
  await expect(drawer.locator('input[name=name]')).toHaveCount(0)
})

test('a requested nested check form at latitude zero edits the check, not the current route', async ({
  page,
}) => {
  await login(page, writer, password)
  // The drawing workflow hands Info this single hit while the previously
  // selected place is still current. Seed its persisted state at that boundary.
  await page.evaluate(
    ({ projectId, childId, checkId }) => {
      localStorage.setItem(
        'mapInfoAtom',
        JSON.stringify({
          lat: 0,
          lng: 8.54,
          zoom: 17,
          layers: [
            {
              projectId,
              ownTable: 'check',
              ownPlaceId: childId,
              ownId: checkId,
              label: 'New check',
              properties: [],
              formActive: true,
            },
          ],
        }),
      )
    },
    { projectId, childId, checkId },
  )
  await page.goto(`${root}/places/${placeId}/place?panes=map`)
  const drawer = page.locator('.map-info-drawer')
  const field = drawer.getByRole('switch')
  await expect(field).toBeChecked({ timeout: 60_000 })
  expect(new URL(page.url()).pathname).toBe(
    `${root}/places/${placeId}/places/${childId}/checks/${checkId}/check`,
  )
  expect(new URL(page.url()).searchParams.get('panes')).toBe('map')
  await field.click()
  await expect
    .poll(
      () =>
        psql(
          `SELECT relevant_for_reports FROM checks WHERE check_id='${checkId}'`,
        ),
      { timeout: 30_000 },
    )
    .toBe('f')
})
