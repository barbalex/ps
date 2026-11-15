import { test, expect } from '@playwright/test'
import { login } from './helpers.ts'

/**
 * The places filter page passes no `level` prop — the Filter component
 * must derive it from the url (no placeId = level 1) so editor and list
 * agree on the f-places1 key. Typing into "Name" must apply the filter.
 */

const PROJECT_ID = '018cfcf7-6424-7000-a100-851c5cc2c878'
const SUBPROJECT_ID = '018cfd27-ee92-7000-b678-e75497d6c60e'

test.use({ locale: 'de-CH' })

test('typing in the places filter applies it', async ({ page }) => {
  await login(page, 'test@test.ch', 'test-test')

  await page.goto(
    `/data/projects/${PROJECT_ID}/subprojects/${SUBPROJECT_ID}/places/filter`,
  )
  const heading = page.locator('.form-outer-container h1').first()
  await expect(heading).toBeVisible({ timeout: 60_000 })

  // wait for the counts to load, then read the total
  await expect(heading).not.toContainText('...', { timeout: 30_000 })
  const totalText = await heading.textContent()
  const total = Number((totalText ?? '').match(/(\d+)\/(\d+)/)?.[2] ?? 0)
  expect(total).toBeGreaterThan(0)

  // type into the Name field of Filter 1; TextField propagates on Enter
  const nameField = page.getByRole('textbox', { name: /^Name$/ })
  await nameField.fill('irst')
  await nameField.press('Enter')

  // the filter lands in the url under the level-1 places key
  await expect(page).toHaveURL(/f-places1=/, { timeout: 10_000 })
  await expect(page).toHaveURL(/name/)

  // and it is applied: the filtered count drops below the total (the
  // heading keeps the old counts until the live query re-runs)
  await expect(heading).not.toContainText(`(${total}/${total})`, {
    timeout: 30_000,
  })
  const filteredText = await heading.textContent()
  const filtered = Number((filteredText ?? '').match(/(\d+)\/(\d+)/)?.[1] ?? 0)
  expect(filtered).toBeLessThan(total)
  expect(filtered).toBeGreaterThan(0)
})
