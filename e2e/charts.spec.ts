import { execFileSync } from 'node:child_process'
import { test, expect } from '@playwright/test'

/**
 * Charts end-to-end against the apflora demo data (Aldrovanda vesiculosa):
 * 1. "(kontrollierte) Teil-Populationen" — count_rows on places/checks
 * 2. "Populationen nach Status" — count_rows_by_distinct_field_values
 * 3. "'Triebe total' nach Populationen" — sum_values_of_field on check_taxa
 *
 * The charts, subjects and the e2e user's read roles are (re-)created
 * idempotently in the dev database before the browser runs.
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-charts@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

const PROJECT_ID = '0195a101-0000-7000-8000-000000000001'
const SUBPROJECT_ID = '12496da4-f3ce-79b9-87cf-c6e85bb6722c' // Aldrovanda
const UNIT_TRIEBE_TOTAL = '935432b9-fc64-7118-8167-06f985ea181f'

const CHART_TPOPS = 'a1000000-0000-4000-8000-000000000001'
const CHART_STATUS = 'a2000000-0000-4000-8000-000000000002'
const CHART_TRIEBE = 'a3000000-0000-4000-8000-000000000003'

const psql = (query: string): string =>
  execFileSync(
    'docker',
    ['exec', 'ps_db', 'psql', '-U', 'postgres', '-d', 'ps', '-Atc', query],
    { encoding: 'utf8' },
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
        name: 'E2E Charts Test',
      }),
    })
    if (!res.ok && res.status !== 422) {
      console.log(`sign-up failed: ${res.status} ${await res.text()}`)
    }
    psql(`UPDATE users SET email_verified = TRUE WHERE email = '${E2E_EMAIL}'`)
    userId = psql(`SELECT user_id FROM users WHERE email = '${E2E_EMAIL}'`)
  }
  if (!userId) throw new Error(`e2e user ${E2E_EMAIL} not found in dev db`)

  execFileSync(
    'docker',
    [
      'exec',
      '-i',
      'ps_db',
      'psql',
      '-U',
      'postgres',
      '-d',
      'ps',
      '-v',
      'ON_ERROR_STOP=1',
    ],
    {
      encoding: 'utf8',
      input: `
BEGIN;
SET LOCAL electric.syncing TO 'true';

INSERT INTO project_users (project_id, email, auth_user_id)
VALUES ('${PROJECT_ID}', '${E2E_EMAIL}', '${userId}')
ON CONFLICT (project_id, email) DO NOTHING;

INSERT INTO project_roles (project_id, project_user_id, role)
SELECT '${PROJECT_ID}', project_user_id, 'read-all'
FROM project_users
WHERE project_id = '${PROJECT_ID}' AND email = '${E2E_EMAIL}'
ON CONFLICT DO NOTHING;

INSERT INTO subproject_roles (subproject_id, project_user_id, role)
SELECT '${SUBPROJECT_ID}', project_user_id, 'read-all'
FROM project_users
WHERE project_id = '${PROJECT_ID}' AND email = '${E2E_EMAIL}'
ON CONFLICT DO NOTHING;

-- the places shape only streams places the user has a place_roles row for
INSERT INTO place_roles (place_id, project_user_id, role)
SELECT p.place_id, pu.project_user_id, 'read-all'
FROM project_users pu
JOIN places p ON p.subproject_id = '${SUBPROJECT_ID}'
WHERE pu.project_id = '${PROJECT_ID}' AND pu.email = '${E2E_EMAIL}'
ON CONFLICT DO NOTHING;

INSERT INTO charts (chart_id, project_id, subproject_id, name, years_since, subjects_stacked) VALUES
  ('${CHART_TPOPS}', '${PROJECT_ID}', '${SUBPROJECT_ID}', '(kontrollierte) Teil-Populationen', 2014, false),
  ('${CHART_STATUS}', '${PROJECT_ID}', '${SUBPROJECT_ID}', 'Populationen nach Status', 2014, true),
  ('${CHART_TRIEBE}', '${PROJECT_ID}', '${SUBPROJECT_ID}', '"Triebe total" nach Populationen', 2014, true)
ON CONFLICT (chart_id) DO NOTHING;

INSERT INTO chart_subjects (chart_subject_id, chart_id, table_name, table_level, calc_method, field, value_unit, name, sort, fill_graded) VALUES
  ('b1000000-0000-4000-8000-000000000001', '${CHART_TPOPS}', 'places', '2', 'count_rows', NULL, NULL, 'Teil-Populationen', 1, false),
  ('b2000000-0000-4000-8000-000000000002', '${CHART_TPOPS}', 'checks', '2', 'count_rows', NULL, NULL, 'kontrollierte Teil-Populationen', 2, false),
  ('b3000000-0000-4000-8000-000000000003', '${CHART_STATUS}', 'places', '1', 'count_rows_by_distinct_field_values', 'status', NULL, 'Status', 1, false),
  ('b4000000-0000-4000-8000-000000000004', '${CHART_TRIEBE}', 'check_taxa', '1', 'sum_values_of_field', 'quantity_numeric', '${UNIT_TRIEBE_TOTAL}', 'Triebe total', 1, false)
ON CONFLICT (chart_subject_id) DO NOTHING;
COMMIT;
`,
    },
  )
}

test.describe('charts from apflora demo data', () => {
  test('renders the three yearly-report charts', async ({ page }) => {
    test.setTimeout(420_000)
    await ensureE2eData()

    await page.goto('/auth')
    await page.fill('#email', E2E_EMAIL)
    await page.fill('#password', E2E_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/data/projects**', { timeout: 120_000 })

    // wait until the tables the charts read from hold the demo data
    await expect
      .poll(
        async () =>
          page.evaluate(async (subprojectId) => {
            const db = window.__pglite_db__
            if (!db) return false
            try {
              const places = await db.query(
                `select count(*)::int as n from places where subproject_id = '${subprojectId}'`,
              )
              const taxa = await db.query(
                `select count(*)::int as n from check_taxa cq
                 join checks c using (check_id)
                 join places p on c.place_id = p.place_id
                 where p.subproject_id = '${subprojectId}'`,
              )
              return places.rows[0].n >= 135 && taxa.rows[0].n >= 150
            } catch {
              return false
            }
          }, SUBPROJECT_ID),
        { timeout: 300_000, intervals: [2_000] },
      )
      .toBe(true)

    const base = `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/charts`

    // 1. two lines: existing and checked subpopulations per year
    await page.goto(`${base}/${CHART_TPOPS}/chart`)
    await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.locator('.recharts-legend-item-text')).toHaveText(
      ['Teil-Populationen', 'kontrollierte Teil-Populationen'],
      { timeout: 30_000 },
    )

    // 2. one stacked series per status value
    await page.goto(`${base}/${CHART_STATUS}/chart`)
    await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible({
      timeout: 60_000,
    })
    await expect(
      page.locator('.recharts-legend-item-text', {
        hasText: 'angesiedelt, aktuell',
      }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(
      page.locator('.recharts-legend-item-text', {
        hasText: 'ursprünglich, erloschen',
      }),
    ).toBeVisible()

    // 3. one stacked series per population with counted shoots
    await page.goto(`${base}/${CHART_TRIEBE}/chart`)
    await expect(page.locator('.recharts-wrapper svg').first()).toBeVisible({
      timeout: 60_000,
    })
    await expect(
      page.locator('.recharts-legend-item-text', {
        hasText: 'Mettmenhaslisee',
      }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(
      page
        .locator('.recharts-legend-item-text', { hasText: 'Hänsiried' })
        .first(),
    ).toBeVisible()
  })
})
