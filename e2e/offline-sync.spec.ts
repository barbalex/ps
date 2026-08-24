import { execFileSync } from 'node:child_process'
import { test, expect } from '@playwright/test'

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

const psql = (query: string): string =>
  execFileSync(
    'docker',
    ['exec', 'ps_db', 'psql', '-U', 'postgres', '-d', 'ps', '-Atc', query],
    { encoding: 'utf8' },
  ).trim()

/**
 * Provision the e2e user and a minimal dedicated project.
 * Writes impersonate the dev-db owner via JWT claims so the
 * role-inheritance triggers run as they would for a real designer.
 */
async function ensureE2eData() {
  // sign-up (no-op if the user already exists); retry to ride out
  // better-auth rate limits
  let userId = ''
  for (let attempt = 0; attempt < 5 && !userId; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 5_000))
    const res = await fetch('http://localhost:3003/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5176',
      },
      body: JSON.stringify({
        email: E2E_EMAIL,
        password: E2E_PASSWORD,
        name: 'E2E Test',
      }),
    })
    if (!res.ok && res.status !== 422) {
      console.log('sign-up attempt failed:', res.status, await res.text())
    }
    userId = psql(`SELECT user_id FROM users WHERE email = '${E2E_EMAIL}'`)
  }
  if (!userId) throw new Error(`e2e user ${E2E_EMAIL} not found in dev db`)

  psql(`
    -- Build the fixture the way electric sync would write it:
    -- with triggers bypassed, role rows inserted explicitly
    -- (write triggers would deadlock: no role exists on a new project yet)
    SET electric.syncing TO 'true';

    -- keep the sync small: only the e2e project, not the demo project
    DELETE FROM project_users
    WHERE email = '${E2E_EMAIL}' AND project_id = '${DEMO_PROJECT_ID}';

    INSERT INTO projects (project_id, name)
    VALUES ('${E2E_PROJECT_ID}', 'e2e_project')
    ON CONFLICT DO NOTHING;

    INSERT INTO place_levels (
      place_level_id, project_id, level, name_singular_de, name_plural_de
    )
    VALUES (
      '${E2E_PLACE_LEVEL_ID}', '${E2E_PROJECT_ID}', 1, 'Population', 'Populationen'
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO subprojects (subproject_id, project_id, name)
    VALUES ('${E2E_SUBPROJECT_ID}', '${E2E_PROJECT_ID}', 'e2e_subproject')
    ON CONFLICT DO NOTHING;

    INSERT INTO places (place_id, subproject_id, level, name)
    VALUES ('${E2E_PLACE_ID}', '${E2E_SUBPROJECT_ID}', 1, 'e2e population')
    ON CONFLICT DO NOTHING;

    INSERT INTO project_users (project_id, email, auth_user_id)
    VALUES ('${E2E_PROJECT_ID}', '${E2E_EMAIL}', '${userId}')
    ON CONFLICT (project_id, email) DO NOTHING;

    INSERT INTO project_roles (project_id, project_user_id, role)
    SELECT '${E2E_PROJECT_ID}', project_user_id, 'write-all'
    FROM project_users
    WHERE project_id = '${E2E_PROJECT_ID}' AND email = '${E2E_EMAIL}'
    ON CONFLICT DO NOTHING;

    INSERT INTO subproject_roles (subproject_id, project_user_id, role)
    SELECT '${E2E_SUBPROJECT_ID}', project_user_id, 'write-all'
    FROM project_users
    WHERE project_id = '${E2E_PROJECT_ID}' AND email = '${E2E_EMAIL}'
    ON CONFLICT DO NOTHING;

    INSERT INTO place_roles (place_id, project_user_id, role)
    SELECT '${E2E_PLACE_ID}', project_user_id, 'write-all'
    FROM project_users
    WHERE project_id = '${E2E_PROJECT_ID}' AND email = '${E2E_EMAIL}'
    ON CONFLICT DO NOTHING;
  `)
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
    await page.goto('/auth')
    await page.fill('#email', E2E_EMAIL)
    await page.fill('#password', E2E_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/data/projects**')

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
        () => psql(`SELECT name FROM places WHERE place_id = '${E2E_PLACE_ID}'`),
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
