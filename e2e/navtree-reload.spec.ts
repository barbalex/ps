import { execFileSync } from 'node:child_process'
import { test, expect, type Page } from '@playwright/test'

/**
 * Reproduction spec for the "nav tree broken after reload on a deep url" bug:
 * 1. the "Syncing with server" toast stays visible for a very long time
 * 2. the nav tree only renders its top layer (Projects, Users, Quality
 *    controls...) instead of opening the tree at the active url
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-navtree2@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'
const SUBPROJECT_ID = '018cfd27-ee92-7000-b678-e75497d6c60e'
const PLACE_ID = '018df4fa-cfb3-739c-bca2-d55dfe876995'
const PLACE_2_ID = '018e0a2f-3946-7918-80bb-69aba1c20f6d'
const URL = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/${PLACE_ID}/places/${PLACE_2_ID}`

const psql = (query: string): string =>
  execFileSync(
    'docker',
    ['exec', 'ps_db', 'psql', '-U', 'postgres', '-d', 'ps', '-Atc', query],
    { encoding: 'utf-8' },
  ).trim()

async function ensureE2eData() {
  let userId = psql(`SELECT user_id FROM users WHERE email = '${E2E_EMAIL}'`)
  if (!userId) {
    const res = await fetch('http://localhost:3003/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5176',
      },
      body: JSON.stringify({
        email: E2E_EMAIL,
        password: E2E_PASSWORD,
        name: 'E2E Navtree Test',
      }),
    })
    if (!res.ok && res.status !== 422) {
      console.log(`sign-up failed: ${res.status} ${await res.text()}`)
    }
    userId = psql(`SELECT user_id FROM users WHERE email = '${E2E_EMAIL}'`)
  }
  if (!userId) throw new Error(`e2e user ${E2E_EMAIL} not found in dev db`)

  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO project_users (project_id, email, auth_user_id)
    VALUES ('${PROJECT_ID}', '${E2E_EMAIL}', '${userId}')
    ON CONFLICT (project_id, email) DO NOTHING;

    INSERT INTO project_roles (project_id, project_user_id, role)
    SELECT '${PROJECT_ID}', project_user_id, 'write-all'
    FROM project_users
    WHERE project_id = '${PROJECT_ID}' AND email = '${E2E_EMAIL}'
    ON CONFLICT DO NOTHING;

    INSERT INTO subproject_roles (subproject_id, project_user_id, role)
    SELECT '${SUBPROJECT_ID}', project_user_id, 'write-all'
    FROM project_users
    WHERE project_id = '${PROJECT_ID}' AND email = '${E2E_EMAIL}'
    ON CONFLICT DO NOTHING;

    INSERT INTO place_roles (place_id, project_user_id, role)
    SELECT p.place_id, pu.project_user_id, 'write-all'
    FROM project_users pu
    CROSS JOIN (VALUES
      ('${PLACE_ID}'::uuid),
      ('${PLACE_2_ID}'::uuid)
    ) AS p(place_id)
    WHERE pu.project_id = '${PROJECT_ID}' AND pu.email = '${E2E_EMAIL}'
    ON CONFLICT DO NOTHING;
  `)
}

const treeState = (page: Page) =>
  page.evaluate(() => {
    const treeLinks = Array.from(document.querySelectorAll('a[class*="contentLink"]'))
      .map((a) => (a.textContent ?? '').trim())
    const raw = localStorage.getItem('treeOpenNodesAtom')
    let openNodes: string[][] = []
    try {
      openNodes = raw ? JSON.parse(raw) : []
    } catch {
      openNodes = []
    }
    return {
      treeLinks,
      openNodesCount: openNodes.length,
      hasProjectsOpen: openNodes.some((n) => n.join('/') === 'data/projects'),
      openNodes: openNodes.map((n) => n.join('>')).slice(0, 12),
      bootTrace: Array.from(document.querySelectorAll('body > div > div'))
        .map((d) => d.textContent)
        .find((t) => t?.includes('beforeLoad'))
        ?.slice(0, 300),
    }
  })

test.describe('nav tree after reload on deep url', () => {
  test('tree opens at active url after reload', async ({ page }) => {
    test.setTimeout(300_000)
    await ensureE2eData()
    const testStart = Date.now()

    const consoleLines: string[] = []
    page.on('console', (msg) => {
      const line = `[+${Date.now() - testStart}ms][${msg.type()}] ${msg.text().slice(0, 220)}`
      consoleLines.push(line)
      console.log(line)
    })
    page.on('pageerror', (err) => {
      const line = `[PAGEERROR] ${err.name}: ${err.message}`
      consoleLines.push(line)
      console.log(line)
    })

    // login through the real UI
    await page.goto('/auth')
    await page.fill('#email', E2E_EMAIL)
    await page.fill('#password', E2E_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/data/projects**', { timeout: 120_000 })

    // go to the deep url (first visit: initial sync)
    const firstLoadStart = Date.now()
    await page.goto(URL)
    await expect(
      page.locator('span[class*="contentLabel"]', {
        hasText: '01.01 first.first',
      }),
    ).toBeVisible({ timeout: 180_000 })
    console.log(`first load: tree complete after ${Date.now() - firstLoadStart}ms`)

    // RELOAD — the actual bug scenario
    const reloadStart = Date.now()
    await page.reload({ waitUntil: 'commit' })

    // poll state transitions for up to 60s
    let lastState = ''
    const t0 = Date.now()
    while (Date.now() - t0 < 60_000) {
      const state = await treeState(page).catch(() => null)
      if (state) {
        const key = JSON.stringify([
          state.treeLinks,
          state.openNodesCount,
          state.hasProjectsOpen,
        ])
        if (key !== lastState) {
          console.log(
            `+${Date.now() - reloadStart}ms openNodes=${state.openNodesCount} hasProjectsOpen=${state.hasProjectsOpen} tree=${JSON.stringify(state.treeLinks)}`,
          )
          if (state.bootTrace) console.log(`  boot: ${state.bootTrace}`)
          lastState = key
        }
      }
      const done = await page
        .locator('span[class*="contentLabel"]', {
          hasText: '01.01 first.first',
        })
        .isVisible()
        .catch(() => false)
      if (done) {
        console.log(`reload: tree complete after ${Date.now() - reloadStart}ms`)
        break
      }
      await page.waitForTimeout(500)
    }

    console.log('--- console output ---')
    for (const line of consoleLines) console.log(line)

    // final assertions
    await expect(
      page.locator('span[class*="contentLabel"]', {
        hasText: '01.01 first.first',
      }),
    ).toBeVisible({ timeout: 5_000 })
  })
})
