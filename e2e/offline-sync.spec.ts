import { test, expect } from '@playwright/test'
import {
  psql,
  ensureUser,
  grantRoles,
  ensureProjectFixture,
  login,
} from './helpers.ts'

/**
 * The one offline-sync smoke test.
 *
 * Requires the local dev stack to be running:
 *   - backend-dev docker compose (db, electric, postgrest, auth)
 *   - vite + caddy dev server on :5176 (started automatically if missing)
 *
 * Proves the critical path: an edit made while offline is written to the
 * local PGlite, queued as an operation, and reconciled to the server via
 * ElectricSQL once back online — and survives a reload.
 *
 * Uses its own tiny project (not the large demo project) so the
 * initial sync stays fast.
 */

// A fresh user per run: every electric shape is then created new
// (unique where-params). Re-attaching a fresh browser to shape handles
// left over from a previous session serves "up-to-date" without the
// initial snapshot — a real new user never hits that path.
const E2E_EMAIL = process.env.E2E_EMAIL ?? `e2e-${Date.now()}@test.ch`
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const DEMO_PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'

const E2E_PROJECT_ID = '60000000-0000-7000-8000-000000000001'
const E2E_PLACE_LEVEL_ID = '60000000-0000-7000-8000-000000000004'
const E2E_SUBPROJECT_ID = '60000000-0000-7000-8000-000000000002'
const E2E_PLACE_ID = '60000000-0000-7000-8000-000000000003'

async function ensureE2eData() {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Test',
  })

  // keep the sync small: only the e2e project, not the demo project
  psql(`
    SET electric.syncing TO 'true';
    DELETE FROM project_users
    WHERE email = '${E2E_EMAIL}' AND project_id = '${DEMO_PROJECT_ID}';
  `)

  await ensureProjectFixture({
    projectId: E2E_PROJECT_ID,
    projectName: 'e2e_project',
    placeLevelId: E2E_PLACE_LEVEL_ID,
    subprojectId: E2E_SUBPROJECT_ID,
    subprojectName: 'e2e_subproject',
    placeId: E2E_PLACE_ID,
    placeName: 'e2e population',
  })

  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: E2E_PROJECT_ID,
    role: 'write-all',
    subprojectIds: [E2E_SUBPROJECT_ID],
    placeIds: [E2E_PLACE_ID],
  })
}

test.describe('offline sync', () => {
  test('an offline edit syncs to the server after reconnecting', async ({
    page,
    context,
  }) => {
    await ensureE2eData()

    const url = `/data/projects/${E2E_PROJECT_ID}/subprojects/${E2E_SUBPROJECT_ID}/places/${E2E_PLACE_ID}/place`
    const originalName = psql(
      `SELECT name FROM places WHERE place_id = '${E2E_PLACE_ID}'`,
    )

    // 1. login through the real UI
    await login(page, E2E_EMAIL, E2E_PASSWORD)

    // 2. open the population (first launch builds the local database + initial sync)
    await page.goto(url)
    const nameField = page.locator('input[name="name"]')
    await expect(nameField).toBeVisible({ timeout: 180_000 })
    await expect(nameField).toHaveValue(originalName)

    // 3. go offline and edit
    // (Fluent TextField commits on blur — Tab out of the field to save)
    const newName = `e2e-offline-${Date.now()}`
    await context.setOffline(true)
    await nameField.fill(newName)
    await page.keyboard.press('Tab')
    // the field is the assertion surface while offline
    await expect(nameField).toHaveValue(newName)

    // 4. go back online and wait for ElectricSQL to reconcile to Postgres
    await context.setOffline(false)
    await expect
      .poll(
        () =>
          psql(`SELECT name FROM places WHERE place_id = '${E2E_PLACE_ID}'`),
        { timeout: 90_000, message: 'offline edit never reached the server' },
      )
      .toBe(newName)

    // 5. reload: the edit must survive a fresh app boot
    await page.goto(url)
    const nameFieldAfterReload = page.locator('input[name="name"]')
    await expect(nameFieldAfterReload).toBeVisible({ timeout: 120_000 })
    await expect(nameFieldAfterReload).toHaveValue(newName)

    // restore the fixture (bypasses write triggers like electric would)
    psql(
      `SET electric.syncing TO 'true'; UPDATE places SET name = '${originalName}' WHERE place_id = '${E2E_PLACE_ID}'`,
    )
  })
})
