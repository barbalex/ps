// quick check: does the Zusammenfassung render now?
import { chromium } from '@playwright/test'
const context = await chromium.launchPersistentContext('/tmp/ps_bench_profile', {
  headless: true, ignoreHTTPSErrors: true,
})
const page = context.pages()[0] ?? (await context.newPage())
const url = 'http://localhost:5176/data/projects/0195a101-0000-7000-8000-000000000001/reports/a4000000-0000-4000-8000-000000000001/print'
await page.goto(url, { waitUntil: 'domcontentloaded' })
// the title page renders immediately; the zusammenfassung comes with the live row
const deadline = Date.now() + 3 * 60 * 1000
while (Date.now() < deadline) {
  if (await page.getByText('Jahresbericht 2025 sind 92 Aktionsplanarten').count()) break
  await page.waitForTimeout(3000)
}
console.log('zusammenfassung rendered:', await page.getByText('Jahresbericht 2025 sind 92 Aktionsplanarten').count() > 0)
await context.close()
