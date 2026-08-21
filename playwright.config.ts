import { defineConfig } from '@playwright/test'

// Targets the local dev stack: vite + caddy (5176) and the
// backend-dev docker compose (db, electric, postgrest, auth).
export default defineConfig({
  testDir: './e2e',
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
