// Diagnose: why do Erfolg/AktuellePopulationen/Zusammenfassung not render?
import { chromium } from '@playwright/test'

const t0 = Date.now()
const log = (...args) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s]`, ...args)

const context = await chromium.launchPersistentContext('/tmp/ps_bench_profile', {
  headless: true,
  ignoreHTTPSErrors: true,
})
const page = context.pages()[0] ?? (await context.newPage())
page.on('console', (msg) => {
  const text = msg.text()
  if (/error|Error|warn/i.test(text)) log('CONSOLE:', text.slice(0, 250))
})
page.on('pageerror', (err) => log('PAGEERROR:', String(err).slice(0, 400)))

const url =
  'http://localhost:5176/data/projects/0195a101-0000-7000-8000-000000000001/reports/a4000000-0000-4000-8000-000000000001/print'
await page.goto(url, { waitUntil: 'domcontentloaded' })
log('opened')
const deadline = Date.now() + 11 * 60 * 1000
while (Date.now() < deadline) {
  if (await page.getByText('Übersicht über aktuelle Populationen aller AP-Arten').count()) break
  await page.waitForTimeout(5000)
}
await page.waitForTimeout(8000)

const diagnosis = await page.evaluate(() => {
  const text = document.body.innerText
  return {
    noContextErfolg: text.includes('Erfolg: kein Projekt-Kontext'),
    noContextPop: text.includes('Übersicht Populationen: kein Projekt-Kontext'),
    loadingPresent: text.includes('wird geladen'),
    zusammenfassungWord: text.includes('Zusammenfassung'),
    shellTitles: [...document.querySelectorAll('[class*="shell"] > [class*="title"]')]
      .map((el) => el.textContent?.slice(0, 60))
      .slice(0, 8),
    firstCells: [...document.querySelectorAll('[class*="verticalHeader"]')].length,
  }
})
console.log(JSON.stringify(diagnosis, null, 1))
await context.close()
