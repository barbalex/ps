import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { test, expect, type Page } from '@playwright/test'

/**
 * TEMPORARY reproduction spec for the "second reload crashes" bug.
 * Scenario: fresh user, initial login works, first reload works,
 * second reload crashes. Captures console output, page errors and
 * boot diagnostics for every phase.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? `e2e-crash-${Date.now()}@test.ch`
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const E2E_PROJECT_ID = '60000000-0000-7000-8000-000000000021'
const E2E_PLACE_LEVEL_ID = '60000000-0000-7000-8000-000000000024'
const E2E_SUBPROJECT_ID = '60000000-0000-7000-8000-000000000022'
const E2E_PLACE_ID = '60000000-0000-7000-8000-000000000023'

const LOG_LINES: string[] = []
const log = (line: string) => {
  LOG_LINES.push(line)
  console.log(line)
}

const psql = (query: string): string =>
  execFileSync(
    'docker',
    ['exec', 'ps_db', 'psql', '-U', 'postgres', '-d', 'ps', '-Atc', query],
    { encoding: 'utf-8' },
  ).trim()

async function ensureE2eData() {
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
        name: 'E2E Crash Test',
      }),
    })
    if (!res.ok && res.status !== 422) {
      log(`sign-up attempt failed: ${res.status} ${await res.text()}`)
    }
    userId = psql(`SELECT user_id FROM users WHERE email = '${E2E_EMAIL}'`)
  }
  if (!userId) throw new Error(`e2e user ${E2E_EMAIL} not found in dev db`)

  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO projects (project_id, name)
    VALUES ('${E2E_PROJECT_ID}', 'e2e_crash_project')
    ON CONFLICT DO NOTHING;

    INSERT INTO place_levels (
      place_level_id, project_id, level, name_singular_de, name_plural_de
    )
    VALUES (
      '${E2E_PLACE_LEVEL_ID}', '${E2E_PROJECT_ID}', 1, 'Population', 'Populationen'
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO subprojects (subproject_id, project_id, name)
    VALUES ('${E2E_SUBPROJECT_ID}', '${E2E_PROJECT_ID}', 'e2e_crash_subproject')
    ON CONFLICT DO NOTHING;

    INSERT INTO places (place_id, subproject_id, level, name)
    VALUES ('${E2E_PLACE_ID}', '${E2E_SUBPROJECT_ID}', 1, 'e2e crash population')
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

const dbCounts = async (page: Page) => {
  const counts = await page.evaluate(async () => {
    const db = (
      window as unknown as {
        __pglite_db__?: {
          query: (sql: string) => Promise<{ rows: unknown[] }>
        }
      }
    ).__pglite_db__
    if (!db) return { error: 'no __pglite_db__ on window' }
    const tables = [
      'projects',
      'subprojects',
      'places',
      'place_levels',
      'project_users',
      'project_roles',
      'subproject_roles',
      'place_roles',
      'users',
    ]
    const out: Record<string, number | string> = {}
    for (const t of tables) {
      try {
        const res = await db.query(`SELECT count(*)::int AS c FROM ${t}`)
        out[t] = (res.rows[0] as { c: number }).c
      } catch (e) {
        out[t] = String(e)
      }
    }
    return out
  })
  return counts
}

type Phase = 'login' | 'reload1' | 'reload2'

test.describe('reload crash reproduction', () => {
  test('initial login, then two reloads', async ({ page }) => {
    test.setTimeout(420_000)
    await ensureE2eData()

    const url = `/data/projects/${E2E_PROJECT_ID}/subprojects/${E2E_SUBPROJECT_ID}/places/${E2E_PLACE_ID}/place`
    const pageErrors: string[] = []
    const failedRequests: string[] = []

    page.on('console', (msg) => {
      log(`[console.${msg.type()}] ${msg.text().slice(0, 400)}`)
    })
    page.on('pageerror', (err) => {
      const line = `PAGEERROR ${err.name}: ${err.message}\n${(err.stack ?? '').slice(0, 1200)}`
      pageErrors.push(line)
      log(line)
    })
    page.on('requestfailed', (req) => {
      const line = `REQFAIL ${req.method()} ${req.url().slice(0, 160)} — ${req.failure()?.errorText}`
      // live streams being aborted on navigation are expected noise
      if (!req.url().includes('/v1/shape')) {
        failedRequests.push(line)
        log(line)
      }
    })
    page.on('response', (res) => {
      if (res.url().includes('/v1/shape') && res.status() >= 400) {
        log(`SHAPE-HTTP ${res.status()} ${res.url().slice(0, 160)}`)
      }
    })

    const dumpDiagnostics = async (phase: Phase) => {
      const flags = await page
        .evaluate(() => ({
          initialSyncing: localStorage.getItem('initialSyncingAtom'),
          sqlInitializing: localStorage.getItem('sqlInitializingAtom'),
          userId: localStorage.getItem('userIdAtom'),
        }))
        .catch((e: unknown) => ({ error: String(e) }))
      log(`=== DIAGNOSTICS ${phase} ===`)
      log(`localStorage flags: ${JSON.stringify(flags)}`)
      log(`pglite counts: ${JSON.stringify(await dbCounts(page))}`)
      log(
        `pageErrors: ${pageErrors.length ? pageErrors.join('\n---\n') : '(none)'}`,
      )
      log(
        `failedRequests: ${failedRequests.length ? failedRequests.join('\n') : '(none)'}`,
      )
      const bodyText = await page
        .evaluate(() => document.body.innerText.slice(0, 800))
        .catch(() => '(evaluate failed)')
      log(`--- body text ---\n${bodyText}`)
    }

    const expectPlaceForm = async (phase: Phase) => {
      try {
        await expect(page.locator('input[name="name"]')).toBeVisible({
          timeout: 120_000,
        })
        log(`=== PHASE ${phase}: OK ===`)
        log(`pglite counts after ${phase}: ${JSON.stringify(await dbCounts(page))}`)
        return true
      } catch {
        log(`=== PHASE ${phase}: FAILED ===`)
        await dumpDiagnostics(phase)
        await page.screenshot({
          path: `test-results/reload-crash-${phase}.png`,
          fullPage: true,
        })
        return false
      }
    }

    // poll local row counts in the background during phase waits
    const watchCounts = async (label: string, ms: number) => {
      const t0 = Date.now()
      let last = ''
      while (Date.now() - t0 < ms) {
        const c = await dbCounts(page).catch((e: unknown) => String(e))
        const s = JSON.stringify(c)
        if (s !== last) {
          log(`watch ${label} +${Date.now() - t0}ms ${s}`)
          last = s
        }
        await page.waitForTimeout(300)
      }
    }

    try {
      // 1. initial login through the real UI
      await page.goto('/auth')
      await page.fill('#email', E2E_EMAIL)
      await page.fill('#password', E2E_PASSWORD)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/data/projects**', { timeout: 120_000 })
      await page.goto(url)
      const loginOk = await expectPlaceForm('login')
      if (!loginOk) throw new Error('initial login phase failed')
      await watchCounts('login', 5_000)

      // 2. first restart
      await page.reload({ waitUntil: 'commit' })
      const reload1Watcher = watchCounts('reload1', 120_000)
      const reload1Ok = await expectPlaceForm('reload1')
      await reload1Watcher

      // 3. second restart
      await page.reload({ waitUntil: 'commit' })
      const reload2Watcher = watchCounts('reload2', 120_000)
      const reload2Ok = await expectPlaceForm('reload2')
      await reload2Watcher

      await dumpDiagnostics('final')
      expect(reload2Ok, 'second reload survived').toBe(true)
      if (!reload1Ok) throw new Error('first reload phase failed')
    } finally {
      writeFileSync(
        'test-results/reload-crash-console.log',
        LOG_LINES.join('\n'),
      )
    }
  })
})
