import fs from 'node:fs'
import path from 'node:path'

/**
 * Release the cross-run e2e lock written by e2e/global-setup.ts — but
 * only if this run still owns it (a stolen stale lock belongs to a
 * newer run).
 */
const lockPath = path.join(process.cwd(), 'test-results', '.run-lock')

export default function globalTeardown() {
  try {
    const { pid } = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
    if (pid === process.pid) fs.rmSync(lockPath, { force: true })
  } catch {
    // lock already gone or unreadable — nothing to release
  }
}
