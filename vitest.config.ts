import { defineConfig } from 'vitest/config'

export default defineConfig({
  // the error telemetry module stamps reports with this; tests expect
  // the fixed value asserted in tests/errorTelemetry.test.ts
  define: {
    __APP_VERSION__: JSON.stringify('0.0.0-test'),
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // PGlite boots a real Postgres (wasm) per suite
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
})
