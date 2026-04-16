import { readdir, readFile, writeFile, rm, mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename, extname } from 'node:path'
import { marked, Renderer } from 'marked'

const ROOT = new URL('..', import.meta.url).pathname
const MD_SRC = join(ROOT, 'docs/docsMd')
const HTML_SRC = join(ROOT, 'docs/docsHtml')
const OUT = join(ROOT, 'docs/docs')

// Custom renderer: add target="_blank" to all links
const renderer = new Renderer()
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}"${titleAttr} target="_blank">${text}</a>`
}
marked.use({ renderer })

// Clear and recreate output directory
if (existsSync(OUT)) {
  await rm(OUT, { recursive: true })
}
await mkdir(OUT, { recursive: true })

// Convert Markdown sources
if (existsSync(MD_SRC)) {
  const mdFiles = (await readdir(MD_SRC)).filter((f) => extname(f) === '.md')
  for (const file of mdFiles) {
    const id = basename(file, '.md')
    const src = await readFile(join(MD_SRC, file), 'utf8')
    const html = await marked.parse(src)
    await writeFile(join(OUT, `${id}.html`), html, 'utf8')
    console.log(`  md → ${id}.html`)
  }
}

// Copy HTML sources, adding target="_blank" to links that don't have one
if (existsSync(HTML_SRC)) {
  const htmlFiles = (await readdir(HTML_SRC)).filter((f) => extname(f) === '.html')
  for (const file of htmlFiles) {
    const id = basename(file, '.html')
    const src = await readFile(join(HTML_SRC, file), 'utf8')
    const processed = src.replace(/<a\s+(?![^>]*target=)([^>]*)>/gi, '<a $1 target="_blank">')
    await writeFile(join(OUT, file), processed, 'utf8')
    console.log(`  html → ${id}.html`)
  }
}

console.log('docs:build complete')
