import { test, expect } from '@playwright/test'
import { ensureUser, grantRoles, login } from './helpers.ts'

/**
 * Run-page view state is linkable via search params:
 * - the label filter of the qcs/exports run pages (?<page>Label=…)
 * - design mode for the current project (?designing=1)
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-urlrun@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

// apflora demo project (same fixture as the navtree spec)
const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'

test.use({ locale: 'de-DE' })

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Url Run',
  })
  await grantRoles({
    email: E2E_EMAIL,
    userId,
    projectId: PROJECT_ID,
    role: 'design',
  })
})

test('the qcs run label filter round-trips through the url', async ({
  page,
}) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)

  await page.goto('/data/qcs-run')
  const labelInput = page.getByRole('textbox', { name: /Nach Label filtern/i })
  await expect(labelInput).toBeVisible({ timeout: 60_000 })

  await labelInput.fill('apflora')
  await labelInput.press('Enter')

  await expect(page).toHaveURL(/rootQcsRunLabel=apflora/, { timeout: 10_000 })

  // reload keeps the filter (it is in the url)
  await page.reload()
  const labelInput2 = page.getByRole('textbox', { name: /Nach Label filtern/i })
  await expect(labelInput2).toBeVisible({ timeout: 60_000 })
  await expect(labelInput2).toHaveValue('apflora')
  await expect(page).toHaveURL(/rootQcsRunLabel=apflora/)

  // the dismiss control clears input and param
  await page.getByLabel('Filter leeren').click()
  await expect(page).not.toHaveURL(/rootQcsRunLabel=/)
})

test('design mode round-trips through the url', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)

  await page.goto(`/data/projects/${PROJECT_ID}/project`)
  // the project form page shows the designing toggle for designers
  const designingButton = page.getByRole('button', { name: /designing/i })
  await expect(designingButton).toBeVisible({ timeout: 60_000 })

  await designingButton.click()
  await expect(page).toHaveURL(/designing=1/, { timeout: 10_000 })

  // reload keeps design mode on (it is in the url)
  await page.reload()
  const designingButton2 = page.getByRole('button', { name: /designing/i })
  await expect(designingButton2).toBeVisible({ timeout: 60_000 })
  await expect(page).toHaveURL(/designing=1/)

  // toggling off removes the param
  await designingButton2.click()
  await expect(page).not.toHaveURL(/designing=/)
})
