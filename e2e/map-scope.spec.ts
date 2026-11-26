import { expect, test } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

const a = 'c2100000-0000-7000-8000-000000000001'
const b = 'c2100000-0000-7000-8000-000000000002'
const first = 'c2100000-0000-7000-8000-000000000011'
const second = 'c2100000-0000-7000-8000-000000000012'
const hidden = 'c2100000-0000-7000-8000-000000000013'
const only = 'c2100000-0000-7000-8000-000000000021'
const password = 'e2e-map-scope-test'
const layer = 'c2100000-0000-7000-8000-000000000030'
const places = [first, second, hidden, only].map((id) =>
  id.replace('c210', 'c211'),
)

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
}) => {
  const email = 'scope-multi@example.com'
  const userId = await ensureUser({ email, password, name: 'Scope multi' })
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
  await login(page, email, password)
  await page.goto(
    `/data/projects/${a}/subprojects/${first}?panes=map&c=47,8&z=12&layers=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`,
  )
  const drawer = page.locator('.map-layers-drawer')
  const project = drawer.getByRole('combobox', { name: 'Project', exact: true })
  const survey = drawer.getByRole('combobox', { name: 'Survey' })
  await expect(project).toHaveValue(a, { timeout: 120_000 })
  await expect(survey).toHaveValue(first)
  await expect(survey.locator('option')).toHaveText([
    'All accessible',
    'North',
    'South',
  ])
  await survey.selectOption(second)
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.endsWith(`/subprojects/${second}`) &&
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
  await expect(survey).toHaveValue(second)
})

test('with one accessible project the map offers only its subprojects', async ({
  page,
}) => {
  const email = 'scope-single@example.com'
  const userId = await ensureUser({ email, password, name: 'Scope single' })
  await grantRoles({
    email,
    userId,
    projectId: a,
    role: 'read-specific',
    subprojectIds: [first, second],
  })

  await login(page, email, password)
  await page.goto('/data/projects?panes=map')
  const drawer = page.locator('.map-layers-drawer')
  await drawer
    .getByRole('combobox', { name: 'Survey' })
    .selectOption(first, { timeout: 120_000 })
  await expect(
    drawer.getByRole('combobox', { name: 'Project', exact: true }),
  ).toHaveCount(0)
  await expect(page).toHaveURL((url) =>
    url.pathname.endsWith(`/${a}/subprojects/${first}`),
  )
})

test('overview renders both accessible subprojects and stays wide when opening a form', async ({
  page,
}) => {
  const email = 'scope-overview@example.com'
  const userId = await ensureUser({ email, password, name: 'Scope overview' })
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
  await login(page, email, password)
  await page.goto(`/data/projects/${a}?panes=map&c=47.37,8.54&z=17`)
  const survey = page.getByRole('combobox', { name: 'Survey' })
  await page.getByRole('button', { name: 'Cluster point markers' }).click({ timeout: 120_000 })
  await page.getByRole('menuitemradio', { name: 'Show individually' }).click()
  const markers = page.locator('.clickable-hitbox')
  await expect(markers).toHaveCount(2, { timeout: 120_000 })
  await markers.first().click()
  const info = page.locator('.map-info-drawer')
  const hitSubproject = await info.getByText(/^Survey: (North|South)$/).innerText()
  await page.getByRole('button', { name: 'Navigate to form' }).click()
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.includes(`/subprojects/${hitSubproject === 'Survey: North' ? first : second}/places/`) &&
      url.searchParams.get('mapOverview') === a,
  )
  await expect(survey).toHaveValue('')
  await expect(markers).toHaveCount(2)
  await survey.selectOption(second)
  await expect(markers).toHaveCount(1)
  await survey.selectOption('')
  await expect(markers).toHaveCount(2)
})
