import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  ensureProjectFixture,
  ensureUser,
  grantRoles,
  login,
  psql,
} from './helpers.ts'

/**
 * Real columns (places.name, …) can be moved like jsonb keys — in a form
 * design and in the auto-generated form. In a design, the designer's drawer
 * lists them next to the fields, a placed column renders inside the design
 * and writes its column, and its fixed widget outside the design steps aside;
 * columns that do not apply to a user (the designers-only level) render
 * nowhere for that user. In the auto-generated form, designers sort the
 * columns among the fields; the saved order is everyone's form. And a record
 * with a custom form never shows the auto-generated form first.
 */

const uuid = (n: number) =>
  `d3c50000-0000-4000-8000-${String(n).padStart(12, '0')}`
const projectId = uuid(1),
  subprojectId = uuid(2),
  placeId = uuid(3),
  notesFieldId = uuid(5),
  secondPlaceId = uuid(11)
const email = 'form-columns@test.ch',
  password = 'e2e-test-password-123',
  writerEmail = 'form-columns-writer@test.ch'

const placesUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places`
const placeUrl = `${placesUrl}/${placeId}/place`

const drawerItem = (page: Page, type: string) =>
  page.locator(`[data-testid="drawer-item:${type}"]`)

/**
 * Drag a drawer item onto a point of the preview. Puck's drag and drop
 * (dnd-kit) starts from pointer movement, not from a native HTML5 drag —
 * so move in small steps instead of one hop.
 */
async function dragTo(
  page: Page,
  source: Locator,
  target: { x: number; y: number },
) {
  // the drawer scrolls: an item clipped out of view would be missed. It also
  // re-renders after a drop, swapping its items — retry while that settles
  await page.waitForTimeout(500)
  for (let attempt = 0; ; attempt++) {
    try {
      await source.scrollIntoViewIfNeeded({ timeout: 5_000 })
      break
    } catch (error) {
      if (attempt >= 4) throw error
      await page.waitForTimeout(500)
    }
  }
  const box = await source.boundingBox()
  if (!box) throw new Error('drag source has no bounding box')
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let step = 1; step <= 12; step++) {
    await page.mouse.move(
      from.x + ((target.x - from.x) * step) / 12,
      from.y + ((target.y - from.y) * step) / 12,
    )
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(300)
  await page.mouse.up()
}

/** the point at the bottom of the root dropzone — a drop there appends */
async function endOfRootZone(page: Page) {
  const box = await page.getByTestId('dropzone:root:default-zone').boundingBox()
  if (!box) throw new Error('root dropzone has no bounding box')
  return { x: box.x + box.width / 2, y: box.y + box.height - 8 }
}

/**
 * Drag a sortable item of the auto-generated form onto another one, by its
 * drag handle. The list uses native HTML5 drag and drop, which one hop of the
 * mouse does not reliably start — move in small steps instead. `yFraction`
 * is where on the target item to release: > 0.5 below its middle, < 0.5 above.
 */
async function dragItemOnto(
  page: Page,
  sourceItem: string,
  targetItem: string,
  yFraction: number,
) {
  const source = page.locator(
    `[data-sortable-item="${sourceItem}"] [title="drag to reorder"]`,
  )
  const target = page.locator(`[data-sortable-item="${targetItem}"]`)
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (!sourceBox || !targetBox) throw new Error('sortable item not found')
  const from = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  }
  const to = {
    x: targetBox.x + targetBox.width / 2,
    y: targetBox.y + targetBox.height * yFraction,
  }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let step = 1; step <= 12; step++) {
    await page.mouse.move(
      from.x + ((to.x - from.x) * step) / 12,
      from.y + ((to.y - from.y) * step) / 12,
    )
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(150)
  await page.mouse.up()
}

/** the items of the auto-generated form in their order, by name */
const sortableOrder = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-sortable-item]')).map((item) =>
      item.getAttribute('data-sortable-item'),
    ),
  )

/** the first row of a query against the local database, as the form sees it */
const localRow = <T extends Record<string, unknown>>(
  page: Page,
  sql: string,
  id: string,
) =>
  page.evaluate(
    async ([query, value]) => {
      const result = await window.__pglite_db__!.query(query, [value])
      return result.rows[0] as T | undefined
    },
    [sql, id] as const,
  )

/** true when `first` precedes `second` in the rendered form */
const precedes = (page: Page, first: string, second: string) =>
  page.evaluate(
    ([a, b]) => {
      const first = document.querySelector(a)
      const second = document.querySelector(b)
      if (!first || !second) return false
      return Boolean(
        first.compareDocumentPosition(second) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
    },
    [first, second] as const,
  )

test('real columns are draggable in the form design and move out of their fixed position', async ({
  page,
  browser,
}) => {
  const placeColumns = () =>
    localRow<{ name: string; relevant_for_reports: boolean | null }>(
      page,
      'select name, relevant_for_reports from places where place_id = $1',
      placeId,
    )

  await ensureProjectFixture({
    projectId,
    subprojectId,
    placeId,
    placeLevelId: uuid(4),
    projectName: 'Form columns',
    subprojectName: 'Columns',
    placeName: 'Column record',
  })
  psql(`
    SET electric.syncing TO 'true';
    INSERT INTO fields (field_id, project_id, table_name, level, name, field_label, field_type_id, widget_type_id)
    SELECT '${notesFieldId}', '${projectId}', 'places', 1, 'notes', 'Notes', ft.field_type_id, wt.widget_type_id
    FROM field_types ft, widget_types wt WHERE ft.name='text' AND wt.name='textarea'
    ON CONFLICT DO NOTHING;
    DELETE FROM form_designs WHERE project_id = '${projectId}';
    DELETE FROM field_sorts WHERE project_id = '${projectId}';
    UPDATE places SET name = 'Column record', relevant_for_reports = null
      WHERE place_id = '${placeId}';
  `)
  const designerId = await ensureUser({
    email,
    password,
    name: 'Form columns designer',
  })
  await grantRoles({
    email,
    userId: designerId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
    placeIds: [placeId],
  })
  const writerId = await ensureUser({
    email: writerEmail,
    password,
    name: 'Form columns writer',
  })
  await grantRoles({
    email: writerEmail,
    userId: writerId,
    projectId,
    role: 'write-all',
    subprojectIds: [subprojectId],
    placeIds: [placeId],
  })
  await login(page, email, password)
  await page.goto(`${placeUrl}?panes=form&designing=1`)
  await page.locator('textarea[name="notes"]').waitFor({ timeout: 120_000 })
  // a previous run's design and sort must be gone locally before this one starts
  await expect
    .poll(
      () =>
        page.evaluate(
          async (id) =>
            (
              await window.__pglite_db__!.query(
                `select (select count(*)::int from form_designs where project_id = $1)
                  + (select count(*)::int from field_sorts where project_id = $1) as count`,
                [id],
              )
            ).rows[0].count,
          projectId,
        ),
      { timeout: 60_000 },
    )
    .toBe(0)

  // the auto-generated form shows every column once, at its fixed position
  const name = page.locator('input[name="name"]')
  const since = page.locator('input[name="since"]')
  const reports = page.locator('[role="switch"][name="relevant_for_reports"]')
  for (const field of [name, since, reports]) {
    await expect(field).toHaveCount(1)
    await expect(field).toBeVisible()
  }
  expect(
    await precedes(page, 'input[name="name"]', 'input[name="since"]'),
  ).toBe(true)

  await page
    .getByRole('button', { name: /Design form|Formular gestalten/i })
    .click()
  await page.waitForURL(/formDesign=/, { timeout: 30_000 })
  await drawerItem(page, 'column_name').waitFor({ timeout: 30_000 })

  // the drawer lists the real columns next to the jsonb key, columns first
  await drawerItem(page, 'column_name').scrollIntoViewIfNeeded()
  const drawerTypes = [
    'column_level',
    'column_name',
    'column_since',
    'column_until',
    'column_relevant_for_reports',
    `field_${notesFieldId}`,
  ]
  const positions = await Promise.all(
    drawerTypes.map(async (type) => {
      const box = await drawerItem(page, type).boundingBox()
      if (!box) throw new Error(`drawer item ${type} has no bounding box`)
      return box.y
    }),
  )
  expect(positions).toEqual([...positions].sort((a, b) => a - b))

  // the preview shows the row's values but writes nothing
  await dragTo(page, drawerItem(page, 'column_name'), await endOfRootZone(page))
  const previewName = page.locator('[data-puck-preview] input[name="name"]')
  await expect(previewName).toHaveValue('Column record')
  await previewName.fill('Typed in the preview')
  await previewName.blur()
  await page.waitForTimeout(1500)
  expect((await placeColumns()).name).toBe('Column record')

  // the order of the design: reports switch, then name, then the level
  await dragTo(
    page,
    drawerItem(page, 'column_relevant_for_reports'),
    await endOfRootZone(page),
  )
  await dragTo(
    page,
    drawerItem(page, 'column_level'),
    await endOfRootZone(page),
  )
  await expect(
    page.locator(
      '[data-puck-preview] [role="switch"][name="relevant_for_reports"]',
    ),
  ).toHaveCount(1)
  await expect(
    page.locator('[data-puck-preview] input[name="level"]'),
  ).toHaveCount(2)

  // the hints tell unplaced columns and unplaced fields apart
  await expect(
    page.getByText(/invisible to users|für Benutzer unsichtbar/),
  ).toContainText('Notes')
  await expect(
    page.getByText(
      /stay at their fixed position|bleiben an ihrem festen Platz/,
    ),
  ).toContainText(/Since which year|Seit welchem Jahr/)

  await page.getByRole('button', { name: /^(Done|Fertig)$/ }).click()
  await page.waitForURL(/place\?/, { timeout: 30_000 })

  // the design is saved with the columns as components
  await expect
    .poll(
      () =>
        psql(
          `SELECT design::text FROM form_designs WHERE project_id = '${projectId}' AND table_name = 'places'`,
        ),
      { timeout: 60_000 },
    )
    .toMatch(/column_name/)

  // the designed form is off until it is switched on (the toggle is named
  // by its tooltip)
  await page
    .getByRole('button', {
      name: /Switch between the auto-generated and the custom form|Zwischen automatisch generiertem und eigenem Formular/,
    })
    .click({ timeout: 30_000 })

  // the placed columns left their fixed position and render in the designed
  // order instead (the order of the drops: name, reports, level); the
  // unplaced ones stay put. In the fixed layout the level comes first and
  // the switch last — the switch preceding the level proves both moved
  const reportsInForm = '[role="switch"][name="relevant_for_reports"]'
  await expect
    .poll(() => precedes(page, reportsInForm, 'input[name="level"]'))
    .toBe(true)
  await expect(page.locator('input[name="name"]')).toHaveCount(1)
  await expect(since).toHaveCount(1)
  await expect(page.locator('input[name="until"]')).toHaveCount(1)
  await expect(page.locator('input[name="level"]')).toHaveCount(2)
  expect(await precedes(page, 'input[name="since"]', reportsInForm)).toBe(true)
  expect(await precedes(page, 'input[name="name"]', reportsInForm)).toBe(true)

  // the designed widgets write their columns
  await page.locator('input[name="name"]').fill('Renamed in the design')
  await page.locator('input[name="name"]').blur()
  await expect
    .poll(() => placeColumns())
    .toMatchObject({
      name: 'Renamed in the design',
    })
  await page.locator('[role="switch"][name="relevant_for_reports"]').click()
  await expect
    .poll(() => placeColumns())
    .toMatchObject({
      relevant_for_reports: true,
    })

  // the print view shows the same design read-only
  await page
    .getByRole('button', { name: /Print form|Formular drucken/i })
    .click()
  await expect(page.locator('input[name="name"]')).toHaveCount(1)
  await expect(page.locator('input[name="name"]')).toBeVisible()
  await expect(since).toBeVisible()

  // a writer gets the designed form too — minus the designers-only level
  const writer = await browser.newPage({
    baseURL: test.info().project.use.baseURL,
    ignoreHTTPSErrors: true,
  })
  await login(writer, writerEmail, password)
  await writer.goto(`${placeUrl}?panes=form`)
  await expect(writer.locator('input[name="name"]')).toHaveCount(1, {
    timeout: 120_000,
  })
  await expect(writer.locator('input[name="since"]')).toHaveCount(1)
  await expect(writer.locator('input[name="level"]')).toHaveCount(0)
  await expect(
    writer.locator('[role="switch"][name="relevant_for_reports"]'),
  ).toHaveCount(1)
  await writer.close()
})

test('the columns of the subproject, action and check forms sit in a seeded design too', async ({
  page,
}) => {
  const actionId = uuid(6),
    checkId = uuid(7)
  const placeBaseUrl = `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}`
  // each design reverses the fixed order of its form's columns: the second
  // column preceding the first proves the columns render in the design
  const reports = '[role="switch"][name="relevant_for_reports"]'
  const targets = [
    {
      table: 'subprojects',
      url: `/data/projects/${projectId}/subprojects/${subprojectId}/subproject`,
      design: ['column_start_year', 'column_name'],
      first: 'input[name="name"]',
      second: 'input[name="start_year"]',
      write: async () => {
        await page.locator('input[name="start_year"]').fill('2020')
        await page.locator('input[name="start_year"]').blur()
        await expect
          .poll(() =>
            localRow<{ start_year: number | null }>(
              page,
              'select start_year from subprojects where subproject_id = $1',
              subprojectId,
            ),
          )
          .toMatchObject({ start_year: 2020 })
      },
    },
    {
      table: 'actions',
      url: `${placeBaseUrl}/actions/${actionId}`,
      design: ['column_relevant_for_reports', 'column_date'],
      first: 'input[name="date"]',
      second: reports,
      write: async () => {
        await page.locator(reports).click()
        await expect
          .poll(() =>
            localRow<{ relevant_for_reports: boolean | null }>(
              page,
              'select relevant_for_reports from actions where action_id = $1',
              actionId,
            ),
          )
          .toMatchObject({ relevant_for_reports: true })
      },
    },
    {
      table: 'checks',
      url: `${placeBaseUrl}/checks/${checkId}`,
      design: ['column_relevant_for_reports', 'column_date'],
      first: 'input[name="date"]',
      second: reports,
      write: async () => {
        await page.locator(reports).click()
        await expect
          .poll(() =>
            localRow<{ relevant_for_reports: boolean | null }>(
              page,
              'select relevant_for_reports from checks where check_id = $1',
              checkId,
            ),
          )
          .toMatchObject({ relevant_for_reports: true })
      },
    },
  ]

  await ensureProjectFixture({
    projectId,
    subprojectId,
    placeId,
    placeLevelId: uuid(4),
    projectName: 'Form columns',
    subprojectName: 'Columns',
    placeName: 'Column record',
  })
  const designerId = await ensureUser({
    email,
    password,
    name: 'Form columns designer',
  })
  await grantRoles({
    email,
    userId: designerId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
    placeIds: [placeId],
  })
  const designJson = (types: string[]) =>
    JSON.stringify({
      content: types.map((type, index) => ({
        type,
        props: { id: `${type}-${index}` },
      })),
    })
  psql(`
    SET electric.syncing TO 'true';
    INSERT INTO actions (action_id, place_id) VALUES ('${actionId}', '${placeId}') ON CONFLICT DO NOTHING;
    INSERT INTO checks (check_id, place_id) VALUES ('${checkId}', '${placeId}') ON CONFLICT DO NOTHING;
    DELETE FROM form_designs WHERE project_id = '${projectId}';
    INSERT INTO form_designs (form_design_id, project_id, table_name, active, design) VALUES
      ('${uuid(8)}', '${projectId}', 'subprojects', true, '${designJson(targets[0].design)}'),
      ('${uuid(9)}', '${projectId}', 'actions', true, '${designJson(targets[1].design)}'),
      ('${uuid(10)}', '${projectId}', 'checks', true, '${designJson(targets[2].design)}');
    UPDATE subprojects SET name = 'Columns', start_year = null WHERE subproject_id = '${subprojectId}';
    UPDATE actions SET relevant_for_reports = null WHERE action_id = '${actionId}';
    UPDATE checks SET relevant_for_reports = null WHERE check_id = '${checkId}';
  `)
  await login(page, email, password)

  for (const target of targets) {
    await page.goto(`${target.url}?panes=form`)
    await expect(page.locator(target.second)).toBeVisible({ timeout: 120_000 })
    // the design row can arrive after the row it designs
    await expect
      .poll(() => precedes(page, target.second, target.first), {
        timeout: 30_000,
      })
      .toBe(true)
    await expect(page.locator(target.first)).toHaveCount(1)
    await expect(page.locator(target.second)).toHaveCount(1)
    await target.write()
  }
})

test('designers sort the real columns among the fields of the auto-generated form; the saved order is everyones form', async ({
  page,
  browser,
}) => {
  await ensureProjectFixture({
    projectId,
    subprojectId,
    placeId,
    placeLevelId: uuid(4),
    projectName: 'Form columns',
    subprojectName: 'Columns',
    placeName: 'Column record',
  })
  psql(`
    SET electric.syncing TO 'true';
    INSERT INTO fields (field_id, project_id, table_name, level, name, field_label, field_type_id, widget_type_id)
    SELECT '${notesFieldId}', '${projectId}', 'places', 1, 'notes', 'Notes', ft.field_type_id, wt.widget_type_id
    FROM field_types ft, widget_types wt WHERE ft.name='text' AND wt.name='textarea'
    ON CONFLICT DO NOTHING;
    DELETE FROM form_designs WHERE project_id = '${projectId}' AND table_name = 'places';
    DELETE FROM field_sorts WHERE project_id = '${projectId}';
    UPDATE places SET name = 'Column record' WHERE place_id = '${placeId}';
  `)
  const designerId = await ensureUser({
    email,
    password,
    name: 'Form columns designer',
  })
  await grantRoles({
    email,
    userId: designerId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
    placeIds: [placeId, secondPlaceId],
  })
  const writerId = await ensureUser({
    email: writerEmail,
    password,
    name: 'Form columns writer',
  })
  await grantRoles({
    email: writerEmail,
    userId: writerId,
    projectId,
    role: 'write-all',
    subprojectIds: [subprojectId],
    placeIds: [placeId, secondPlaceId],
  })
  await login(page, email, password)
  await page.goto(`${placeUrl}?panes=form&designing=1`)
  await page
    .locator('[data-sortable-item]')
    .first()
    .waitFor({ timeout: 120_000 })
  // a previous run's sort must be gone locally before this one starts
  await expect
    .poll(
      () =>
        page.evaluate(
          async (id) =>
            (
              await window.__pglite_db__!.query(
                'select count(*)::int as count from field_sorts where project_id = $1',
                [id],
              )
            ).rows[0].count,
          projectId,
        ),
      { timeout: 60_000 },
    )
    .toBe(0)

  const level = 'column_level',
    name = 'column_name',
    since = 'column_since',
    until = 'column_until',
    reports = 'column_relevant_for_reports',
    notes = `field_${notesFieldId}`
  const handle = '[data-sortable-item] [title="drag to reorder"]'

  // unsaved, the form is its fixed layout: the columns, the fields, the
  // column after them — every item with a drag handle
  await expect
    .poll(() => sortableOrder(page))
    .toEqual([level, name, since, until, notes, reports])
  await expect(page.locator(handle)).toHaveCount(6)

  // the name column goes below the notes field
  await dragItemOnto(page, name, notes, 0.85)
  const sorted = [level, since, until, notes, name, reports]
  await expect.poll(() => sortableOrder(page)).toEqual(sorted)

  // saved as the whole order, next to the order of the fields alone…
  const savedSort = () =>
    localRow<{ sorted_field_ids: string[]; sorted_items: string[] }>(
      page,
      `select sorted_field_ids, sorted_items from field_sorts
        where project_id = $1 and table_name = $q$places$q$`,
      projectId,
    )
  await expect.poll(savedSort).toEqual({
    sorted_field_ids: [notesFieldId],
    sorted_items: sorted,
  })
  // …and it reaches the server
  await expect
    .poll(
      () =>
        psql(
          `SELECT sorted_items::text FROM field_sorts WHERE project_id = '${projectId}' AND table_name = 'places'`,
        ),
      { timeout: 60_000 },
    )
    .toContain(notes)

  // it survives a reload
  await page.reload()
  await page
    .locator('[data-sortable-item]')
    .first()
    .waitFor({ timeout: 120_000 })
  await expect.poll(() => sortableOrder(page)).toEqual(sorted)

  // a writer gets the same form: the column among the fields, no handles,
  // and without the designers-only level
  const writer = await browser.newPage({
    baseURL: test.info().project.use.baseURL,
    ignoreHTTPSErrors: true,
  })
  await login(writer, writerEmail, password)
  await writer.goto(placeUrl)
  await expect
    .poll(
      () => precedes(writer, 'textarea[name="notes"]', 'input[name="name"]'),
      {
        timeout: 120_000,
      },
    )
    .toBe(true)
  await expect(writer.locator('input[name="name"]')).toHaveCount(1)
  await expect(writer.locator('input[name="level"]')).toHaveCount(0)
  await expect(writer.locator('[data-sortable-item]')).toHaveCount(0)
  // the listed column still writes
  await writer.locator('input[name="name"]').fill('Sorted by the designer')
  await writer.locator('input[name="name"]').blur()
  await expect
    .poll(() =>
      localRow<{ name: string }>(
        writer,
        'select name from places where place_id = $1',
        placeId,
      ),
    )
    .toMatchObject({ name: 'Sorted by the designer' })
  await writer.close()
})

test('a record with a custom form shows it right away — the auto-generated form never flashes', async ({
  page,
}) => {
  await ensureProjectFixture({
    projectId,
    subprojectId,
    placeId,
    placeLevelId: uuid(4),
    projectName: 'Form columns',
    subprojectName: 'Columns',
    placeName: 'Column record',
  })
  psql(`
    SET electric.syncing TO 'true';
    INSERT INTO places (place_id, subproject_id, level, name)
      VALUES ('${secondPlaceId}', '${subprojectId}', 1, 'Second record')
      ON CONFLICT DO NOTHING;
    DELETE FROM form_designs WHERE project_id = '${projectId}';
    INSERT INTO form_designs (form_design_id, project_id, table_name, active, design) VALUES
      ('${uuid(12)}', '${projectId}', 'places', true,
       '{"content":[{"type":"column_name","props":{"id":"a"}},{"type":"column_since","props":{"id":"b"}}]}');
  `)
  const designerId = await ensureUser({
    email,
    password,
    name: 'Form columns designer',
  })
  await grantRoles({
    email,
    userId: designerId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
    placeIds: [placeId, secondPlaceId],
  })
  await login(page, email, password)
  await page.goto(placeUrl)
  await expect(
    page.getByRole('button', { name: /Print form|Formular drucken/i }),
  ).toBeVisible({ timeout: 120_000 })

  // open the second place's node, so the tree holds the links to both forms
  await page
    .getByRole('link', { name: secondPlaceId, exact: true })
    .first()
    .click()
  const formLink = (id: string) =>
    page.locator(`a[href*="/places/${id}/place"]`).first()
  await formLink(secondPlaceId).waitFor()
  await formLink(placeId).waitFor()

  // the notes field is not placed in the design: the auto-generated form is
  // the only one that shows it. Watch for it from before the navigation on
  const notesField = 'textarea[name="notes"]'
  await expect(page.locator(notesField)).toHaveCount(0)
  await page.evaluate(
    ([selector]) => {
      const watched = window as unknown as Record<string, unknown>
      const seen: string[] = []
      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) seen.push(selector)
      })
      observer.observe(document.body, { childList: true, subtree: true })
      watched.defaultFormSeen = seen
      watched.defaultFormObserver = observer
    },
    [notesField] as const,
  )

  const defaultFormSeen = () =>
    page.evaluate(() => {
      const watched = window as unknown as Record<string, unknown>
      return watched.defaultFormSeen
    })

  for (const target of [secondPlaceId, placeId]) {
    await formLink(target).click()
    await expect(page.locator('input[name="name"]')).toBeVisible({
      timeout: 30_000,
    })
    // give a late default form time to show before judging
    await page.waitForTimeout(1000)
    expect(await defaultFormSeen()).toEqual([])
    // the custom form is the one standing
    await expect(page.locator(notesField)).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: /Print form|Formular drucken/i }),
    ).toBeVisible()
  }
  await page.evaluate(() => {
    const watched = window as unknown as Record<string, unknown>
    ;(watched.defaultFormObserver as MutationObserver).disconnect()
  })
})
