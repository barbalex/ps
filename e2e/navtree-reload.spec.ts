import { test, expect, type Page } from '@playwright/test'
import { ensureUser, grantRoles, login } from './helpers.ts'

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

async function ensureE2eData() {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Navtree Test',
  })

  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'write-all',
    subprojectIds: [SUBPROJECT_ID],
    placeIds: [PLACE_ID, PLACE_2_ID],
  })
}

const treeState = (page: Page) =>
  page.evaluate(() => {
    const treeLinks = Array.from(
      document.querySelectorAll('a[class*="contentLink"]'),
    ).map((a) => (a.textContent ?? '').trim())
    const raw = localStorage.getItem('treeOpenNodesAtom')
    let openNodes: string[][]
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
    await login(page, E2E_EMAIL, E2E_PASSWORD)

    // go to the deep url (first visit: initial sync)
    const firstLoadStart = Date.now()
    await page.goto(URL)
    await expect(
      page.locator('span[class*="contentLabel"]', {
        hasText: '01.01 first.first',
      }),
    ).toBeVisible({ timeout: 180_000 })
    console.log(
      `first load: tree complete after ${Date.now() - firstLoadStart}ms`,
    )

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
