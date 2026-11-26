import { expect, test } from '@playwright/test'
import {
  ensureProjectFixture,
  ensureUser,
  grantRoles,
  login,
  psql,
} from './helpers.ts'

const projectId = 'c1100000-0000-7000-8000-000000000001'
const subprojectId = 'c1100000-0000-7000-8000-000000000002'
const email = 'list-import@example.com'
const password = 'e2e-import-123'

test.beforeAll(async () => {
  await ensureProjectFixture({
    projectId,
    subprojectId,
    projectName: 'Import test',
    subprojectName: 'Import scope',
    placeLevelId: 'c1100000-0000-7000-8000-000000000003',
    placeId: 'c1100000-0000-7000-8000-000000000004',
    placeName: 'Existing',
  })
})

test('designer can download the template, map a column and create places only in design mode', async ({
  page,
}) => {
  const userId = await ensureUser({ email, password, name: 'Import Designer' })
  await grantRoles({
    email,
    userId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
    placeIds: ['c1100000-0000-7000-8000-000000000004'],
  })
  await login(page, email, password)
  const path = `/data/projects/${projectId}/subprojects/${subprojectId}/places`
  const action = page.getByRole('button', {
    name: /Aus Datei importieren|Import from file/i,
  })
  await page.goto(`${path}?designing=0`)
  await expect(page.getByRole('button', { name: 'Edit Filter' })).toBeVisible({
    timeout: 120_000,
  })
  await expect(action).toHaveCount(0)
  await page.goto(`${path}?designing=1`)
  await action.click({ timeout: 120_000 })
  const dialog = page.getByRole('dialog')
  const download = page.waitForEvent('download')
  await dialog.getByRole('button', { name: /template|vorlage/i }).click()
  expect((await download).suggestedFilename()).toBe('places.xlsx')
  const name = `import-${Date.now()}`
  await dialog.locator('input[type=file]').setInputFiles({
    name: 'places.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(`name,since,site_code\n${name},2025,001`),
  })
  const submit = dialog.getByRole('button', {
    name: /Create records|Datensätze erstellen/i,
  })
  await expect(submit).toBeDisabled()
  await dialog.getByLabel('site_code →').selectOption('extra')
  await expect(dialog.locator('pre')).toContainText('"site_code": "001"')
  await submit.click()
  await expect(dialog).toHaveCount(0)
  expect(
    psql(
      `SELECT data->>'site_code' FROM places WHERE subproject_id='${subprojectId}' AND name='${name}'`,
    ),
  ).toBe('001')
  const label = psql(
    `SELECT label FROM places WHERE subproject_id='${subprojectId}' AND name='${name}'`,
  )
  await expect(
    page.locator('.list-container').getByText(label, { exact: true }),
  ).toBeVisible()
})

test('imported subprojects appear in the current list without reloading', async ({
  page,
}) => {
  const userId = await ensureUser({ email, password, name: 'Import Designer' })
  await grantRoles({
    email,
    userId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
  })
  await login(page, email, password)
  await expect(
    page.locator(`a[href="/data/projects/${projectId}"]`).first(),
  ).toBeVisible({ timeout: 120_000 })
  await page.goto(
    `/data/projects/${projectId}/subprojects?panes=data&designing=1`,
  )
  await page.getByRole('button', { name: 'Import from file' }).click()
  const dialog = page.getByRole('dialog')
  const name = `visible-${Date.now()}`
  await dialog
    .locator('input[type=file]')
    .setInputFiles({
      name: 'subprojects.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(`name\n${name}\n${name}-2`),
    })
  await dialog.getByRole('button', { name: 'Create records' }).click()
  await expect(dialog).toHaveCount(0)
  for (const label of [name, `${name}-2`]) {
    await expect(
      page.locator('.list-container').getByText(label, { exact: true }),
    ).toBeVisible({ timeout: 15_000 })
  }
})

test('a writer cannot enable import with the design-mode URL', async ({
  page,
}) => {
  const writer = 'list-import-writer@example.com'
  const userId = await ensureUser({
    email: writer,
    password,
    name: 'Import Writer',
  })
  await grantRoles({
    email: writer,
    userId,
    projectId,
    role: 'write-all',
    subprojectIds: [subprojectId],
    placeIds: ['c1100000-0000-7000-8000-000000000004'],
  })
  await login(page, writer, password)
  await expect(
    page.locator(`a[href="/data/projects/${projectId}"]`).first(),
  ).toBeVisible({ timeout: 120_000 })
  await page.goto(
    `/data/projects/${projectId}/subprojects/${subprojectId}/places?designing=1`,
  )
  await expect(
    page.getByRole('link', { name: 'Import scope', exact: true }).first(),
  ).toBeVisible({ timeout: 120_000 })
  await expect(
    page.getByRole('button', { name: 'Import from file' }),
  ).toHaveCount(0)
})
