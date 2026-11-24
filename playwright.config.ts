import { defineConfig } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// E2e runs overlap in practice (several agent sessions and/or the user run
// tests against the same dev stack). Playwright wipes its outputDir at run
// start and worker artifact dirs are named per worker index, so concurrent
// runs sharing one outputDir delete each other's trace files mid-run —
// passing tests then fail red with `browserContext.close: ENOENT` (the
// failure is in the runner's trace archival, not in the app).
//
// So: give every run its own outputDir, prune stale ones, and fail fast
// with a clear message when another run is still active (see
// e2e/global-setup.ts; PS_E2E_ALLOW_CONCURRENT=1 overrides that check).
const resultsRoot = path.join(process.cwd(), 'test-results')
const outputDir = path.join(resultsRoot, `run-${Date.now()}-${process.pid}`)

// prune run dirs and leftovers older than a day. The config module also
// loads in worker processes — the prune is idempotent and only touches
// stale entries, so that is harmless.
try {
  for (const entry of fs.readdirSync(resultsRoot)) {
    if (entry === '.run-lock') continue
    const p = path.join(resultsRoot, entry)
    if (Date.now() - fs.statSync(p).mtimeMs > 24 * 3600 * 1000) {
      fs.rmSync(p, { recursive: true, force: true })
    }
  }
} catch {
  // first-ever run: test-results does not exist yet
}

// Targets the local dev stack: vite + caddy (5176) and the
// backend-dev docker compose (db, electric, postgrest, auth).
export default defineConfig({
  testDir: './e2e',
  outputDir,
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  // generous: first launch builds the local PGlite database + initial sync
  timeout: 300_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5176',
    // the dev electric sync goes through caddy on https://localhost:3001
    // using caddy's local CA, which the browser doesn't trust
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
