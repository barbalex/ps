import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const sourceInitDir = path.join(repoRoot, 'backend', 'db', 'init')
const backendDevInitDir = path.join(repoRoot, 'backend-dev', 'db', 'init')
const frontendSqlDir = path.join(repoRoot, 'src', 'sql')

const frontendMappings = [
  ['01_immutableDate.sql', 'immutableDate.sql'],
  ['02_uuidv7.sql', 'uuidv7.sql'],
  ['04_createTables.sql', 'createTables.sql'],
  ['07_triggers.sql', 'triggers.sql'],
  ['10_sync_ignore_duplicate_insert_triggers.sql', 'syncIgnoreDuplicateInsertTriggers.sql'],
]

const checkOnly = process.argv.includes('--check')

const copyFileIfNeeded = async (fromPath, toPath) => {
  const [fromContent, toContent] = await Promise.all([
    fs.readFile(fromPath, 'utf8'),
    fs.readFile(toPath, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return null
      throw error
    }),
  ])

  if (toContent === fromContent) {
    return { changed: false, target: toPath }
  }

  if (!checkOnly) {
    await fs.mkdir(path.dirname(toPath), { recursive: true })
    await fs.writeFile(toPath, fromContent)
  }

  return { changed: true, target: toPath }
}

const syncDirectory = async (fromDir, toDir) => {
  const entries = await fs.readdir(fromDir, { withFileTypes: true })
  const results = []

  for (const entry of entries) {
    const fromPath = path.join(fromDir, entry.name)
    const toPath = path.join(toDir, entry.name)

    if (entry.isDirectory()) {
      results.push(...(await syncDirectory(fromPath, toPath)))
      continue
    }

    results.push(await copyFileIfNeeded(fromPath, toPath))
  }

  return results
}

const syncFrontendFiles = async () => {
  const results = []

  for (const [sourceName, targetName] of frontendMappings) {
    const fromPath = path.join(sourceInitDir, sourceName)
    const toPath = path.join(frontendSqlDir, targetName)
    results.push(await copyFileIfNeeded(fromPath, toPath))
  }

  return results
}

const main = async () => {
  const results = [
    ...(await syncDirectory(sourceInitDir, backendDevInitDir)),
    ...(await syncFrontendFiles()),
  ]

  const changed = results.filter((result) => result.changed)

  if (checkOnly) {
    if (changed.length > 0) {
      console.error('SQL files are out of sync:')
      for (const result of changed) {
        console.error(`- ${path.relative(repoRoot, result.target)}`)
      }
      process.exitCode = 1
      return
    }

    console.log('SQL files are in sync.')
    return
  }

  if (changed.length === 0) {
    console.log('SQL files already in sync.')
    return
  }

  console.log('Synced SQL files:')
  for (const result of changed) {
    console.log(`- ${path.relative(repoRoot, result.target)}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
