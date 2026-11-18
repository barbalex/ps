// @cyntler/react-doc-viewer's TXTRenderer renders the raw file data as
// children: `{currentDocument?.fileData as ReactNode}` (GHSA-fvhg-p4hf-79x3,
// CVE-2026-30691 — no fixed release exists). The app previews collaborator-
// uploaded text files, so force the children to a string, which React always
// escapes. Runs after every install. Idempotent. Remove once the library
// ships a patched version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const dist = join(root, 'node_modules', '@cyntler', 'react-doc-viewer', 'dist')

let files
try {
  files = readdirSync(dist).filter((name) => /\.(js|cjs)$/.test(name))
} catch {
  console.warn('patch-react-doc-viewer: dist not found, skipping')
  process.exit(0)
}

// the minified TXT renderer passes the raw file data as children:
//   { id: "txt-renderer", children: r == null ? void 0 : r.fileData }
// (the nullish chain and the variable names are build-specific; the optional
// part matches both the chain form and a plain `r.fileData`). Wrap it in
// String() so only a string can ever reach the React tree.
const pattern =
  /(id:\s*"txt-renderer",\s*children:\s*)([A-Za-z_$][A-Za-z0-9_$]*(?:\s*==\s*null\s*\?\s*void 0\s*:\s*[A-Za-z_$][A-Za-z0-9_$]*\.[A-Za-z0-9_$]+)?)(\s*\})/g

let patched = 0
for (const name of files) {
  const file = join(dist, name)
  let source
  try {
    source = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  if (!source.includes('"txt-renderer"')) continue
  if (/id:\s*"txt-renderer",\s*children:\s*String\(/.test(source)) continue // already patched
  const next = source.replace(pattern, '$1String($2 ?? "")$3')
  if (next !== source) {
    writeFileSync(file, next)
    patched++
    console.log(`patch-react-doc-viewer: hardened TXTRenderer in ${name}`)
  }
}

if (patched === 0) {
  console.log(
    patched === 0 &&
      'patch-react-doc-viewer: already patched (or pattern not found — check after library upgrades)',
  )
}
