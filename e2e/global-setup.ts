import fs from 'node:fs'
import path from 'node:path'

/**
 * Fail fast when another e2e run is still active instead of both runs
 * failing mid-suite with confusing fixture/data interference. Runs are
 * artifact-isolated (per-run outputDir in playwright.config.ts), but they
 * still share the dev stack and the dev database, so overlapping runs
 * fight over the same fixtures and the same caddy/vite ports.
 *
 * Runs in this repo are usually one-off and short, so a simple pid lock
 * with a staleness timeout beats a real file lock here. globalSetup runs
 * in the runner process, which lives for the whole run — the recorded pid
 * is valid for the run's duration.
 */
const lockPath = path.join(process.cwd(), 'test-results', '.run-lock')
const LOCK_STALE_MS = 30 * 60 * 1000

export default function globalSetup() {
  if (process.env.PS_E2E_ALLOW_CONCURRENT) return

  let existing: { pid: number; startedAt: number } | undefined
  try {
    existing = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
  } catch {
    // missing or corrupt lock: fall through and (re)create it
  }

  if (existing) {
    const fresh = Date.now() - existing.startedAt < LOCK_STALE_MS
    const alive = (() => {
      try {
        process.kill(existing!.pid, 0)
        return true
      } catch {
        return false
      }
    })()
    if (fresh && alive) {
      throw new Error(
        `Another e2e run looks active (pid ${existing.pid}, started ${new Date(
          existing.startedAt,
        ).toLocaleTimeString()}). Concurrent runs share the dev stack and ` +
          `database — wait for it to finish, or set PS_E2E_ALLOW_CONCURRENT=1 to run anyway.`,
      )
    }
  }

  fs.mkdirSync(path.dirname(lockPath), { recursive: true })
  fs.writeFileSync(
    lockPath,
    JSON.stringify({ pid: process.pid, startedAt: Date.now() }),
  )
}
