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
  const survey = drawer.locator('summary')
  await expect(project).toHaveValue(a, { timeout: 120_000 })
  await expect(survey).toHaveText('Survey: North')
  await survey.click()
  await expect(
    drawer.getByRole('checkbox', { name: 'Restricted' }),
  ).toHaveCount(0)
  await drawer.getByRole('checkbox', { name: 'South' }).click()
  await expect(survey).toHaveText('Survey: North, South')
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
  await expect(survey).toHaveText('Survey: North, South')
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
  await drawer.locator('summary').click({ timeout: 120_000 })
  await drawer.getByRole('checkbox', { name: 'North' }).click()
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
  const survey = page.locator('.map-layers-drawer summary')
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
  await expect(survey).toHaveText('Survey: All accessible')
  await expect(markers).toHaveCount(2)
  await survey.click()
  await page.getByRole('checkbox', { name: 'South' }).click()
  await expect(markers).toHaveCount(1)
  await page.getByRole('button', { name: 'All accessible' }).click()
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
  const summary = page.locator('.map-layers-drawer summary')
  await expect(summary).toHaveText('Survey: North, South')
  await page.goto(`${listPath}${new URL(page.url()).search}`)
  const rows = page.locator('.list-container')
  await expect(rows.getByText('North', { exact: true })).toBeVisible()
  await expect(rows.getByText('South', { exact: true })).toBeVisible()
  await expect(rows.getByText('Restricted', { exact: true })).toHaveCount(0)
  await page.goto(`${listPath}/filter?panes=data,map`)
  const name = page.locator('.form-container.filter input[name=name]')
  await expect(summary).toHaveText('Survey: All accessible')
  await name.pressSequentially('th')
  await expect(page).toHaveURL(
    (url) =>
      url.searchParams.get('f-subprojects') ===
      JSON.stringify([{ name: 'th' }]),
  )
  await expect(summary).toHaveText('Survey: North, South')
  await summary.click()
  const south = page.getByRole('checkbox', { name: 'South' })
  page.once('dialog', (d) => d.dismiss())
  await south.click()
  await expect(summary).toHaveText('Survey: North, South')
  page.once('dialog', (d) => d.accept())
  await south.click()
  await expect(summary).toHaveText('Survey: North')
  await expect(page).toHaveURL(
    (url) =>
      JSON.stringify(JSON.parse(url.searchParams.get('f-subprojects')!)) ===
      JSON.stringify([{ subproject_id: first }]),
  )
  const restricted = page.getByRole('checkbox', { name: 'Restricted' })
  if (!(await restricted.isVisible())) await summary.click()
  await restricted.click()
  await expect(summary).toHaveText('Survey: North, Restricted')
  const search = new URL(page.url()).searchParams
  search.set('panes', 'tree,data,map')
  await page.goto(`${listPath}?${search}`)
  await expect(rows.getByText('Restricted', { exact: true })).toBeVisible()
  await expect(rows.getByText('South', { exact: true })).toHaveCount(0)
  const tree = page.locator('[data-index]')
  await expect(tree.getByText(/\(2\/3\)$/)).toBeVisible()
})
