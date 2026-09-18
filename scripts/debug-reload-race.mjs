// Temporary diagnostic: watch local PGlite row counts across a reload
// to catch a truncate/refill race and dump duplicated rows.
import { execFileSync } from 'node:child_process'
import { chromium } from '@playwright/test'

const EMAIL = `e2e-race-${Date.now()}@test.ch`
const PASSWORD = 'e2e-test-password-123'
const PROJECT_ID = '60000000-0000-7000-8000-000000000031'
const PLACE_LEVEL_ID = '60000000-0000-7000-8000-000000000034'
const SUBPROJECT_ID = '60000000-0000-7000-8000-000000000032'
const PLACE_ID = '60000000-0000-7000-8000-000000000033'
const URL = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/${PLACE_ID}/place`

const psql = (q) =>
  execFileSync('docker', [
    'exec', 'ps_db', 'psql', '-U', 'postgres', '-d', 'ps', '-Atc', q,
  ], { encoding: 'utf-8' }).trim()

// provision
const res = await fetch('http://localhost:3003/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5176' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'Race Test' }),
})
console.log('signup:', res.status)
const userId = psql(`SELECT user_id FROM users WHERE email = '${EMAIL}'`)
psql(`
  SET electric.syncing TO 'true';
  INSERT INTO projects (project_id, name) VALUES ('${PROJECT_ID}', 'race_project') ON CONFLICT DO NOTHING;
  INSERT INTO place_levels (place_level_id, project_id, level, name_singular_de, name_plural_de) VALUES ('${PLACE_LEVEL_ID}', '${PROJECT_ID}', 1, 'Population', 'Populationen') ON CONFLICT DO NOTHING;
  INSERT INTO subprojects (subproject_id, project_id, name) VALUES ('${SUBPROJECT_ID}', '${PROJECT_ID}', 'race_subproject') ON CONFLICT DO NOTHING;
  INSERT INTO places (place_id, subproject_id, level, name) VALUES ('${PLACE_ID}', '${SUBPROJECT_ID}', 1, 'race population') ON CONFLICT DO NOTHING;
  INSERT INTO project_users (project_id, email, auth_user_id) VALUES ('${PROJECT_ID}', '${EMAIL}', '${userId}') ON CONFLICT (project_id, email) DO NOTHING;
  INSERT INTO project_roles (project_id, project_user_id, role) SELECT '${PROJECT_ID}', project_user_id, 'write-all' FROM project_users WHERE project_id = '${PROJECT_ID}' AND email = '${EMAIL}' ON CONFLICT DO NOTHING;
  INSERT INTO subproject_roles (subproject_id, project_user_id, role) SELECT '${SUBPROJECT_ID}', project_user_id, 'write-all' FROM project_users WHERE project_id = '${PROJECT_ID}' AND email = '${EMAIL}' ON CONFLICT DO NOTHING;
  INSERT INTO place_roles (place_id, project_user_id, role) SELECT '${PLACE_ID}', project_user_id, 'write-all' FROM project_users WHERE project_id = '${PROJECT_ID}' AND email = '${EMAIL}' ON CONFLICT DO NOTHING;
`)
console.log('provisioned', EMAIL, userId)

const browser = await chromium.launch()
const ctx = await browser.newContext({ ignoreHTTPSErrors: true })
const page = await ctx.newPage()
page.on('console', (m) => {
  const t = m.type()
  if (t === 'error' || t === 'warning' || m.text().includes('ync'))
    console.log(`[p.${t}] ${m.text().slice(0, 200)}`)
})
page.on('pageerror', (e) => console.log(`[PAGEERROR] ${e.message}`))

const counts = () =>
  page.evaluate(async () => {
    const db = window.__pglite_db__
    if (!db) return { error: 'no db yet' }
    const out = {}
    for (const t of ['projects', 'subprojects', 'places', 'project_users', 'place_roles']) {
      try {
        out[t] = (await db.query(`SELECT count(*)::int AS c FROM ${t}`)).rows[0].c
      } catch (e) { out[t] = String(e).slice(0, 80) }
    }
    return out
  })

const watch = async (label, ms) => {
  const t0 = Date.now()
  let last = ''
  while (Date.now() - t0 < ms) {
    const c = await counts()
    const s = JSON.stringify(c)
    if (s !== last) {
      console.log(`${label} +${Date.now() - t0}ms ${s}`)
      last = s
    }
    await page.waitForTimeout(300)
  }
}

// login
await page.goto('http://localhost:5176/auth')
await page.fill('#email', EMAIL)
await page.fill('#password', PASSWORD)
await page.click('button[type="submit"]')
await page.waitForURL('**/data/projects**', { timeout: 120000 })
await page.goto('http://localhost:5176' + URL)
await page.locator('input[name="name"]').waitFor({ timeout: 180000 })
console.log('LOGIN PHASE: form visible')
await watch('login', 5000)

// dump duplicated rows for inspection
const dupeRows = await page.evaluate(async () => {
  const db = window.__pglite_db__
  return {
    project_users: (await db.query('SELECT project_user_id, project_id, email, auth_user_id FROM project_users')).rows,
    place_roles: (await db.query('SELECT place_role_id, place_id, project_user_id, role FROM place_roles')).rows,
    projects: (await db.query('SELECT project_id, name FROM projects')).rows,
  }
})
console.log('rows after login:', JSON.stringify(dupeRows, null, 1))

// reload and watch closely
await page.reload({ waitUntil: 'commit' })
await watch('reload1', 60000)
try {
  await page.locator('input[name="name"]').waitFor({ timeout: 10000 })
  console.log('RELOAD1: form visible')
} catch {
  console.log('RELOAD1: form MISSING')
  await page.screenshot({ path: 'test-results/race-reload1.png', fullPage: true })
  const body = await page.evaluate(() => document.body.innerText.slice(0, 600))
  console.log('body:', JSON.stringify(body))
}

await browser.close()
