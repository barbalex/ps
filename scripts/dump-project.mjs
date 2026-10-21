#!/usr/bin/env node
// Dumps a project from the running dev database (docker container ps_db) into
// a SQL file in the structure the project has inside ps — every row with its
// original id, including the access rows (project_users, *_roles) and the
// trigger-maintained labels.
//
//   node scripts/dump-project.mjs <projectId> <outFile>
//
// What it does:
// 1. copies the project's rows into a scratch schema ps_dump (tables without
//    a project_id column are scoped through their parents' rows; the table
//    list lives in project-dump-tables.mjs)
// 2. pg_dumps that schema as plain INSERTs (--inserts, data only), streamed
//    to a temp file — the dump is too big for a Node buffer
// 3. rewrites the schema prefix to public and writes the dump to outFile
//
// Re-importing the dump (import-project-dump.mjs) restores the project
// verbatim: identical ids on every re-import, so Electric streams ordinary
// same-key upserts to the clients instead of delete+insert churn on the
// unique keys (which clients syncing from a cached shape snapshot cannot
// apply — see the comment in import-apflora.mjs). The dump file contains the
// project's data: keep it out of git like the apf2 json files.

import { spawnSync } from 'child_process'
import { rmSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import { projectTables } from './project-dump-tables.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const CONTAINER = process.env.PS_DB_CONTAINER ?? 'ps_db'

const projectId = process.argv[2]
const outFile = process.argv[3]
if (!projectId || !outFile) {
  console.error('Usage: node scripts/dump-project.mjs <projectId> <outFile>')
  process.exit(1)
}
const tmpFile = `${outFile}.tmp`

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

// runs psql in the db container, statements passed via stdin
const psqlInput = (sql) => {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', 'ps', '-v', 'ON_ERROR_STOP=1', '-q'],
    { input: sql, stdio: ['pipe', 'inherit', 'inherit'] },
  )
  if (result.status !== 0) fail(`psql failed (is the dev backend running?)`)
}

console.log(`Dumping project ${projectId} ...`)

// 1. build the scratch schema with the project's rows
const tableList = projectTables.map(({ table }) => `'${table}'`).join(', ')
const createStatements = [
  'DROP SCHEMA IF EXISTS ps_dump CASCADE;',
  'CREATE SCHEMA ps_dump;',
  ...projectTables.map(
    ({ table, where }) =>
      `CREATE TABLE ps_dump.${table} AS SELECT * FROM public.${table} WHERE ${where(projectId)};`,
  ),
  // the CTAS turns generated columns (most label columns) into plain ones;
  // pg_dump would then emit values the real table rejects on insert — drop
  // them, the target recomputes them on restore
  `DO $$
  DECLARE
    gen RECORD;
  BEGIN
    FOR gen IN
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND generation_expression <> ''
        AND table_name IN (${tableList})
    LOOP
      EXECUTE format('ALTER TABLE ps_dump.%I DROP COLUMN %I', gen.table_name, gen.column_name);
    END LOOP;
  END $$;`,
]
psqlInput(createStatements.join('\n'))

// 2. pg_dump the scratch schema as INSERTs (with column names: the scratch
//    tables lack the generated columns, so positional VALUES would misalign),
//    streamed to the temp file
try {
  const dumpResult = spawnSync(
    'sh',
    ['-c', `docker exec ${CONTAINER} pg_dump -U postgres -d ps --data-only --column-inserts --no-owner --no-privileges -n ps_dump > '${tmpFile}'`],
    { stdio: 'inherit' },
  )
  if (dumpResult.status !== 0) fail('pg_dump failed')

  // 3. rewrite to public and prepend a header
  const header = `-- Project dump of ${projectId}
-- Created ${new Date().toISOString()} by scripts/dump-project.mjs
-- Restore with: node scripts/import-project-dump.mjs <thisFile> <projectId>
-- (schema as of the dump's creation; restores rows verbatim, ids included)
`
  const finishResult = spawnSync(
    'sh',
    ['-c', `{ cat <<'EOF'\n${header}EOF\nsed -e "/SELECT pg_catalog.set_config('search_path', '', false);/d" -e 's/ps_dump\\./public./g' '${tmpFile}'; } > '${outFile}'`],
    { stdio: 'inherit' },
  )
  if (finishResult.status !== 0) fail('writing the dump file failed')
} finally {
  // 4. drop the scratch schema and the temp file again
  psqlInput('DROP SCHEMA IF EXISTS ps_dump CASCADE;')
  rmSync(tmpFile, { force: true })
}

// 5. report what landed in the dump
const counts = spawnSync('sh', ['-c', `grep -c '^INSERT INTO ' '${outFile}'`], {
  encoding: 'utf8',
})
console.log(`Done: ${counts.stdout.trim()} rows dumped to ${outFile}`)
