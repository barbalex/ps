// typescript@7 (native) ships no JavaScript API, but @typescript-eslint still
// requires it at runtime (its peer range caps at typescript <6.1.0). npm cannot
// nest a peer-satisfying typescript copy under root-level packages, so after
// every install we copy the aliased typescript-v6 into the two packages that
// require() it; everything nested beneath them resolves it before the v7 copy
// at the root. Remove this script (and the typescript-v6 devDependency) once
// typescript-eslint supports typescript 7.
import { cpSync, mkdirSync, readlinkSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const source = join(root, 'node_modules', 'typescript-v6')

const targets = [
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  'ts-api-utils',
]

for (const target of targets) {
  const dest = join(root, 'node_modules', target, 'node_modules', 'typescript')
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dirname(dest), { recursive: true })
  cpSync(source, dest, { recursive: true })
  console.log(`patch-eslint-typescript: ${target} -> typescript@6.0.3`)
}

// The typescript-v6 alias also declares bin "tsc" and npm lets it overwrite
// the root bin link; point .bin/tsc back at the real (v7) typescript.
const bin = join(root, 'node_modules', '.bin', 'tsc')
const wanted = join('..', 'typescript', 'bin', 'tsc')
let current = null
try {
  current = readlinkSync(bin)
} catch {
  // missing link is recreated below
}
if (current !== wanted) {
  rmSync(bin, { force: true })
  symlinkSync(wanted, bin)
  console.log('patch-eslint-typescript: relinked node_modules/.bin/tsc -> typescript@7')
}
