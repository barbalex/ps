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
const assessId = 'adae57ff-0000-4000-8000-000000000011'
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
    UPDATE projects SET subproject_name_singular = 'Art', subproject_name_singular_en = NULL
      WHERE project_id = '${projectId}';
    INSERT INTO place_levels (place_level_id, project_id, level, check_quantities, check_quantities_in_check)
      VALUES ('adae57ff-0000-4000-8000-000000000010','${projectId}',2,true,false)
      ON CONFLICT (place_level_id) DO UPDATE SET check_quantities_in_check = false;
    INSERT INTO units (unit_id, project_id, name, type)
      VALUES ('adae57ff-0000-4000-8000-00000000000f','${projectId}','Individuals','integer')
      ON CONFLICT DO NOTHING;
    UPDATE places SET geometry = ST_GeomFromText('GEOMETRYCOLLECTION(POINT(8.54 47.37))', 4326),
      name = 'Original' WHERE place_id = '${placeId}';
    INSERT INTO fields (field_id, project_id, table_name, level, name, field_label, field_type_id, widget_type_id)
      SELECT 'adae57ff-0000-4000-8000-000000000015','${projectId}','places',1,'survey_note','Survey note',
        ft.field_type_id, wt.widget_type_id FROM field_types ft, widget_types wt
        WHERE ft.name = 'text' AND wt.name = 'text' LIMIT 1 ON CONFLICT DO NOTHING;
    UPDATE places SET data = coalesce(data, '{}') || '{"survey_note":"Configured field"}'::jsonb
      WHERE place_id = '${placeId}';
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
    INSERT INTO observations (observation_id, observation_import_id, geometry)
      VALUES ('${assessId}','${obsImport}',ST_GeomFromText('GEOMETRYCOLLECTION(POINT(8.6 47.4))',4326))
      ON CONFLICT DO NOTHING;
    UPDATE observations SET not_to_assign = NULL, place_id = NULL WHERE observation_id='${assessId}';
    INSERT INTO vector_layers (vector_layer_id, project_id, type, name, own_table, own_table_level)
      VALUES ('adae57ff-0000-4000-8000-000000000012','${projectId}','own','InfoFormsToAssess','observations_to_assess',NULL)
      ON CONFLICT DO NOTHING;
    INSERT INTO layer_presentations (layer_presentation_id, vector_layer_id, project_id, active)
      VALUES ('adae57ff-0000-4000-8000-000000000013','adae57ff-0000-4000-8000-000000000012','${projectId}',true) ON CONFLICT DO NOTHING;
    INSERT INTO vector_layer_displays (vector_layer_display_id, vector_layer_id)
      VALUES ('adae57ff-0000-4000-8000-000000000014','adae57ff-0000-4000-8000-000000000012') ON CONFLICT DO NOTHING;
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

const clickMarker = async (page: Page, count: number) => {
  await closeLayerDrawerIfOpen(page)
  const markers = page.locator('.clickable-hitbox, .draggable-hitbox')
  await expect(markers).toHaveCount(count, { timeout: 60_000 })
  const marker = markers.first()
  await expect(marker).toBeVisible({ timeout: 60_000 })
  const box = (await marker.boundingBox())!
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

const inspectPlace = async (page: Page, email: string, overview = false, selectedId = placeId) => {
  await login(page, email, password)
  // These writer scenarios start in the explicitly chosen properties view.
  if (email === writer) await page.evaluate(() => localStorage.setItem('mapInfoPreferForm', 'false'))
  const path = overview ? `/data/projects/${projectId}` : `${root}/places`
  await page.goto(`${path}?panes=map&c=47.37%2C8.54&z=17`)
  await clickMarker(page, 2)
  const drawer = page.locator('.map-info-drawer')
  await expect(drawer.locator('.list-container .row')).toHaveCount(2)
  await expect(drawer.locator('[data-properties-for], .form-container')).toHaveCount(0)
  await expect(drawer.getByRole('button', { name: 'Navigate to form' })).toHaveCount(0)
  await expect(drawer.getByText('Species: Info forms', {exact: true})).toHaveCount(overview ? 2 : 0)
  if (overview) {
    const heading = drawer.getByText('Species: Info forms', {exact: true}).first().locator('..')
    await expect(heading).toHaveText(/^Species: Info forms.+/)
  }
  await drawer.locator(`[data-info-for="${selectedId}"]`).getByRole('button').click()
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
  const pencil = drawer.locator(`[data-info-for="${placeId}"]`).getByRole('button', { name: 'View form' })
  await pencil.hover()
  await expect(page.getByText('View form', { exact: true })).toBeVisible()
  await pencil.click()
  const name = drawer.locator('input[name=name]')
  await expect(name).toHaveValue('Original')
  expect(new URL(page.url()).pathname).toBe(`${root}/places/${placeId}/place`)
  expect(new URL(page.url()).searchParams.get('panes')).toBe('map')
  const files = drawer.getByRole('heading', { name: /^Files \(/ })
  const childSection = drawer.getByRole('heading', { level: 2, name: /^Sub-Populations \(/ })
  const nestedList = `${root}/places/${placeId}/places`
  await expect(childSection).toBeVisible()
  await childSection.click()
  await expect(page).toHaveURL(url => url.pathname === nestedList)
  await expect(name).toHaveValue('Original')
  await drawer.locator('.list-container').getByText(childId, {exact:true}).click()
  await expect(name).toHaveValue('Child place')
  await page.goBack()
  await expect(name).toHaveValue('Original')
  await childSection.click()
  for (const pane of ['Data', 'Tree']) {
    const toggle = page.getByRole('toolbar', { name: 'active tabs' }).getByRole('button', { name: pane, exact: true })
    await toggle.click()
    await expect(name).toHaveValue('Original')
    await expect(childSection).toHaveCount(0)
    await toggle.click()
    await expect(childSection).toBeVisible()
  }
  await files.click()
  await expect(page).toHaveURL(new RegExp(`/places/${placeId}/files\\?`))
  await expect(name).toHaveValue('Original')
  await files.click()
  await expect(page).toHaveURL(new RegExp(`/places/${placeId}/place\\?`))
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

test('Info opens editable hits directly as forms by default and remembers a table override', async ({ page }) => {
  await login(page, writer, password)
  const drawer = page.locator('.map-info-drawer')
  const pencil = drawer.locator(`[data-info-for="${placeId}"]`).getByRole('button', { name: 'View form' })
  const field = drawer.locator('input[name=name]')
  const openMap = async () => {
    await page.goto(`${root}/places?panes=map&c=47.37%2C8.54&z=17&layers=adae57ff-0000-4000-8000-000000000006`)
  }
  await openMap()
  const sawProperties = await page.evaluateHandle((id) => {
    let seen = false
    let provisionalField = false
    const observer = new MutationObserver(() => {
      if (document.querySelector(`[data-properties-for="${id}"]`)) seen = true
      if (document.querySelector('.map-info-drawer')?.textContent?.includes('This field is not defined')) provisionalField = true
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      return { seen, provisionalField }
    }
  }, placeId)
  await clickMarker(page, 1)
  await expect(field).toBeVisible()
  await expect(drawer.getByLabel('Survey note', { exact: true })).toHaveValue('Configured field')
  expect(await sawProperties.evaluate(stop => stop())).toEqual({ seen: false, provisionalField: false })
  await expect(pencil).toHaveAttribute('aria-pressed', 'true')

  await pencil.click()
  await expect(field).toHaveCount(0)
  await drawer.getByRole('button', { name: 'Close', exact: true }).click()
  await openMap()
  await clickMarker(page, 1)
  await expect(pencil).toHaveAttribute('aria-pressed', 'false')
  await expect(drawer.locator(`[data-properties-for="${placeId}"]`)).toBeVisible()
  await expect(field).toHaveCount(0)
})

test('map-only breadcrumbs open ancestor lists and records inside Info', async ({ page }) => {
  const drawer = await inspectPlace(page, writer)
  const placeName = psql(`SELECT name FROM places WHERE place_id = '${placeId}'`)
  await drawer.locator(`[data-info-for="${placeId}"]`).getByRole('button', { name: 'View form' }).click()
  await expect(drawer.locator('input[name=name]')).toHaveValue(placeName)
  const placesUrl = `${root}/places`
  const placesCrumb = drawer.locator(`a.crumb-label-link[href^="${placesUrl}?"]`)
  await placesCrumb.click()
  await expect(page).toHaveURL(url => url.pathname === placesUrl && url.searchParams.get('panes') === 'map')
  await drawer.locator('.list-container .row').first().click()
  await expect(drawer.locator('input[name=name]')).toHaveValue(placeName)
  await page.goBack()
  await expect(drawer.locator('.list-container .row').first()).toBeVisible()
  await expect(page.locator('.allotment-data')).toHaveCount(0)
  await expect(drawer.locator('.crumb-container').first()).toBeVisible()
  await expect(page.locator('.crumb-container:not(.map-info-drawer *)')).toHaveCount(0)
})

test('New from a level-two place with Files open selects a sibling under the same parent', async ({ page }) => {
  await login(page, writer, password)
  const collection = `${root}/places/${placeId}/places`
  await page.goto(`${collection}/${childId}/files?panes=data`)
  await page.locator('.allotment-data .form-header').first()
    .getByRole('button', { name: 'new', exact: true }).click({ timeout: 60_000 })
  await expect.poll(() => new URL(page.url()).pathname).toMatch(
    new RegExp(`^${collection}/(?!${childId}/)[0-9a-f-]{36}/place$`),
  )
  const id = new URL(page.url()).pathname.split('/').at(-2)
  await expect.poll(() => psql(`SELECT parent_id FROM places WHERE place_id='${id}'`), { timeout: 30_000 }).toBe(placeId)
})

test('reader can inspect and zoom but cannot change the form or geometry', async ({
  page,
}) => {
  const drawer = await inspectPlace(page, reader, true)
  for (const id of [placeId, obsId]) {
    if (id === obsId) {
      await drawer.getByRole('button', { name: 'Back', exact: true }).click()
      await drawer.locator(`[data-info-for="${obsId}"]`).getByRole('button').click()
    }
    await expect(drawer.locator(`[data-info-for="${id}"]`).getByRole('button', { name: 'Navigate to form' })).toBeEnabled()
  }
  await expect(drawer.getByRole('button', { name: 'View form' })).toHaveCount(0)
  await expect(
    drawer.getByRole('button', { name: 'Edit geometry' }),
  ).toHaveCount(0)
  await expect(drawer.locator('input[name=name]')).toHaveCount(0)
})

test('observation inspection uses the routed form for assigned and unassigned observations', async ({ page }) => {
  const drawer = await inspectPlace(page, writer, false, obsId)
  await drawer.locator(`[data-info-for="${obsId}"]`).getByRole('button', { name: 'View form' }).click()
  const comment = drawer.locator('textarea[name=comment]')
  await expect(comment).toBeVisible()
  await expect(page).toHaveURL(url => url.pathname === `${root}/places/${placeId}/observations/${obsId}`)
  await drawer.getByRole('button', { name: 'Close', exact: true }).click()
  await page.goto(`${root}?panes=map&c=47.4%2C8.6&z=17`)
  await clickMarker(page, 1)
  await expect(comment).toBeVisible()
  await expect(page).toHaveURL(url => url.pathname === `${root}/observations-to-assess/${assessId}`)
  await drawer.locator('input[name=not_to_assign]').click()
  await expect(page).toHaveURL(url => url.pathname === `${root}/observations-not-to-assign/${assessId}` && url.searchParams.get('panes') === 'map')
  await expect(comment).toBeVisible()
})

test('Info groups place hits by their navigation names even with stale marker labels', async ({ page }) => {
  await login(page, writer, password)
  await page.evaluate(({ placeId, childId, projectId }) => {
    localStorage.setItem('mapInfoAtom', JSON.stringify({
      lat: 47.37, lng: 8.54, zoom: 17,
      layers: [
        { ownId: placeId, featureLabel: 'Parent', formActive: true },
        { ownId: childId, ownParentId: placeId, featureLabel: 'Child' },
        { ownId: childId, ownParentId: placeId, featureLabel: 'Child' },
      ].map(hit => ({ ...hit, projectId, ownTable: 'place', label: 'Places', properties: [] })),
    }))
  }, { placeId, childId, projectId })
  await page.goto(`${root}/places?panes=map`)
  const drawer = page.locator('.map-info-drawer')
  await expect(drawer.getByText('Populations (1)', { exact: true })).toBeVisible()
  await expect(drawer.getByText('Sub-Populations (1)', { exact: true })).toBeVisible()
  await expect(drawer.getByText('Places (2)', { exact: true })).toHaveCount(0)
  await expect(drawer.locator('.list-container .row')).toHaveCount(2)
  await expect(drawer.locator('[data-properties-for], .form-container')).toHaveCount(0)
  await drawer.getByRole('button', { name: 'Child', exact: true }).click()
  await expect(drawer.locator('input[name=name]')).toHaveValue('Child place')
  await expect(page).toHaveURL(url => url.pathname === `${root}/places/${placeId}/places/${childId}/place` && url.searchParams.get('panes') === 'map')
  await drawer.getByRole('button', { name: 'Back', exact: true }).click()
  await drawer.getByRole('button', { name: 'Parent', exact: true }).press('Enter')
  await expect(page).toHaveURL(url => url.pathname === `${root}/places/${placeId}/place`)
  await expect(drawer.locator('input[name=name]')).toHaveValue(psql(`SELECT name FROM places WHERE place_id = '${placeId}'`))
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
  await drawer.getByRole('heading', { name: /^Quantities \(/ }).click()
  await drawer.getByTitle('Add quantity').click()
  await expect(page).toHaveURL(new RegExp(`/checks/${checkId}/quantities/[^/?]+`))
  await drawer.getByText('Individuals', { exact: true }).click()
  const quantity = drawer.locator('input[name="quantity_integer"]')
  await quantity.fill('23')
  await quantity.blur()
  const quantityId = new URL(page.url()).pathname.split('/').filter(Boolean).at(-1)
  await expect.poll(() => psql(`SELECT quantity_integer FROM check_quantities
    WHERE check_quantity_id = '${quantityId}' AND check_id = '${checkId}'`), {
    timeout: 30_000,
  }).toBe('23')
  expect(new URL(page.url()).searchParams.get('panes')).toBe('map')
})
