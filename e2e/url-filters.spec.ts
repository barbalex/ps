import { test, expect } from '@playwright/test'
import { ensureUser, login } from './helpers.ts'

/**
 * List filters live in `f-<key>` search params (modules/useUrlFilter.ts).
 * This spec verifies the url round-trip on the users list:
 * - editing a filter puts it in the url
 * - leaving the filter editor retains the param (search middleware)
 * - reloading keeps the filter (it is in the url, not in localStorage)
 * - a hand-crafted deep link applies the filter
 */

const E2E_EMAIL = process.env.E2E_EMAIL ?? 'zcode-urlfilters@test.ch'
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

// the app follows the browser language; the assertions below use the
// german ui labels
test.use({ locale: 'de-DE' })

test.beforeEach(async () => {
  const userId = await ensureUser({
    email: E2E_EMAIL,
    password: E2E_PASSWORD,
    name: 'E2E Url Filters',
  })
  if (!userId) throw new Error('e2e user missing')
})

test('users filter round-trips through the url', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)

  // open the users list
  await page.goto('/data/users')
  await expect(page.getByRole('heading', { name: /Benutzer/i })).toBeVisible({
    timeout: 60_000,
  })

  // open the filter editor
  await page.click('button[title="Filter bearbeiten"]')
  await page.waitForURL('**/data/users/filter')

  // type into the email filter field. TextField only propagates filter
  // edits on Enter / keyup / blur
  const emailField = page.getByRole('textbox', { name: /e-mail/i }).first()
  await emailField.fill(E2E_EMAIL)
  await emailField.press('Enter')

  // the filter is now in the url as f-users
  await expect(page).toHaveURL(/f-users=/)
  await expect(page).toHaveURL(new RegExp(encodeURIComponent(E2E_EMAIL)))

  // the url param survives leaving the filter editor (retained by the
  // search middleware on /data)
  await page.click('button[title="Filter verlassen"]')
  await expect(page).toHaveURL(/\/data\/users\?f-users=/)

  // reload: the filter still applies because it lives in the url
  await page.reload()
  await expect(page.getByRole('heading', { name: /Benutzer/i })).toBeVisible({
    timeout: 60_000,
  })
  await expect(page).toHaveURL(/f-users=/)

  // the filtered list shows exactly this user (the tree shows it too)
  await expect(
    page.locator('.list-container').getByText(E2E_EMAIL),
  ).toBeVisible({ timeout: 30_000 })
})

test('a deep link with a filter param applies the filter', async ({ page }) => {
  await login(page, E2E_EMAIL, E2E_PASSWORD)

  const filterValue = encodeURIComponent(JSON.stringify([{ email: 'zzz-no-such-user' }]))
  await page.goto(`/data/users?f-users=${filterValue}`)
  await expect(page.getByRole('heading', { name: /Benutzer/i })).toBeVisible({
    timeout: 60_000,
  })

  // the list is filtered to nothing: our user's email must not appear
  await expect(
    page.locator('.list-container').getByText(E2E_EMAIL),
  ).toHaveCount(0)
  await expect(page).toHaveURL(/f-users=/)
})
