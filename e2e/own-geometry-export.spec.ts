import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

test('download and reimport the same project UUID and geometry in every export format', async ({
  page,
}) => {
  const id = randomUUID()
  const email = `export-${id}@example.com`
  const password = 'e2e-test-password-123'
  const userId = await ensureUser({ email, password, name: 'Geometry export' })
  const area = 'ST_Multi(ST_MakeEnvelope(7,46,8,47,4326))'
  psql(
    `SET electric.syncing=true; INSERT INTO projects(project_id,name,geometry,data) VALUES ('${id}','Export test',${area},'{"survey":"Alpha & Beta"}');`,
  )
  try {
    await grantRoles({ email, userId, projectId: id, role: 'design' })
    await page.addInitScript(() => localStorage.setItem('language', '"en"'))
    await login(page, email, password)
    await page.goto('/data/projects?panes=data')
    for (const [label, ext] of [
      ['GeoJSON', 'geojson'],
      ['GeoPackage', 'gpkg'],
      ['CSV (WKT)', 'csv'],
      ['KML', 'kml'],
    ]) {
      await page
        .getByRole('button', { name: 'Export geometries' })
        .click({ timeout: 60_000 })
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30_000 }),
        page.getByRole('menuitem', { name: label, exact: true }).click(),
      ])
      expect(download.suggestedFilename()).toBe(`projects.${ext}`)
      const bytes = await readFile((await download.path())!)
      if (ext === 'geojson')
        expect(
          JSON.parse(bytes.toString()).features[0].properties,
        ).toMatchObject({
          project_id: id,
          data_survey: 'Alpha & Beta',
          type: 'species',
          type_label: 'Species',
        })
      psql(
        `SET electric.syncing=true; UPDATE projects SET geometry=NULL WHERE project_id='${id}';`,
      )
      await page.getByRole('button', { name: 'Import geometries' }).click()
      const dialog = page.getByRole('dialog')
      await dialog
        .locator('input[type=file]')
        .setInputFiles({
          name: download.suggestedFilename(),
          mimeType: 'application/octet-stream',
          buffer: bytes,
        })
      await expect(dialog.getByLabel('Target object UUID')).toHaveValue(
        'project_id',
      )
      for (const column of ['data_survey', 'type_label', 'name', 'updated_at'])
        await expect(
          dialog
            .getByLabel('Target object UUID')
            .locator(`option[value="${column}"]`),
        ).toHaveCount(1)
      await dialog.getByLabel('Existing features').selectOption('replace')
      await dialog.getByRole('button', { name: 'Import geometries' }).click()
      await expect(dialog.getByRole('status')).toContainText('1')
      expect(
        psql(
          `SELECT ST_Equals(geometry,${area}) FROM projects WHERE project_id='${id}'`,
        ),
      ).toBe('t')
      await dialog.getByRole('button', { name: 'Close' }).click()
    }
  } finally {
    psql(
      `SET electric.syncing=true; DELETE FROM projects WHERE project_id='${id}'; DELETE FROM users WHERE user_id='${userId}' AND email='${email}';`,
    )
  }
})
