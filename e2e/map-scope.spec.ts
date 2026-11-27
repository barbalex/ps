import { randomBytes, randomUUID } from 'node:crypto'
import { expect, test as base } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

const a = 'c2100000-0000-7000-8000-000000000001'
const b = 'c2100000-0000-7000-8000-000000000002'
const first = 'c2100000-0000-7000-8000-000000000011'
const second = 'c2100000-0000-7000-8000-000000000012'
const hidden = 'c2100000-0000-7000-8000-000000000013'
const only = 'c2100000-0000-7000-8000-000000000021'
const layer = 'c2100000-0000-7000-8000-000000000030'
const places = [first, second, hidden, only].map((id) =>
  id.replace('c210', 'c211'),
)

const test = base.extend<{
  scopeUser: { email: string; userId: string; signIn: () => Promise<void> }
}>({
  scopeUser: async ({ page }, runTest) => {
    const email = `scope-${randomUUID()}@example.com`
    const password = randomBytes(32).toString('base64url')
    const userId = await ensureUser({ email, password, name: 'Scope test' })
    try {
      await runTest({
        email,
        userId,
        signIn: () => login(page, email, password),
      })
    } finally {
      psql(`BEGIN;
        SET LOCAL electric.syncing = true;
        DELETE FROM project_users WHERE auth_user_id = '${userId}' AND email = '${email}';
        DELETE FROM users WHERE user_id = '${userId}' AND email = '${email}';
        COMMIT;`)
    }
  },
})

test.beforeAll(() => {
  psql(`SET electric.syncing = true;
    INSERT INTO projects(project_id,name,subproject_name_singular_en) VALUES
      ('${a}','Scope A','Survey'),('${b}','Scope B','Survey') ON CONFLICT DO NOTHING;
    UPDATE projects SET subproject_name_plural = 'Arten', subproject_name_plural_en = 'Surveys'
      WHERE project_id IN ('${a}', '${b}');
    INSERT INTO subprojects(subproject_id,project_id,name) VALUES
      ('${first}','${a}','North'),('${second}','${a}','South'),('${hidden}','${a}','Restricted'),
      ('${only}','${b}','Only') ON CONFLICT DO NOTHING;
    INSERT INTO places(place_id,subproject_id,level,geometry) VALUES
      ${[first, second, hidden, only]
        .map(
          (id, i) => `('${places[i]}','${id}',1,
        ST_GeomFromText('GEOMETRYCOLLECTION(POINT(${8.54 + i * 0.0004} 47.37))',4326))`,
        )
        .join(',')}
      ON CONFLICT DO NOTHING;
    INSERT INTO vector_layers(vector_layer_id,project_id,type,name,own_table,own_table_level)
      VALUES ('${layer}','${a}','own','ScopePlaces','places',1) ON CONFLICT DO NOTHING;
    INSERT INTO vector_layer_displays(vector_layer_display_id, vector_layer_id)
      VALUES ('c2100000-0000-7000-8000-000000000031','${layer}') ON CONFLICT DO NOTHING;
    INSERT INTO layer_presentations(layer_presentation_id,project_id,vector_layer_id,active,cluster_markers)
      VALUES ('c2100000-0000-7000-8000-000000000032','${a}','${layer}',true,false) ON CONFLICT DO NOTHING;`)
})

test('project area filter is shared by the map, list, tree and project header', async ({
  page, scopeUser: { email, signIn, userId },
}) => {
  const action = randomUUID()
  try {
    psql(`SET electric.syncing = true;
      UPDATE projects SET geometry = ST_Multi(ST_MakeEnvelope(8.5399,47.3699,8.5401,47.3701,4326))
        WHERE project_id = '${a}';
      INSERT INTO actions(action_id,place_id,geometry) VALUES ('${action}','${places[0]}',
        ST_GeomFromText('GEOMETRYCOLLECTION(POINT(8.5402 47.37))',4326));`)
    await grantRoles({
      email, userId, projectId: a, role: 'read-specific',
      subprojectIds: [first], placeIds: [places[0]],
    })
    await grantRoles({ email, userId, projectId: b, role: 'read-all' })
    await page.setViewportSize({ width: 1920, height: 1000 })
    await signIn()
    const root = `/data/projects/${a}/subprojects/${first}/places`
    await page.goto(`${root}?panes=tree,data,map&c=47.37,8.54&z=17`)
    const drawer = page.locator('.map-layers-drawer')
    const control = drawer.getByRole('combobox', { name: 'Project area filter', exact: true })
    const rows = page.locator('.list-container .row')
    const markers = page.locator('.clickable-hitbox')
    await expect(control).toBeEnabled({ timeout: 120_000 })
    const project = drawer.getByRole('combobox', { name: 'Project', exact: true })
    const projectBounds = await project.boundingBox()
    const filterBounds = await control.boundingBox()
    expect(filterBounds?.x).toBe(projectBounds?.x)
    expect(filterBounds?.width).toBe(projectBounds?.width)
    await expect(control).toHaveValue('all')
    await expect(rows).toHaveCount(1, { timeout: 60_000 })
    await expect(markers).toHaveCount(1)
    await control.selectOption('outside')
    await expect(rows).toHaveCount(0)
    await expect(markers).toHaveCount(0)
    // Its own geometry is inside, but the tree keeps the ancestor of the outside action.
    await expect(page.locator(`a[href^="${root}/${places[0]}"]`).first()).toBeVisible()
    await expect(page.getByText('Project area filter: Outside', { exact: true })).toBeVisible()
    await control.selectOption('inside')
    await expect(rows).toHaveCount(1)
    await expect(markers).toHaveCount(1)
    await page.goto(`/data/projects/${a}/project?panes=data`)
    const header = page.getByRole('button', { name: 'Project area filter', exact:true })
    await expect(header).toHaveAttribute('aria-pressed','true', { timeout: 60_000 })
    await header.click()
    await expect(page.getByRole('menuitemradio',{name:'Inside'})).toBeChecked()
    await page.getByRole('menuitemradio',{name:'All', exact:true}).click()
    await expect(header).toHaveAttribute('aria-pressed','false')
    await page.goto('/data/projects?panes=data')
    await expect(page.getByRole('button',{name:/Import from SQL dumpfile|Import geometries|Export geometries|Export project/})).toHaveCount(0)
    await header.click()
    await expect(page.getByRole('menuitem',{name:'Scope B',exact:true})).toBeDisabled()
    await page.getByRole('menuitem',{name:'Scope A',exact:true}).click()
    await page.getByRole('menuitemradio',{name:'Outside'}).click()
    await expect(header).toHaveAttribute('aria-pressed','true')
    await page.goto(`/data/projects/${b}?panes=map`)
    await expect(control).toBeDisabled()
    await expect(control).toHaveValue('all')
    await page.goto(`/data/projects/${a}?panes=map`)
    await expect(control).toHaveValue('outside', { timeout: 60_000 })
    await control.selectOption('all')
  } finally {
    psql(`SET electric.syncing = true;
      DELETE FROM actions WHERE action_id = '${action}';
      UPDATE projects SET geometry = NULL WHERE project_id = '${a}';`)
  }
})

test('switches map routes with the viewport intact and only offers accessible choices', async ({
  page,
  scopeUser: { email, signIn, userId },
}) => {
  await grantRoles({
    email,
    userId,
    projectId: a,
    role: 'read-specific',
    subprojectIds: [first, second],
  })
  await grantRoles({
    email,
    userId,
    projectId: b,
    role: 'read-specific',
    subprojectIds: [only],
  })
  await signIn()
  await page.goto(
    `/data/projects/${a}/subprojects/${first}?panes=map&c=47,8&z=12&layers=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`,
  )
  const drawer = page.locator('.map-layers-drawer')
  const project = drawer.getByRole('combobox', { name: 'Project', exact: true })
  const survey = drawer.getByRole('combobox', { name: 'Surveys filter', exact: true })
  await expect(project).toHaveValue(a, { timeout: 120_000 })
  await expect(survey).toHaveValue('North')
  await expect(drawer.locator('label').filter({ hasText: /^(Project|Project area filter|Surveys filter)$/ })).toHaveText([
    'Project', 'Project area filter', 'Surveys filter',
  ])
  await survey.click()
  await expect(
    page.getByRole('menuitemcheckbox', { name: 'Restricted' }),
  ).toHaveCount(0)
  await survey.fill('sOu')
  await expect(page.getByRole('menuitemcheckbox', { name: 'North' })).toHaveCount(0)
  await survey.press('ArrowDown')
  await survey.press('Enter')
  await expect(survey).toHaveAttribute('placeholder', 'North, South')
  await survey.press('Escape')
  await expect(survey).toHaveValue('North, South')
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.endsWith(`/${a}`) &&
      JSON.parse(url.searchParams.get('f-subprojects')!).length === 2 &&
      url.searchParams.has('layers'),
  )
  await project.selectOption(b)
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.endsWith(`/${b}`) &&
      url.searchParams.get('panes') === 'map' &&
      url.searchParams.get('c') === '47,8' &&
      url.searchParams.get('z') === '12' &&
      !url.searchParams.has('layers'),
  )
  await expect(survey).toHaveCount(0)
  await page.goBack()
  await expect(survey).toHaveValue('North, South')
  await page.evaluate(() => localStorage.setItem('language', JSON.stringify('de')))
  await page.reload()
  await expect(drawer.getByRole('combobox', { name: 'Arten Filter', exact: true })).toHaveValue('North, South', { timeout: 60_000 })
  for (const name of ['Aktiv', 'Eigene Ebenen', 'Kachelebenen', 'Vektorebenen']) {
    await expect(drawer.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await expect(drawer.getByText('Noch keine Kachelebenen', { exact: true })).toBeVisible()
})

test('current project area uses its own display and is only drawn inside its project', async ({
    page, scopeUser: { email, signIn, userId },
  }) => {
    const projectIds = [randomUUID(), randomUUID()]
    const [current, empty] = projectIds
    try {
      psql(`SET electric.syncing = true;
        INSERT INTO projects(project_id,name,label,geometry) VALUES
        ('${current}','Internal project name','Boundary A',ST_Multi(ST_MakeEnvelope(6,46,6.1,46.1,4326))),
        ('${empty}','No boundary',NULL,NULL);
        SELECT provision_project_area_layer(project_id) FROM projects WHERE project_id IN ('${current}','${empty}');`)
      for (const projectId of projectIds) {
        await grantRoles({ email, userId, projectId, role: 'read-all' })
      }
      const vl = psql(`SELECT vector_layer_id FROM vector_layers WHERE project_id = '${current}' AND own_table = 'current_project_area'`)
      const lp = psql(`SELECT layer_presentation_id FROM layer_presentations WHERE vector_layer_id = '${vl}'`)
      psql(`SET electric.syncing = true;
        UPDATE vector_layer_displays SET color='#5831a7',fill_color='#156d87',fill_opacity_percent=50 WHERE vector_layer_id='${vl}';
        UPDATE layer_presentations SET opacity_percent=80 WHERE layer_presentation_id='${lp}'`)
      await signIn()
      await page.goto(`/data/projects/${current}?panes=map&layers=${lp}`)
      const drawer = page.locator('.map-layers-drawer')
      const label = drawer.getByText('Boundary A area', { exact: true })
      const row = drawer.locator('.fui-AccordionItem').filter({ has: page.getByText('Boundary A area', { exact: true }) })
      const toggle = row.locator('[aria-pressed]').first()
      const path = page.locator('.leaflet-current_project_area-pane path')
      const active = drawer.locator('section').filter({ has: page.getByRole('heading', { name: 'Active', exact: true }) })
      const own = drawer.locator('section').filter({ has: page.getByRole('heading', { name: 'Own', exact: true }) })
      await expect(toggle).toHaveAttribute('aria-pressed','true',{ timeout: 60_000 })
      await expect(active.getByText('Boundary A area', { exact: true })).toBeVisible()
      await expect(path).toHaveAttribute('stroke','#5831a7')
      await expect(path).toHaveAttribute('fill-opacity','0.4')
      psql(`SET electric.syncing = true;
        UPDATE layer_presentations SET opacity_percent = 30 WHERE layer_presentation_id = '${lp}'`)
      await expect(path).toHaveAttribute('fill-opacity','0.15', { timeout: 30_000 })
      const longitude = () => Number(new URL(page.url()).searchParams.get('c')?.split(',')[1])
      await expect.poll(longitude).toBeCloseTo(6.05, 2)
      await toggle.click()
      await expect(path).toHaveCount(0)
      await expect(own.getByText('Boundary A area', { exact: true })).toBeVisible()
      await toggle.click()
      await expect(path).toHaveAttribute('fill','#156d87')
      await page.evaluate(() => localStorage.setItem('language', JSON.stringify('de')))
      await page.reload()
      await expect(drawer.getByText('Projektgebiet Boundary A', { exact: true })).toBeVisible({ timeout: 60_000 })
      await expect(path).toHaveAttribute('fill','#156d87')
      for (const route of [`/data/projects/${empty}`, '/data/projects']) {
        await page.goto(`${route}?panes=map&layers=${lp}`)
        await expect(drawer.getByRole('heading', { name: 'Eigene Ebenen', exact: true })).toBeVisible({ timeout: 60_000 })
        await expect(path).toHaveCount(0)
        await expect(label).toHaveCount(0)
      }
    } finally {
      psql(`SET electric.syncing = true;
        DELETE FROM projects WHERE project_id IN (${projectIds.map(id => `'${id}'`).join(',')})`)
    }
  })

test('with one accessible project the map offers only its subprojects', async ({
  page,
  scopeUser: { email, signIn, userId },
}) => {
  await grantRoles({
    email,
    userId,
    projectId: a,
    role: 'read-specific',
    subprojectIds: [first, second],
  })
  await signIn()
  await page.goto('/data/projects?panes=map')
  const drawer = page.locator('.map-layers-drawer')
  await drawer.getByRole('combobox', { name: 'Surveys filter', exact: true }).click({ timeout: 120_000 })
  await page.getByRole('menuitemcheckbox', { name: 'North' }).click()
  await expect(
    drawer.getByRole('combobox', { name: 'Project', exact: true }),
  ).toHaveCount(0)
  await expect(page).toHaveURL((url) =>
    url.pathname.endsWith(`/${a}/subprojects/${first}`),
  )
})

test('overview renders both accessible subprojects and stays wide when opening a form', async ({
  page,
  scopeUser: { email, signIn, userId },
}) => {
  await grantRoles({
    email,
    userId,
    projectId: a,
    role: 'read-specific',
    subprojectIds: [first, second],
    placeIds: places.slice(0, 2),
  })
  await grantRoles({
    email,
    userId,
    projectId: b,
    role: 'read-specific',
    subprojectIds: [only],
    placeIds: [places[3]],
  })
  await signIn()
  await page.goto(`/data/projects/${a}?panes=map&c=47.37,8.54&z=17`)
  const survey = page.getByRole('combobox', { name: 'Surveys filter', exact: true })
  await page
    .getByRole('button', { name: 'Cluster point markers' })
    .click({ timeout: 120_000 })
  await page.getByRole('menuitemradio', { name: 'Show individually' }).click()
  const markers = page.locator('.clickable-hitbox')
  await expect(markers).toHaveCount(2, { timeout: 120_000 })
  await markers.first().click()
  const info = page.locator('.map-info-drawer')
  const hitSubproject = await info
    .getByText(/^Survey: (North|South)$/)
    .innerText()
  await page.getByRole('button', { name: 'Navigate to form' }).click()
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.includes(
        `/subprojects/${hitSubproject === 'Survey: North' ? first : second}/places/`,
      ) && url.searchParams.get('mapOverview') === a,
  )
  await expect(survey).toHaveValue('All accessible')
  await expect(markers).toHaveCount(2)
  await survey.click()
  await page.getByRole('menuitemcheckbox', { name: 'South' }).click()
  await expect(markers).toHaveCount(1)
  const all = page.getByRole('menuitemcheckbox', { name: 'All accessible' })
  if (!(await all.isVisible())) await survey.click()
  await all.click()
  await expect(markers).toHaveCount(2)
})

test('species list and map share OR selections and confirm before replacing rules', async ({
  page,
  scopeUser: { email, signIn, userId },
}) => {
  await grantRoles({
    email,
    userId,
    projectId: a,
    role: 'read-specific',
    subprojectIds: [first, second, hidden],
    placeIds: places.slice(0, 3),
  })
  await signIn()
  await page.setViewportSize({ width: 2000, height: 950 })
  const listPath = `/data/projects/${a}/subprojects`
  await page.goto(`${listPath}/filter?panes=data,map`)
  const picker = page.locator(
    '.form-container.filter select[name=subproject_id]',
  )
  await picker.selectOption(first, { timeout: 120_000 })
  await page.getByRole('tab', { name: '+', exact: true }).click()
  await picker.selectOption(second)
  const summary = page.locator('.map-layers-drawer').getByRole('combobox', { name: 'Surveys filter', exact: true })
  await expect(summary).toHaveValue('North, South')
  await page.goto(`${listPath}${new URL(page.url()).search}`)
  const rows = page.locator('.list-container')
  await expect(rows.getByText('North', { exact: true })).toBeVisible()
  await expect(rows.getByText('South', { exact: true })).toBeVisible()
  await expect(rows.getByText('Restricted', { exact: true })).toHaveCount(0)
  await page.goto(`${listPath}/filter?panes=data,map`)
  const name = page.locator('.form-container.filter input[name=name]')
  await expect(summary).toHaveValue('All accessible')
  await name.pressSequentially('th')
  await expect(page).toHaveURL(
    (url) =>
      url.searchParams.get('f-subprojects') ===
      JSON.stringify([{ name: 'th' }]),
  )
  await expect(summary).toHaveValue('North, South')
  await summary.click()
  const south = page.getByRole('menuitemcheckbox', { name: 'South' })
  page.once('dialog', (d) => d.dismiss())
  await south.click()
  await expect(south).toBeChecked()
  await expect(summary).toHaveAttribute('placeholder', 'North, South')
  page.once('dialog', (d) => d.accept())
  await south.click()
  await expect(summary).toHaveAttribute('placeholder', 'North')
  await expect(page).toHaveURL(
    (url) =>
      JSON.stringify(JSON.parse(url.searchParams.get('f-subprojects')!)) ===
      JSON.stringify([{ subproject_id: first }]),
  )
  const restricted = page.getByRole('menuitemcheckbox', { name: 'Restricted' })
  if (!(await restricted.isVisible())) await summary.click()
  await restricted.click()
  await expect(summary).toHaveAttribute('placeholder', 'North, Restricted')
  const search = new URL(page.url()).searchParams
  search.set('panes', 'tree,data,map')
  await page.goto(`${listPath}?${search}`)
  await expect(rows.getByText('Restricted', { exact: true })).toBeVisible()
  await expect(rows.getByText('South', { exact: true })).toHaveCount(0)
  const tree = page.locator('[data-index]')
  await expect(tree.getByText(/\(2\/3\)$/)).toBeVisible()
})
