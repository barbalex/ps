import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // PGlite boots a real Postgres (wasm) per suite
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
})
