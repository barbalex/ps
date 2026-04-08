import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const hooksDir = path.join(repoRoot, '.githooks')
const preCommitPath = path.join(hooksDir, 'pre-commit')

const main = async () => {
  await fs.access(preCommitPath)
  await fs.chmod(preCommitPath, 0o755)

  await execFileAsync('git', ['config', 'core.hooksPath', '.githooks'], {
    cwd: repoRoot,
  })

  process.stdout.write('Git hooks installed. core.hooksPath is set to .githooks\n')
}

main().catch((error) => {
  process.stderr.write(`${error?.message ?? error}\n`)
  process.exitCode = 1
})
