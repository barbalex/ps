import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

test('import a project polygon without IDs, then import place geometry by UUID from its list', async ({
  page,
}) => {
  const projectId = randomUUID()
  const sub = randomUUID(),
    place = randomUUID()
  const email = `geometry-${projectId}@example.com`
  const password = 'e2e-test-password-123'
  const userId = await ensureUser({ email, password, name: 'Geometry import' })
  psql(
    `SET electric.syncing = true; INSERT INTO projects(project_id,name) VALUES ('${projectId}','Import test');
     INSERT INTO subprojects(subproject_id,project_id) VALUES ('${sub}','${projectId}');
     INSERT INTO places(place_id,subproject_id) VALUES ('${place}','${sub}');`,
  )
  try {
    await grantRoles({
      email,
      userId,
      projectId,
      role: 'design',
      subprojectIds: [sub],
      placeIds: [place],
    })
    await page.addInitScript(() => localStorage.setItem('language', '"en"'))
    await login(page, email, password)
    await page.goto(`/data/projects/${projectId}/project?panes=data`)
    await page
      .getByRole('button', { name: 'Capture geometry', exact: true })
      .click({ timeout: 60_000 })
    await page.getByRole('menuitem', { name: 'Import geometries' }).click()
    const dialog = page.getByRole('dialog')
    for (const [index, lon] of [7, 9, 11].entries()) {
      if (index) {
        await page.goto(
          `/data/projects/${projectId}/subprojects/${sub}/places?panes=data`,
        )
        await page.getByRole('button', { name: 'Import geometries' }).click()
      }
      const feature = {
        type: 'Feature',
        properties: index === 1 ? { survey_uuid: place } : {},
        ...(index === 2 && { id: place }),
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lon, 46],
              [lon + 1, 46],
              [lon + 1, 47],
              [lon, 46],
            ],
          ],
        },
      }
      await dialog.locator('input[type=file]').setInputFiles({
        name: 'area.geojson',
        mimeType: 'application/geo+json',
        buffer: Buffer.from(
          JSON.stringify({ type: 'FeatureCollection', features: [feature] }),
        ),
      })
      if (index === 1)
        await dialog
          .getByLabel('Target object UUID')
          .selectOption('survey_uuid')
      if (index === 2) await dialog.getByLabel('Target object UUID').waitFor()
      await dialog.getByRole('button', { name: 'Import geometries' }).click()
      await expect(dialog.getByRole('status')).toContainText('1', {
        timeout: 60_000,
      })
      expect(
        psql(
          index ?
            `SELECT ST_NumGeometries(geometry) FROM places WHERE place_id='${place}'`
          : `SELECT ST_NumGeometries(geometry) FROM projects WHERE project_id='${projectId}'`,
        ),
      ).toBe(String(index || 1))
      await dialog.getByRole('button', { name: 'Close' }).click()
    }

    await page.getByRole('button', { name: 'Import geometries' }).click()
    const folder = (
      name: string,
      field: string,
      lon: number,
    ) => `<Folder><name>${name}</name><Placemark>
      <ExtendedData><Data name="${field}"><value>${place}</value></Data></ExtendedData>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>${lon},46 ${lon + 1},46 ${lon + 1},47 ${lon},46</coordinates></LinearRing></outerBoundaryIs></Polygon>
      </Placemark></Folder>`
    await dialog.locator('input[type=file]').setInputFiles([
      {
        name: 'sites.kml',
        mimeType: 'application/xml',
        buffer: Buffer.from(
          `<kml xmlns="http://www.opengis.net/kml/2.2"><Document>${folder('West', 'west_id', 1)}${folder('East', 'east_id', 3)}${folder('Skip', 'skip_id', 5)}</Document></kml>`,
        ),
      },
      {
        name: 'island.geojson',
        mimeType: 'application/json',
        buffer: Buffer.from(
          JSON.stringify({
            type: 'Feature',
            properties: { place_id: place },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [20, 46],
                  [21, 46],
                  [21, 47],
                  [20, 46],
                ],
              ],
            },
          }),
        ),
      },
    ])
    await dialog.getByRole('checkbox', { name: /East$/ }).check()
    await dialog
      .getByRole('group', { name: /West$/ })
      .getByLabel('Target object UUID')
      .selectOption('west_id')
    await dialog.getByLabel('Existing features').selectOption('replace')
    const snapshot = () =>
      psql(`SELECT ST_AsText(geometry) FROM places WHERE place_id='${place}'`)
    const before = snapshot()
    let writes = 0
    page.on('request', (r) => {
      if (
        r.method() === 'POST' &&
        r.url().endsWith('/rpc/import_own_geometries')
      )
        writes++
    })
    await dialog.getByRole('button', { name: 'Import geometries' }).click()
    await expect(dialog.getByRole('alert')).toContainText('East')
    expect(writes).toBe(0)
    expect(snapshot()).toBe(before)
    await dialog
      .getByRole('group', { name: /East$/ })
      .getByLabel('Target object UUID')
      .selectOption('east_id')
    await dialog.getByRole('button', { name: 'Import geometries' }).click()
    await expect(dialog.getByRole('status')).toContainText('1')
    expect(writes).toBe(1)
    expect(
      psql(
        `SELECT ST_NumGeometries(geometry), ST_XMin(geometry), ST_XMax(geometry) FROM places WHERE place_id='${place}'`,
      ),
    ).toBe('3|1|21')
  } finally {
    psql(
      `SET electric.syncing = true; DELETE FROM projects WHERE project_id='${projectId}';
       DELETE FROM users WHERE user_id='${userId}' AND email='${email}';`,
    )
  }
})
