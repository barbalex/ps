import { expect, test } from '@playwright/test'
import {
  ensureProjectFixture,
  ensureUser,
  grantRoles,
  login,
  psql,
} from './helpers.ts'

const uuid = (n: number) =>
  `d3c40000-0000-4000-8000-${String(n).padStart(12, '0')}`
const projectId = uuid(1),
  subprojectId = uuid(2),
  placeId = uuid(3)
const root = `/data/projects/${projectId}/subprojects/${subprojectId}/places`
const email = 'custom-multiselect@test.ch',
  password = 'e2e-test-password-123'

test('controlled choices store typed arrays offline and restore any/all URL filters', async ({
  page,
  context,
}) => {
  await ensureProjectFixture({
    projectId,
    subprojectId,
    placeId,
    placeLevelId: uuid(4),
    projectName: 'Controlled choices',
    subprojectName: 'Choices',
    placeName: 'Survey',
  })
  psql(`SET electric.syncing TO 'true';
    INSERT INTO lists (list_id,project_id,value_type) VALUES ('${uuid(5)}','${projectId}','text'),('${uuid(6)}','${projectId}','numeric') ON CONFLICT DO NOTHING;
    INSERT INTO list_values (list_value_id,list_id,value_text,value_numeric) VALUES
      ('${uuid(7)}','${uuid(5)}','001',null),('${uuid(8)}','${uuid(5)}','A',null),
      ('${uuid(9)}','${uuid(6)}',null,0),('${uuid(10)}','${uuid(6)}',null,2.5) ON CONFLICT DO NOTHING;
    INSERT INTO fields (field_id,project_id,table_name,level,name,field_label,field_type_id,widget_type_id,list_id)
    SELECT f.id::uuid,'${projectId}','places',1,f.name,f.name,ft.field_type_id,wt.widget_type_id,f.list::uuid
    FROM (VALUES ('${uuid(11)}','tags','text','multiselect-few','${uuid(5)}'),('${uuid(12)}','scores','decimal','multiselect-many','${uuid(6)}'),('${uuid(13)}','assessed','boolean','boolean-buttons',null))
    f(id,name,ft,wt,list) JOIN field_types ft ON ft.name=f.ft JOIN widget_types wt ON wt.name=f.wt ON CONFLICT DO NOTHING;
    UPDATE fields SET widget_type_id=(SELECT widget_type_id FROM widget_types WHERE name='multiselect-few') WHERE field_id='${uuid(11)}';
    UPDATE places SET data='{}' WHERE place_id='${placeId}';`)
  const userId = await ensureUser({
    email,
    password,
    name: 'Multiselect tester',
  })
  await grantRoles({
    email,
    userId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
    placeIds: [placeId],
  })
  await login(page, email, password)
  await page.goto(`${root}/${placeId}/place?panes=form`)
  const tags = page.getByRole('group', { name: 'tags' })
  const first = tags.getByRole('checkbox', { name: '001', exact: true })
  await expect(first).toBeVisible({ timeout: 90_000 })
  await context.setOffline(true)
  await first.check()
  await tags.getByRole('checkbox', { name: 'A', exact: true }).check()
  const scores = page.getByRole('combobox', { name: 'scores' })
  await scores.click()
  await scores.fill('2.')
  await page.getByRole('menuitemcheckbox', { name: '2.5', exact: true }).click()
  await scores.fill('0')
  await page.getByRole('menuitemcheckbox', { name: '0', exact: true }).click()
  await scores.press('Escape')
  const read = () =>
    page.evaluate(
      async (id) =>
        (
          await window.__pglite_db__!.query<{ data: unknown }>(
            'select data from places where place_id=$1',
            [id],
          )
        ).rows[0].data,
      placeId,
    )
  await expect.poll(read).toEqual({ tags: ['001', 'A'], scores: [2.5, 0] })
  await first.uncheck()
  await expect.poll(read).toEqual({ tags: ['A'], scores: [2.5, 0] })
  const assessed = page.getByRole('group', { name: 'assessed', exact: true })
  const notAssessed = assessed.getByRole('button', {
    name: /^(Not assessed|Nicht beurteilt)$/,
  })
  const no = assessed.getByRole('button', { name: /^(No|Nein)$/ })
  await expect(notAssessed).toHaveAttribute('aria-pressed', 'true')
  await assessed.getByRole('button', { name: /^(Yes|Ja)$/ }).click()
  await expect.poll(read).toMatchObject({ assessed: true })
  await no.click()
  await expect.poll(read).toMatchObject({ assessed: false })
  await notAssessed.click()
  await expect.poll(read).toMatchObject({ assessed: null })
  await context.setOffline(false)
  await expect
    .poll(
      () =>
        JSON.parse(psql(`SELECT data FROM places WHERE place_id='${placeId}'`)),
      { timeout: 90000 },
    )
    .toEqual({ tags: ['A'], scores: [2.5, 0], assessed: null })
  await page.goto(`${root}/filter?panes=form`)
  await first.check()
  await expect(page).toHaveURL(/%24any|\$any/i)
  const all = tags.getByRole('checkbox', {
    name: /Match all selected|Alle ausgewählten/,
  })
  await all.check()
  await expect(page).toHaveURL(/%24all|\$all/i)
  await page.reload()
  await expect(all).toBeChecked({ timeout: 60_000 })
  await expect(first).toBeChecked()
  await first.uncheck()
  await expect(page).not.toHaveURL(/f-places1/)
  const anyAssessment = assessed.getByRole('button', { name: /^(All|Alle)$/ })
  await expect(anyAssessment).toHaveAttribute('aria-pressed', 'true')
  await notAssessed.click()
  await expect(page).toHaveURL(/data.assessed.*null/)
  await page.reload()
  await expect(notAssessed).toHaveAttribute('aria-pressed', 'true', {
    timeout: 60000,
  })
  await no.click()
  await expect(page).toHaveURL(/data.assessed.*false/)
  await anyAssessment.click()
  await expect(page).not.toHaveURL(/f-places1/)

  await page.goto(`/data/projects/${projectId}/fields/${uuid(11)}?panes=form`)
  const widget = page.getByRole('combobox', { name: 'Widget', exact: true })
  await expect(widget).toHaveText('multiselect-few', { timeout: 60_000 })
  await widget.click()
  await page
    .getByRole('option', { name: 'multiselect-many', exact: true })
    .click()
  await expect(widget).toHaveText('multiselect-many')
  await page.goto(`${root}/${placeId}/place?panes=form`)
  await expect(page.getByRole('combobox', { name: 'tags' })).toHaveValue('A', {
    timeout: 60_000,
  })
})
