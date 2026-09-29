#!/usr/bin/env node
// Imports apflora data into the running dev database (docker container ps_db).
//
//   node scripts/import-apflora.mjs test   — the three example species
//   node scripts/import-apflora.mjs all    — every art of the apf2 dump
//
// What it does:
// 1. extracts the apf2 dump to seed-data/apflora/apf2-example.json resp.
//    apf2-all.json if that file is missing (backend/db/extract_apflora_example.mjs;
//    the json files are gitignored because of the unpublished apf2 data)
// 2. regenerates backend/db/init/11b_seedApfloraExampleData.sql from it
//    (APF2_APPLY_LATER=1 so it runs against a live stack) and mirrors it
//    via sync-sql
// 3. resets the apflora project (delete cascades all its data — places,
//    checks, charts, taxonomies, ...), then applies the seed files in order:
//    11a (taxonomies), 11b (data), 11c (charts), 11d (report)
//    inside the ps_db container, with the write-permission triggers
//    bypassed via electric.syncing (like Electric itself does)
//
// The apflora data is self-contained: re-running with the other mode freely
// switches between the full dataset and the three-species test data.

import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const CONTAINER = process.env.PS_DB_CONTAINER ?? 'ps_db'
const PROJECT_ID = '0195a101-0000-7000-8000-000000000001'

const modes = {
  test: {
    json: join(projectRoot, 'seed-data', 'apflora', 'apf2-example.json'),
    scope: 'example',
    label: 'three example species',
  },
  all: {
    json: join(projectRoot, 'seed-data', 'apflora', 'apf2-all.json'),
    scope: 'all',
    label: 'every art of the apf2 dump',
  },
}

const modeName = process.argv[2]
const mode = modes[modeName]
if (!mode) {
  console.error('Usage: node scripts/import-apflora.mjs test|all')
  console.error('  test — the three example species (Abies alba, Aldrovanda vesiculosa, Pulsatilla vulgaris)')
  console.error('  all  — every art of the apf2 dump')
  process.exit(1)
}

const run = (command, args, env = {}) => {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    maxBuffer: 256 * 1024 * 1024,
  })
  if (result.status !== 0) {
    console.error(`Failed: ${command} ${args.join(' ')}`)
    process.exit(result.status ?? 1)
  }
}

const psqlInDb = (sqlFiles, setupCommands = []) => {
  const args = ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', 'ps', '-v', 'ON_ERROR_STOP=1', '-q']
  for (const command of setupCommands) args.push('-c', command)
  for (const file of sqlFiles) args.push('-f', file)
  const result = spawnSync('docker', args, { stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`Failed to apply SQL in ${CONTAINER} (is the dev backend running?)`)
    process.exit(result.status ?? 1)
  }
}

const queryInDb = (sql) => {
  const result = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', 'ps', '-tA', '-c', sql],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  )
  if (result.status !== 0) {
    console.error(`Query failed: ${sql}\n${result.stderr}`)
    process.exit(1)
  }
  return result.stdout.trim()
}

console.log(`Importing apflora data (${mode.label}) ...`)

// 1. extract the dump if the json is missing
if (!existsSync(mode.json)) {
  console.log(`Extracting the apf2 dump (scope: ${mode.scope}) — this can take a while ...`)
  run('node', ['backend/db/extract_apflora_example.mjs'], { APF2_SCOPE: mode.scope })
  if (!existsSync(mode.json)) {
    console.error(`Extraction did not produce ${mode.json}`)
    process.exit(1)
  }
}

// 2. regenerate the seed sql from it
console.log(`Generating seed SQL from ${mode.json} ...`)
run('node', ['backend/db/generate_apflora_example_sql.mjs'], {
  APF2_JSON: mode.json,
  APF2_APPLY_LATER: '1',
})
// keep the mirrored copies in sync (pre-commit hook checks this)
run('npm', ['run', 'sync-sql'])

// 3. reset the project, then apply the freshly generated seed files.
// They are copied into the container at /var/tmp (/tmp is a tmpfs mount
// where docker cp does not stick, and the files under
// /docker-entrypoint-initdb.d are the versions baked into the image).
// 11a has no electric.syncing bypass of its own: set it for the whole session
// (the other files manage their own transactions)
console.log('Resetting the apflora project and applying the seeds ...')
const seedFiles = [
  '11a_seedApfloraTaxonomies.sql',
  '11b_seedApfloraExampleData.sql',
  '11c_seedApfloraCharts.sql',
  '11d_seedApfloraReport.sql',
]
for (const file of seedFiles) {
  const result = spawnSync(
    'docker',
    ['cp', join(projectRoot, 'backend', 'db', 'init', file), `${CONTAINER}:/var/tmp/${file}`],
    { stdio: 'inherit' },
  )
  if (result.status !== 0) {
    console.error(`Failed to copy ${file} into ${CONTAINER} (is the dev backend running?)`)
    process.exit(result.status ?? 1)
  }
}
psqlInDb(
  seedFiles.map((file) => `/var/tmp/${file}`),
  [
    `BEGIN; SET LOCAL electric.syncing TO 'true'; DELETE FROM projects WHERE project_id = '${PROJECT_ID}'; COMMIT;`,
    `SET electric.syncing TO 'true';`,
  ],
)

// the label triggers skip while electric.syncing is set (normally Electric
// delivers labels with the rows) — a direct import must refresh them itself,
// like places_label_trigger would
console.log('Refreshing place labels ...')
queryInDb(`SET electric.syncing TO 'true';

UPDATE places SET label = CASE
    WHEN p.places_label_by IS NULL THEN places.place_id::text
    WHEN p.places_label_by = 'id' THEN places.place_id::text
    WHEN p.places_label_by = 'level' THEN places.level::text
    WHEN p.places_label_by = 'name' THEN coalesce(nullif(places.name, ''), places.place_id::text)
    WHEN places.data -> p.places_label_by IS NULL THEN places.place_id::text
    ELSE places.data ->> p.places_label_by
  END
  FROM projects p
  WHERE places.subproject_id IN (
    SELECT subproject_id FROM subprojects WHERE project_id = '${PROJECT_ID}'
  ) AND p.project_id = '${PROJECT_ID}';
`)

// 4. report what landed in the database
const counts = queryInDb(`
  SELECT 'subprojects: ' || count(*) FROM subprojects WHERE project_id = '${PROJECT_ID}'
  UNION ALL SELECT 'places: ' || count(*) FROM places WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${PROJECT_ID}')
  UNION ALL SELECT 'checks: ' || count(*) FROM checks c JOIN places p USING (place_id) WHERE p.subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${PROJECT_ID}')
  UNION ALL SELECT 'actions: ' || count(*) FROM actions a JOIN places p USING (place_id) WHERE p.subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${PROJECT_ID}')
  UNION ALL SELECT 'filtered views: ' || count(*) FROM filtered_views WHERE project_id = '${PROJECT_ID}'
`)
console.log('\nDone:')
console.log(counts)
