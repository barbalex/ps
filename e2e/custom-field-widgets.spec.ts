import { expect, test } from '@playwright/test'
import {
  ensureProjectFixture,
  ensureUser,
  grantRoles,
  login,
  psql,
} from './helpers.ts'

const uuid = (n: number) =>
  `d3c30000-0000-4000-8000-${String(n).padStart(12, '0')}`
const projectId = uuid(1),
  subprojectId = uuid(2),
  placeId = uuid(3)
const email = 'custom-widgets@test.ch',
  password = 'e2e-test-password-123'

test.use({ timezoneId: 'Europe/Zurich' })

test('Markdown and rich text round-trip through editing and print; decimal and local time persist typed values', async ({
  page,
  browser,
}) => {
  await ensureProjectFixture({
    projectId,
    subprojectId,
    placeId,
    placeLevelId: uuid(4),
    projectName: 'Custom widgets',
    subprojectName: 'Widget tests',
    placeName: 'Widget record',
  })
  psql(`
    SET electric.syncing TO 'true';
    DELETE FROM form_designs WHERE form_design_id = '${uuid(8)}';
    INSERT INTO fields (field_id, project_id, table_name, level, name, field_label, field_type_id, widget_type_id)
    SELECT f.id::uuid, '${projectId}', 'places', 1, f.name, f.name, ft.field_type_id, wt.widget_type_id
    FROM (VALUES ('${uuid(5)}','notes','text','markdown'), ('${uuid(6)}','amount','decimal','text'),
      ('${uuid(7)}','visited','date-time','datetimepicker'), ('${uuid(9)}','legacy','text','rich-text'),
      ('${uuid(14)}','detail','text','text')) AS f(id,name,ft,wt)
    JOIN field_types ft ON ft.name = f.ft JOIN widget_types wt ON wt.name = f.wt
    ON CONFLICT DO NOTHING;
    INSERT INTO lists (list_id,project_id,value_type) VALUES ('${uuid(10)}','${projectId}','text') ON CONFLICT DO NOTHING;
    INSERT INTO list_values (list_value_id,list_id,value_text) VALUES
      ('${uuid(11)}','${uuid(10)}','001'),('${uuid(12)}','${uuid(10)}','Salix alba') ON CONFLICT DO NOTHING;
    INSERT INTO fields (field_id,project_id,table_name,level,name,field_label,field_type_id,widget_type_id,list_id)
    SELECT '${uuid(13)}','${projectId}','places',1,'species_choice','Species choice',ft.field_type_id,wt.widget_type_id,'${uuid(10)}'
    FROM field_types ft, widget_types wt WHERE ft.name='text' AND wt.name='options-many' ON CONFLICT DO NOTHING;
    UPDATE places SET data = '{"species_choice":"Salix alba"}' WHERE place_id = '${placeId}';
    UPDATE fields SET numeric_unit=null, numeric_min=null, numeric_max=null, numeric_step=null WHERE field_id='${uuid(6)}';
    UPDATE fields SET instructions=null, followup_field_id=null, followup_test=null, followup_answer=null WHERE field_id='${uuid(14)}';
  `)
  const userId = await ensureUser({ email, password, name: 'Widget tester' })
  await grantRoles({
    email,
    userId,
    projectId,
    role: 'design',
    subprojectIds: [subprojectId],
    placeIds: [placeId],
  })
  const designer = await browser.newPage({
    baseURL: test.info().project.use.baseURL,
    ignoreHTTPSErrors: true,
  })
  await login(designer, email, password)
  await designer.goto(
    `/data/projects/${projectId}/fields/${uuid(6)}?panes=form`,
  )
  for (const [name, setting] of [
    ['numeric_unit', 'mm'],
    ['numeric_min', '-1,25'],
    ['numeric_max', '2.75'],
    ['numeric_step', '0,25'],
  ]) {
    const input = designer.locator(`input[name="${name}"]`)
    await input.fill(setting)
    await input.blur()
  }
  await expect
    .poll(
      () =>
        psql(
          `SELECT concat_ws('/',numeric_unit,numeric_min,numeric_max,numeric_step) FROM fields WHERE field_id='${uuid(6)}'`,
        ),
      { timeout: 60000 },
    )
    .toBe('mm/-1.25/2.75/0.25')
  psql(
    `SET electric.syncing TO 'true'; UPDATE fields SET numeric_unit='cm' WHERE field_id='${uuid(6)}'`,
  )
  await expect(designer.locator('input[name="numeric_unit"]')).toHaveValue(
    'cm',
    {
      timeout: 60000,
    },
  )
  await designer.goto(
    `/data/projects/${projectId}/fields/${uuid(14)}?panes=form`,
  )
  const guidance = 'Explain how the amount was measured.'
  const instructions = designer.locator('textarea[name="instructions"]')
  await instructions.fill(guidance)
  await instructions.blur()
  await designer.locator('[name="followup_field_id"]').click()
  await designer.getByRole('option', { name: 'amount', exact: true }).click()
  await expect
    .poll(
      () =>
        psql(
          `SELECT followup_field_id FROM fields WHERE field_id='${uuid(14)}'`,
        ),
      { timeout: 60000 },
    )
    .toBe(uuid(6))
  await designer.close()
  await login(page, email, password)
  await page.goto(
    `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/place?panes=form`,
  )
  const data = () =>
    page.evaluate(async (id) => {
      const result = await window.__pglite_db__!.query<{
        data: Record<string, unknown>
      }>('select data from places where place_id = $1', [id])
      return result.rows[0].data
    }, placeId)

  const notes = page.locator('textarea[name="notes"]')
  const markdownField = page.locator('.fui-Field').filter({ has: notes })
  const rich = page.getByRole('textbox', { name: 'legacy', exact: true })
  const source = '## Survey\n\n- **First** sighting\n- Second sighting'
  await expect(notes).toBeVisible({ timeout: 90_000 })
  const choice = page.getByRole('combobox', { name: 'Species choice' })
  await expect(choice).toHaveValue('Salix alba')
  await choice.click()
  await choice.fill('ALBA')
  await expect(page.getByRole('option', { name: 'Salix alba' })).toBeVisible()
  await expect(page.getByRole('option', { name: '001' })).toHaveCount(0)
  await choice.fill('not a species')
  await choice.press('Escape')
  await expect(choice).toHaveValue('Salix alba')
  await expect.poll(data).toMatchObject({ species_choice: 'Salix alba' })
  await choice.click()
  await choice.fill('01')
  await page.getByRole('option', { name: '001' }).click()
  await expect.poll(data).toMatchObject({ species_choice: '001' })
  await choice.locator('..').locator('.fui-Combobox__clearIcon').click()
  await expect.poll(data).toMatchObject({ species_choice: null })
  await notes.fill('Iris')
  await notes.press('Control+a')
  await markdownField.getByRole('button', { name: /^(Bold|Fett)$/ }).click()
  await expect(notes).toHaveValue('**Iris**')
  expect(
    await notes.evaluate((el) => (el as HTMLTextAreaElement).selectionStart),
  ).toBe(2)
  await notes.press('Control+z')
  await expect(notes).toHaveValue('Iris')
  await notes.press('End')
  await notes.press('Control+i')
  await page.keyboard.type('alba')
  await expect(notes).toHaveValue('Iris*alba*')
  await notes.fill('Iris\nSalix')
  await notes.press('Control+a')
  const viewport = page.viewportSize()!
  await page.setViewportSize({ width: 390, height: 844 })
  const more = markdownField.getByRole('button', {
    name: /More formats|Weitere Formate/,
  })
  await more.click()
  await page
    .getByRole('menuitem', { name: /Numbered list|Nummerierte Liste/ })
    .click()
  await expect(notes).toHaveValue('1. Iris\n2. Salix')
  await page.setViewportSize(viewport)
  await notes.fill('Survey')
  await notes.press('Control+a')
  await notes.press('Control+k')
  const dialog = page.getByRole('dialog')
  await expect(
    dialog.getByRole('textbox', { name: 'Text', exact: true }),
  ).toHaveValue('Survey')
  await dialog
    .getByRole('textbox', { name: 'URL' })
    .fill('https://example.org/survey')
  await dialog
    .getByRole('button', { name: /Insert link|Link einfügen/ })
    .click()
  await expect(notes).toHaveValue('[Survey](https://example.org/survey)')
  await notes.focus()
  await notes.blur()
  await expect
    .poll(data)
    .toMatchObject({ notes: '[Survey](https://example.org/survey)' })
  await notes.fill(source)
  await page.getByRole('button', { name: /^(Preview|Vorschau)$/ }).click()
  await expect(page.getByRole('heading', { name: 'Survey' })).toBeVisible()
  await expect.poll(data).toMatchObject({ notes: source })
  await page.getByRole('button', { name: /^(Edit|Bearbeiten)$/ }).click()
  await expect(notes).toHaveValue(source)
  await page.emulateMedia({ media: 'print' })
  await expect(notes).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Survey' })).toBeVisible()
  await page.emulateMedia({ media: 'screen' })

  await rich.click()
  await page.context().setOffline(true)
  await rich.fill('Iris')
  await rich.press('Control+a')
  const richField = page.locator('.fui-Field').filter({ has: rich })
  await richField.getByRole('button', { name: /^(Italic|Kursiv)$/ }).click()
  await expect(rich.locator('em')).toHaveText('Iris')
  await rich.press('Control+k')
  await dialog
    .getByRole('textbox', { name: 'URL' })
    .fill('https://example.org/iris')
  await dialog
    .getByRole('button', { name: /Insert link|Link einfügen/ })
    .click()
  await expect(rich.locator('a')).toHaveText('Iris')
  await rich.press('Control+a')
  await rich.press('Backspace')
  // Keep the following paste separate from typing in native editor history.
  await rich.blur()
  await rich.click()
  await rich.evaluate((el) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData(
      'text/html',
      '<h2>Inventory</h2><p><strong>Iris</strong> <em>alba</em></p><ul><li>North</li></ul><ol><li>South</li></ol><p><a href="https://example.org/site">Site</a></p>',
    )
    el.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData,
      }),
    )
  })
  await expect(rich.locator('strong')).toHaveText('Iris')
  await rich.press('Control+z')
  await expect(rich).not.toContainText('Inventory')
  await rich.press('Control+Shift+z')
  await expect(rich.locator('em')).toHaveText('alba')
  await rich.blur()
  await expect
    .poll(data)
    .toMatchObject({ legacy: expect.stringContaining('**Iris**') })
  const saved = (await data()).legacy
  expect(saved).toContain('## Inventory')
  expect(saved).toContain('[Site](https://example.org/site)')
  expect(saved).not.toContain('<p>')
  await page.context().setOffline(false)

  const amount = page.locator('input[name="amount"]')
  const amountField = page.locator('.fui-Field').filter({ has: amount })
  const detail = page.locator('input[name="detail"]')
  await expect(detail).toHaveCount(0)
  await expect(amountField.getByText('cm', { exact: true })).toBeVisible()
  for (const [input, saved] of [
    ['-1,25', -1.25],
    ['2.75', 2.75],
    ['0', 0],
    ['', null],
  ] as const) {
    await amount.fill(input)
    await amount.blur()
    await expect.poll(data).toMatchObject({ amount: saved })
    if (saved === -1.25) {
      await expect(page.getByText(guidance)).toBeVisible()
      await detail.fill('Measured twice')
      await detail.blur()
    }
  }
  await expect(detail).toHaveCount(0)
  await expect(page.getByText(guidance)).toHaveCount(0)
  await expect.poll(data).toMatchObject({ detail: 'Measured twice' })
  const visited = page.locator('input[name="visited"]')
  for (const invalid of ['-1.5', '3', '0,1']) {
    await amount.fill(invalid)
    await amount.blur()
    await expect(
      amountField.locator('.fui-Field__validationMessage'),
    ).toBeVisible()
    expect(await data()).toMatchObject({ amount: null })
  }
  for (const [input, saved] of [
    ['2026-06-18T12:00', '2026-06-18T10:00:00.000Z'],
    ['2026-01-18T00:00', '2026-01-17T23:00:00.000Z'],
    ['', null],
  ] as const) {
    await visited.fill(input)
    await visited.blur()
    await expect.poll(data).toMatchObject({ visited: saved })
  }

  const design = {
    content: [5, 6, 9, 14].map((n) => ({
      type: `field_${uuid(n)}`,
      props: { id: `widget-${n}` },
    })),
    root: { props: {} },
  }
  psql(`SET electric.syncing TO 'true';
    INSERT INTO form_designs(form_design_id, project_id, table_name, active, design)
    VALUES ('${uuid(8)}', '${projectId}', 'places', true, '${JSON.stringify(design)}')`)
  await expect(visited).toHaveCount(0, { timeout: 60000 })
  await expect(amountField.getByText('cm', { exact: true })).toBeVisible()
  await amount.fill('1,5')
  await amount.blur()
  await expect.poll(data).toMatchObject({ amount: 1.5 })
  await expect(detail).toHaveValue('Measured twice')
  await expect(page.getByText(guidance)).toBeVisible()
  await expect(rich.locator('ul li')).toHaveText('North')
  await expect(rich.locator('ol li')).toHaveText('South')
  await expect(notes).toHaveValue(source)
  await notes.fill('# Designed form')
  await notes.blur()
  await expect.poll(data).toMatchObject({ notes: '# Designed form' })
  await page
    .getByRole('button', { name: /Print form|Formular drucken/i })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Designed form' }),
  ).toBeVisible()
  await expect(notes).toHaveCount(0)
  await expect(rich).toHaveAttribute('contenteditable', 'false')
  await expect(rich.locator('h2')).toHaveText('Inventory')
  await expect(rich.locator('a')).toHaveAttribute(
    'href',
    'https://example.org/site',
  )

  for (const [fieldId, legacy] of [
    [uuid(5), false],
    [uuid(9), true],
  ] as const) {
    await page.goto(`/data/projects/${projectId}/fields/${fieldId}?panes=form`)
    const widget = page.getByRole('combobox', { name: 'Widget', exact: true })
    await expect(widget).toHaveText(legacy ? 'rich-text' : 'markdown')
    await widget.click()
    await expect(
      page.getByRole('option', { name: 'markdown', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: 'rich-text', exact: true }),
    ).toBeVisible()
  }
})
