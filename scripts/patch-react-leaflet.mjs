// @react-leaflet/core's Pane implementation calls DomUtil.addClass/removeClass,
// which Leaflet 2 removed (they were never in the v2 DomUtil namespace). The
// app passes className to <Pane> (layers/Layer.tsx), so replace the calls with
// the DOM equivalent after every install. Idempotent. Remove once react-leaflet
// ships Leaflet 2 support.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const file = join(
  root,
  'node_modules',
  '@react-leaflet',
  'core',
  'lib',
  'dom.js',
)

let source
try {
  source = readFileSync(file, 'utf8')
} catch {
  console.warn('patch-react-leaflet: dom.js not found, skipping')
  process.exit(0)
}

const replacements = [
  ['DomUtil.addClass(element, cls);', 'element.classList.add(cls);'],
  ['DomUtil.removeClass(element, cls);', 'element.classList.remove(cls);'],
]

let patched = 0
for (const [from, to] of replacements) {
  if (source.includes(to)) continue // already patched
  if (!source.includes(from)) {
    console.warn(`patch-react-leaflet: pattern no longer present: ${from}`)
    continue
  }
  source = source.replace(from, to)
  patched++
}

if (patched > 0) {
  writeFileSync(file, source)
  console.log(`patch-react-leaflet: replaced ${patched} DomUtil class calls`)
} else {
  console.log('patch-react-leaflet: already patched')
}
