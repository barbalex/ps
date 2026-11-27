import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

test('download and reimport the same place UUID and geometry in every export format', async ({
  page,
}) => {
  const id = randomUUID()
  const sub = randomUUID(),
    place = randomUUID()
  const email = `export-${id}@example.com`
  const password = 'e2e-test-password-123'
  const userId = await ensureUser({ email, password, name: 'Geometry export' })
  const area = 'ST_Multi(ST_MakeEnvelope(7,46,8,47,4326))'
  psql(
    `SET electric.syncing=true; INSERT INTO projects(project_id,name) VALUES ('${id}','Export test');
     INSERT INTO subprojects(subproject_id,project_id,name) VALUES ('${sub}','${id}','Survey');
     INSERT INTO places(place_id,subproject_id,geometry,data) VALUES ('${place}','${sub}',ST_ForceCollection(${area}),'{"survey":"Alpha & Beta"}');`,
  )
  try {
    await grantRoles({
      email,
      userId,
      projectId: id,
      role: 'design',
      subprojectIds: [sub],
      placeIds: [place],
    })
    await page.addInitScript(() => localStorage.setItem('language', '"en"'))
    await login(page, email, password)
    await page.goto(`/data/projects/${id}/subprojects/${sub}/places?panes=data`)
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
      expect(download.suggestedFilename()).toBe(`places.${ext}`)
      const bytes = await readFile((await download.path())!)
      if (ext === 'geojson')
        expect(
          JSON.parse(bytes.toString()).features[0].properties,
        ).toMatchObject({
          place_id: place,
          data_survey: 'Alpha & Beta',
          subproject_id: sub,
          subproject_id_label: 'Survey',
        })
      psql(
        `SET electric.syncing=true; UPDATE places SET geometry=NULL WHERE place_id='${place}';`,
      )
      await page.getByRole('button', { name: 'Import geometries' }).click()
      const dialog = page.getByRole('dialog')
      await dialog.locator('input[type=file]').setInputFiles({
        name: download.suggestedFilename(),
        mimeType: 'application/octet-stream',
        buffer: bytes,
      })
      await expect(dialog.getByLabel('Target object UUID')).toHaveValue(
        'place_id',
      )
      for (const column of [
        'data_survey',
        'subproject_id_label',
        'name',
        'updated_at',
      ])
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
          `SELECT ST_Equals(geometry,${area}) FROM places WHERE place_id='${place}'`,
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
