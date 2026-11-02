import { execFileSync } from 'node:child_process'
import { test, expect } from '@playwright/test'

/**
 * Covers the raw-data field list on the observation form
 * (src/formsAndLists/observation/ObservationData):
 * dragging a field row onto another row reorders the list live,
 * and the order persists in localStorage across reloads.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-dnd@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'
const SUBPROJECT_ID = '018cfd27-ee92-7000-b678-e75497d6c60e'
const PLACE_ID = '018df4fa-cfb3-739c-bca2-d55dfe876995'
const OBSERVATION_ID_IN_SOURCE = 'e2e-dnd-test-observation'
// fixed uuid so reruns reuse the same import row
const OBSERVATION_IMPORT_ID = '019e0000-0000-7000-8000-00000000d001'

const FIELD_LABELS = [
  'aaaTestField',
  'bbbTestField',
  'cccTestField',
  'dddTestField',
  'eeeTestField',
]

const data = Object.fromEntries(
  FIELD_LABELS.map((label, i) => [label, `value${i}`]),
)

const psql = (query: string): string =>
  execFileSync(
    'docker',
    ['exec', 'ps_db', 'psql', '-U', 'postgres', '-d', 'ps', '-Atc', query],
    { encoding: 'utf-8' },
  ).trim()

// locator.dragTo() moves the mouse in one hop, which does not reliably start
// a native HTML5 drag — move in small steps instead
async function dragRowOnto(
  page: import('@playwright/test').Page,
  sourceLabel: string,
  targetLabel: string,
  // where on the target row to release: > 0.5 below the middle, < 0.5 above
  yFraction: number,
) {
  const srcBox = await page
    .locator(`[data-field-label="${sourceLabel}"]`)
    .boundingBox()
  const dstBox = await page
    .locator(`[data-field-label="${targetLabel}"]`)
    .boundingBox()
  if (!srcBox || !dstBox) throw new Error('field row not found for drag')

  const srcX = srcBox.x + srcBox.width / 2
  const srcY = srcBox.y + srcBox.height / 2
  const dstX = dstBox.x + dstBox.width / 2
  const dstY = dstBox.y + dstBox.height * yFraction

  await page.mouse.move(srcX, srcY)
  await page.mouse.down()
  const steps = 12
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(
      srcX + (dstX - srcX) * (i / steps),
      srcY + (dstY - srcY) * (i / steps),
    )
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(100)
  await page.mouse.up()
}

async function ensureE2eData(): Promise<string> {
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
        name: 'E2E Field DnD Test',
      }),
    })
    if (!res.ok && res.status !== 422) {
      throw new Error(`sign-up failed: ${res.status} ${await res.text()}`)
    }
    userId = psql(`SELECT user_id FROM users WHERE email = '${E2E_EMAIL}'`)
  }
  if (!userId) throw new Error(`e2e user ${E2E_EMAIL} not found in dev db`)

  // e2e users cannot complete the email-verification OTP flow
  psql(`UPDATE users SET email_verified = TRUE WHERE email = '${E2E_EMAIL}'`)

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
    SELECT '${PLACE_ID}', project_user_id, 'write-all'
    FROM project_users
    WHERE project_id = '${PROJECT_ID}' AND email = '${E2E_EMAIL}'
    ON CONFLICT DO NOTHING;

    -- the electric shape only syncs observations that belong to an
    -- observation_import of one of the user's subprojects
    INSERT INTO observation_imports (observation_import_id, subproject_id, name)
    VALUES ('${OBSERVATION_IMPORT_ID}', '${SUBPROJECT_ID}', 'e2e dnd test import')
    ON CONFLICT (observation_import_id) DO NOTHING;

    DELETE FROM observations WHERE id_in_source = '${OBSERVATION_ID_IN_SOURCE}';

    INSERT INTO observations (place_id, label, id_in_source, observation_import_id, data)
    VALUES (
      '${PLACE_ID}',
      'e2e dnd test observation',
      '${OBSERVATION_ID_IN_SOURCE}',
      '${OBSERVATION_IMPORT_ID}',
      '${JSON.stringify(data)}'::jsonb
    );
  `)

  const observationId = psql(
    `SELECT observation_id FROM observations WHERE id_in_source = '${OBSERVATION_ID_IN_SOURCE}'`,
  )
  if (!observationId) {
    throw new Error('dnd test observation not found after insert')
  }
  return observationId
}

test.describe('observation raw-data field list', () => {
  // single-column layout: the container switches to 2 columns at 1020px
  test.use({ viewport: { width: 900, height: 800 } })

  test('dragging a field reorders the list and survives a reload', async ({
    page,
  }) => {
    test.setTimeout(300_000)

    const observationId = await ensureE2eData()
    const url = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/${PLACE_ID}/observations/${observationId}`

    const pageErrors: string[] = []
    page.on('pageerror', (err) => pageErrors.push(`${err.name}: ${err.message}`))

    // login through the real UI
    await page.goto('/auth')
    await page.fill('#email', E2E_EMAIL)
    await page.fill('#password', E2E_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/data/projects**', { timeout: 120_000 })

    // first visit triggers the initial sync into the local database
    await page.goto(url)
    const fieldRow = (label: string) =>
      page.locator(`[data-field-label="${label}"]`)
    await expect(fieldRow('aaaTestField')).toBeVisible({ timeout: 180_000 })

    const order = async () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-field-label]')).map(
          (el) => el.getAttribute('data-field-label'),
        ),
      )

    // initial order is alphabetical
    await expect.poll(order, { timeout: 10_000 }).toEqual(FIELD_LABELS)

    // drag the first row onto the third row, releasing below its middle
    await dragRowOnto(page, 'aaaTestField', 'cccTestField', 0.8)

    await expect
      .poll(order, { timeout: 10_000 })
      .toEqual(['bbbTestField', 'cccTestField', 'aaaTestField', 'dddTestField', 'eeeTestField'])

    // the order persists across a reload (atomWithStorage with getOnInit)
    await page.reload({ waitUntil: 'commit' })
    await expect(fieldRow('aaaTestField')).toBeVisible({ timeout: 180_000 })
    await expect.poll(order, { timeout: 10_000 }).toEqual([
      'bbbTestField',
      'cccTestField',
      'aaaTestField',
      'dddTestField',
      'eeeTestField',
    ])

    // drag it back onto the first row, releasing above its middle
    await dragRowOnto(page, 'aaaTestField', 'bbbTestField', 0.2)

    await expect.poll(order, { timeout: 10_000 }).toEqual(FIELD_LABELS)

    expect(pageErrors).toEqual([])
  })
})
