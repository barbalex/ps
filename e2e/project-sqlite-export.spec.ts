import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { expect, test } from '@playwright/test'
import { ensureUser, grantRoles, login, psql } from './helpers.ts'

test('download a SQLite project snapshot with queryable UUID relationships', async ({
  page,
}, testInfo) => {
  const project = randomUUID(),
    other = randomUUID(),
    sub = randomUUID(),
    place = randomUUID()
  const email = `sqlite-${project}@example.com`,
    password = 'e2e-test-password-123'
  const userId = await ensureUser({ email, password, name: 'SQLite export' })
  try {
    psql(`SET electric.syncing=true; INSERT INTO projects(project_id,name) VALUES ('${project}','SQLite test'),('${other}','Other');
      INSERT INTO subprojects(subproject_id,project_id,name) VALUES ('${sub}','${project}','Survey');
      INSERT INTO places(place_id,subproject_id,data,geometry) VALUES ('${place}','${sub}','{"nr":3}',ST_ForceCollection(ST_Point(7,46,4326)));`)
    for (const projectId of [project, other])
      await grantRoles({
        email,
        userId,
        projectId,
        role: 'read-all',
        subprojectIds: projectId === project ? [sub] : [],
        placeIds: projectId === project ? [place] : [],
      })
    await page.addInitScript(() => localStorage.setItem('language', '"en"'))
    await login(page, email, password)
    await page.goto(`/data/projects/${project}/project?panes=data`)
    await expect(
      page.getByRole('textbox', { name: 'Name', exact: true }),
    ).toHaveValue('SQLite test', { timeout: 90_000 })
    await page
      .getByRole('button', { name: 'Export project', exact: true })
      .click()
    await expect(
      page.getByRole('menuitem', { name: 'Export to SQL dumpfile' }),
    ).toBeVisible()
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 45_000 }),
      page
        .getByRole('menuitem', { name: 'SQLite (.sqlite)', exact: true })
        .click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^SQLite_test_.*\.sqlite$/)
    const path = testInfo.outputPath('project.sqlite')
    await download.saveAs(path)
    const sqlite = new DatabaseSync(path, { readOnly: true })
    try {
      expect(sqlite.prepare('SELECT project_id FROM projects').all()).toEqual([
        { project_id: project },
      ])
      expect(
        sqlite
          .prepare(
            `SELECT t.place_id, s.label, json_extract(t.data,'$.nr') AS nr, json_extract(t.geometry,'$.geometries[0].coordinates[0]') AS lon FROM places t JOIN subprojects s USING(subproject_id) JOIN projects USING(project_id)`,
          )
          .all(),
      ).toEqual([{ place_id: place, label: 'Survey', nr: 3, lon: 7 }])
      expect(
        sqlite.prepare('PRAGMA foreign_key_list(places)').all(),
      ).toContainEqual(
        expect.objectContaining({
          table: 'subprojects',
          from: 'subproject_id',
          to: 'subproject_id',
        }),
      )
      expect(sqlite.prepare('PRAGMA foreign_key_check').all()).toEqual([])
      expect(sqlite.prepare('PRAGMA table_info(places)').all()).toContainEqual(
        expect.objectContaining({ name: 'place_id', pk: 1 }),
      )
    } finally {
      sqlite.close()
    }
  } finally {
    psql(
      `SET electric.syncing=true; DELETE FROM projects WHERE project_id IN ('${project}','${other}'); DELETE FROM users WHERE user_id='${userId}' AND email='${email}';`,
    )
  }
})
