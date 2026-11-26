import { expect, test } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

const a = 'c2100000-0000-7000-8000-000000000001'
const b = 'c2100000-0000-7000-8000-000000000002'
const first = 'c2100000-0000-7000-8000-000000000011'
const second = 'c2100000-0000-7000-8000-000000000012'
const hidden = 'c2100000-0000-7000-8000-000000000013'
const only = 'c2100000-0000-7000-8000-000000000021'
const password = 'e2e-map-scope-test'

test.beforeAll(() => {
  psql(`SET electric.syncing = true;
    INSERT INTO projects(project_id,name,subproject_name_singular_en) VALUES
      ('${a}','Scope A','Survey'),('${b}','Scope B','Survey') ON CONFLICT DO NOTHING;
    INSERT INTO subprojects(subproject_id,project_id,name) VALUES
      ('${first}','${a}','North'),('${second}','${a}','South'),('${hidden}','${a}','Restricted'),
      ('${only}','${b}','Only') ON CONFLICT DO NOTHING;`)
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
  await expect(survey.locator('option')).toHaveText(['—', 'North', 'South'])
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
