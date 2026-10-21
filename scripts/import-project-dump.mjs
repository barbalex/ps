#!/usr/bin/env node
// Restores a project from a dump created by scripts/dump-project.mjs into
// the running dev database (docker container ps_db):
//
//   node scripts/import-project-dump.mjs <dumpFile> <projectId>
//
// In one transaction, with the write-permission and label triggers bypassed
// via electric.syncing (like Electric itself does):
// 1. deletes the project (the cascades wipe all its rows)
// 2. applies the dump's INSERTs verbatim — ids included, so every re-import
//    restores the same rows and Electric streams ordinary same-key upserts
//    to the clients
//
// The dump must come from a database with the same schema version (created
// by dump-project.mjs against this schema). A dump from another database
// additionally needs the owning account to exist there — or re-owning added
// to this script (projects.account_id, project_users.auth_user_id) before
// this becomes the UI's import feature.

import { readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const CONTAINER = process.env.PS_DB_CONTAINER ?? 'ps_db'

const dumpFile = process.argv[2]
const projectId = process.argv[3]
if (!dumpFile || !projectId) {
  console.error(
    'Usage: node scripts/import-project-dump.mjs <dumpFile> <projectId>',
  )
  process.exit(1)
}

const dump = readFileSync(dumpFile, 'utf8')
if (!dump.includes(`'${projectId}'`)) {
  console.error(
    `The dump does not mention project ${projectId} — wrong dump or wrong id?`,
  )
  process.exit(1)
}

console.log(`Restoring project ${projectId} from ${dumpFile} ...`)

const sql = `
BEGIN;
SET LOCAL electric.syncing TO 'true';
DELETE FROM projects WHERE project_id = '${projectId}';
${dump}
COMMIT;
`
const result = spawnSync(
  'docker',
  [
    'exec',
    '-i',
    CONTAINER,
    'psql',
    '-U',
    'postgres',
    '-d',
    'ps',
    '-v',
    'ON_ERROR_STOP=1',
    '-q',
  ],
  // stdout is one "INSERT 0 1" per row — drop it, keep stderr for errors
  { input: sql, stdio: ['pipe', 'ignore', 'inherit'], maxBuffer: 16 * 1024 * 1024 },
)
if (result.status !== 0) {
  console.error(`Failed to apply ${dumpFile} (is the dev backend running?)`)
  process.exit(result.status ?? 1)
}

// report what landed in the database
const query = (sqlQuery) => {
  const queryResult = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', 'ps', '-tA', '-c', sqlQuery],
    { encoding: 'utf8' },
  )
  return queryResult.stdout.trim()
}
const counts = query(`
  SELECT 'subprojects: ' || count(*) FROM subprojects WHERE project_id = '${projectId}'
  UNION ALL SELECT 'places: ' || count(*) FROM places WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${projectId}')
  UNION ALL SELECT 'checks: ' || count(*) FROM checks c JOIN places p USING (place_id) WHERE p.subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${projectId}')
  UNION ALL SELECT 'actions: ' || count(*) FROM actions a JOIN places p USING (place_id) WHERE p.subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${projectId}')
  UNION ALL SELECT 'project roles: ' || count(*) FROM project_roles WHERE project_id = '${projectId}'
  UNION ALL SELECT 'place roles: ' || count(*) FROM place_roles WHERE place_id IN (SELECT place_id FROM places WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${projectId}'))
`)
console.log('\nDone:')
console.log(counts)
