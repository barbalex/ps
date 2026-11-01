import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

/**
 * Fails when a message id used in src/ has no translation in one of the
 * language files. Extracts with @formatjs/cli (same options as
 * `npm run i18n:extract`, but from .ts too and into a temp file).
 */

const repoRoot = process.cwd()
const languages = ['en', 'fr', 'it']

const outFile = path.join(os.tmpdir(), `ps-i18n-extracted-${process.pid}.json`)
execFileSync(
  'npx',
  [
    'formatjs',
    'extract',
    'src/**/*.tsx',
    'src/**/*.ts',
    '--out-file',
    outFile,
    '--id-interpolation-pattern',
    '[sha512:contenthash:base64:6]',
  ],
  { cwd: repoRoot, stdio: ['ignore', 'ignore', 'inherit'] },
)
const extracted = JSON.parse(fs.readFileSync(outFile, 'utf8'))
fs.rmSync(outFile, { force: true })

let failed = false
for (const language of languages) {
  const file = path.join(repoRoot, 'src', 'i18n', `${language}.json`)
  const messages = JSON.parse(fs.readFileSync(file, 'utf8'))
  const missing = Object.keys(extracted).filter((id) => !(id in messages))
  if (!missing.length) continue
  failed = true
  console.error(`src/i18n/${language}.json is missing ${missing.length} message(s):`)
  for (const id of missing) {
    console.error(`  ${id}: ${JSON.stringify(extracted[id].defaultMessage)}`)
  }
}

if (failed) {
  process.exitCode = 1
} else {
  console.log('i18n completeness check passed.')
}
