import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import {
  psql,
  ensureUser,
  grantRoles,
  ensureProjectFixture,
  login,
} from './helpers.ts'

/**
 * Offline files (see offline-files-proposal.md):
 * - a user's mark (files.offline, via the file form header toggle) downloads
 *   the file into the device's 'offline-files' cache (OfflineFilesManager),
 * - a designer's table flag (place_levels.place_files_offline) marks all
 *   files of the table,
 * - both are gated by projects.files_offline,
 * - unmarking / un-flagging removes the cache entries again.
 *
 * The dev service worker is not active (`npm run dev` has no devOptions), so
 * the spec asserts the cache CONTENTS (the orchestrator works without a SW);
 * offline serving is covered by the production-build check.
 *
 * The seeded file's url points at a same-origin asset so the download
 * succeeds; the derived transform URLs 404 on the dev server (they are
 * Uploadcare transforms), so only the original URL is asserted.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? `e2e-offline-files-${Date.now()}@test.ch`
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const E2E_PROJECT_ID = '61000000-0000-7000-8000-000000000001'
const E2E_PLACE_LEVEL_ID = '61000000-0000-7000-8000-000000000002'
const E2E_SUBPROJECT_ID = '61000000-0000-7000-8000-000000000003'
const E2E_PLACE_ID = '61000000-0000-7000-8000-000000000004'
const E2E_FILE_ID = '61000000-0000-7000-8000-000000000005'
// same-origin: the page can fetch it (and the orchestrator cache.put it).
// The dev stack serves plain http — an https url would fail TLS and never
// be cached
const E2E_FILE_URL = 'http://localhost:5176/icon_192.png'

const FILES_URL = `/data/projects/${E2E_PROJECT_ID}/subprojects/${E2E_SUBPROJECT_ID}/places/${E2E_PLACE_ID}/files`

const cacheKeys = async (page: import('@playwright/test').Page) =>
  page.evaluate(async () => {
    if (!('caches' in window)) return []
    return (await (await caches.open('offline-files')).keys()).map(
      (request) => request.url,
    )
  })

async function ensureE2eData() {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Offline Files',
  })

  await ensureProjectFixture({
    projectId: E2E_PROJECT_ID,
    projectName: 'e2e_offline_files_project',
    placeLevelId: E2E_PLACE_LEVEL_ID,
    subprojectId: E2E_SUBPROJECT_ID,
    subprojectName: 'e2e_offline_files_subproject',
    placeId: E2E_PLACE_ID,
    placeName: 'e2e offline files population',
  })

  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: E2E_PROJECT_ID,
    role: 'write-all',
    subprojectIds: [E2E_SUBPROJECT_ID],
    placeIds: [E2E_PLACE_ID],
  })

  psql(`
    SET electric.syncing TO 'true';

    -- the feature gate: without it no marking UI shows and nothing caches
    UPDATE projects SET files_offline = TRUE WHERE project_id = '${E2E_PROJECT_ID}';

    INSERT INTO files (file_id, project_id, place_id, name, url, uuid, size)
    VALUES ('${E2E_FILE_ID}', '${E2E_PROJECT_ID}', '${E2E_PLACE_ID}', 'e2e offline file', '${E2E_FILE_URL}', '${E2E_FILE_ID}', 1000)
    ON CONFLICT (file_id) DO NOTHING;

    -- heal seeds from earlier runs (the row is created once, its url
    -- must always match what this run expects)
    UPDATE files SET url = '${E2E_FILE_URL}', offline = FALSE WHERE file_id = '${E2E_FILE_ID}';
  `)
}

test.describe('offline files', () => {
  test('a text/plain attachment previews and downloads its original contents', async ({ page }) => {
    await ensureE2eData()
    const id = '61000000-0000-7000-8000-000000000006'
    const url = 'http://localhost:5176/e2e-attachments/text.txt'
    psql(`SET electric.syncing TO 'true';
      INSERT INTO files (file_id, project_id, name, url, uuid, mimetype, size)
      VALUES ('${id}', '${E2E_PROJECT_ID}', 'text.txt', '${url}', '${id}', 'text/plain', 4)
      ON CONFLICT DO NOTHING;`)
    await page.route(url, route => route.fulfill({ contentType: 'text/plain', body: 'text' }))
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await page.goto(`/data/projects/${E2E_PROJECT_ID}/files/${id}/preview?panes=data`)
    await expect(page.getByText('text', { exact: true })).toBeVisible({ timeout: 60_000 })
    const formUrl = `/data/projects/${E2E_PROJECT_ID}/files/${id}?panes=data`
    await page.goto(formUrl)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Download file|Datei herunterladen/i }).click(),
    ])
    expect(download.suggestedFilename()).toBe('text.txt')
    expect(await readFile(await download.path(), 'utf8')).toBe('text')
    await expect(page).toHaveURL(formUrl)
  })

  test('a marked file is cached and unmarking frees it again', async ({
    page,
  }) => {
    await ensureE2eData()
    await login(page, E2E_EMAIL, E2E_PASSWORD)

    await page.goto(FILES_URL)
    await expect(page.getByText('e2e offline file')).toBeVisible({
      timeout: 60_000,
    })

    // open the file form and mark it offline
    await page.getByText('e2e offline file').click()
    // the toggle's title contains 'offline' in both states and locales
    const toggle = page.locator('.form-header button[title*="offline" i][aria-pressed]')
    await toggle.click()

    // the local mark triggers the manager: the file lands in the cache
    await expect
      .poll(() => cacheKeys(page), { timeout: 30_000 })
      .toContain(E2E_FILE_URL)

    const serverState = () => psql(`SELECT offline::text || ':' || updated_at::text FROM files WHERE file_id = '${E2E_FILE_ID}'`)
    await expect.poll(serverState, { timeout: 30_000 }).toMatch(/^true:/)
    const before = serverState()
    // Both handlers see the same rendered props. Two clicks must still
    // toggle twice, and sync the final mark rather than the stale value.
    await toggle.evaluate((button: HTMLButtonElement) => { button.click(); button.click() })
    await expect.poll(() => {
      const state = serverState()
      return state !== before && state.startsWith('true:')
    }, { timeout: 30_000 }).toBe(true)

    await toggle.click()
    await expect
      .poll(() => cacheKeys(page), { timeout: 30_000 })
      .toEqual([])
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(serverState, { timeout: 30_000 }).toMatch(/^false:/)
  })

  test('the table flag caches all files of the table', async ({ page }) => {
    await login(page, E2E_EMAIL, E2E_PASSWORD)
    await page.goto(FILES_URL)
    await expect(page.getByText('e2e offline file')).toBeVisible({
      timeout: 60_000,
    })

    // designer-level switch: all files of places on level 1 become offline
    psql(`SET electric.syncing TO 'true';
      UPDATE place_levels SET place_files_offline = TRUE WHERE place_level_id = '${E2E_PLACE_LEVEL_ID}';
      SET electric.syncing TO DEFAULT;`)
    await expect
      .poll(() => cacheKeys(page), { timeout: 30_000 })
      .toContain(E2E_FILE_URL)

    // flag off: the space is freed again
    psql(`SET electric.syncing TO 'true';
      UPDATE place_levels SET place_files_offline = FALSE WHERE place_level_id = '${E2E_PLACE_LEVEL_ID}';
      SET electric.syncing TO DEFAULT;`)
    await expect
      .poll(() => cacheKeys(page), { timeout: 30_000 })
      .toEqual([])
  })

  // regression: the delete used to queue its operation with table "file"
  // (singular), which observeOperations drops as an unknown table — the row
  // vanished locally but survived on the server, reappearing on the next
  // shape re-snapshot
  test('deleting a file syncs to the server and navigates back to the list', async ({
    page,
  }) => {
    await ensureE2eData()
    await login(page, E2E_EMAIL, E2E_PASSWORD)

    await page.goto(FILES_URL)
    await page.getByText('e2e offline file').click()

    // the trash button in the file's header opens a confirm menu
    const fileHeader = page.locator('.form-header').filter({
      has: page.getByRole('button', { name: /offline/i }),
    })
    await fileHeader
      .getByRole('button', { name: /^(löschen|delete)$/i })
      .click()
    await page.getByRole('menuitem', { name: /^(ja|yes)$/i }).click()

    // back up to the files list
    await expect(page).toHaveURL(new RegExp(`${E2E_PLACE_ID}/files$`))
    await expect(page.getByText('e2e offline file')).toBeHidden()

    // the operation must reach Postgres (flushes after the ~5s row debounce)
    await expect
      .poll(
        () =>
          psql(
            `SELECT count(*) FROM files WHERE file_id = '${E2E_FILE_ID}'`,
          ),
        { timeout: 30_000 },
      )
      .toBe('0')
  })
})
