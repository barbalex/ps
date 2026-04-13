import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const repoRoot = process.cwd()
const i18nDir = path.join(repoRoot, 'src', 'i18n')

const main = async () => {
  const entries = await fs.readdir(i18nDir, { withFileTypes: true })
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(i18nDir, entry.name))

  const violations = []
  const pattern = / ([?!:])/g

  for (const filePath of jsonFiles) {
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]
      pattern.lastIndex = 0
      if (!pattern.test(line)) continue

      pattern.lastIndex = 0
      const matches = [...line.matchAll(pattern)]
      for (const match of matches) {
        const punctuation = match[1]
        const column = (match.index ?? 0) + 1
        violations.push({
          filePath: path.relative(repoRoot, filePath),
          line: i + 1,
          column,
          punctuation,
          lineText: line.trim(),
        })
      }
    }
  }

  if (violations.length === 0) {
    process.stdout.write('i18n punctuation check passed.\n')
    return
  }

  process.stderr.write(
    `Found ${violations.length} i18n punctuation spacing violation(s) (space before ?, !, or :).\n`,
  )

  for (const violation of violations) {
    process.stderr.write(
      `${violation.filePath}:${violation.line}:${violation.column} has space before '${violation.punctuation}' -> ${violation.lineText}\n`,
    )
  }

  process.exitCode = 1
}

main().catch((error) => {
  process.stderr.write(`${error?.message ?? error}\n`)
  process.exitCode = 1
})
