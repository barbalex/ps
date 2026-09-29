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

const psqlInDb = (sqlFiles, setupCommands = [], trailingCommands = []) => {
  const args = ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', 'ps', '-v', 'ON_ERROR_STOP=1', '-q']
  for (const command of setupCommands) args.push('-c', command)
  for (const file of sqlFiles) args.push('-f', file)
  for (const command of trailingCommands) args.push('-c', command)
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
//
// The reset cascades away all access rows (project_users, project_roles,
// subproject_roles, place_roles), and the triggers that would recreate them
// (projects_insert_owner_trigger, project_roles_cascade_trigger, …) skip
// while electric.syncing is set — the same session-level flag the import
// needs to get past the write-permission triggers. Without the restore
// below, NOBODY (not even the owner account) can read the imported data:
// the client's Electric shapes filter every table through the role tables,
// so the app shows stale remnants instead of the imported species.
// The restore replicates the skipped triggers by hand: re-create the owner's
// directory row and 'own' role, bring back the saved access rows, and
// propagate non-specific roles to the re-imported subprojects and places.
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
    // snapshot the access rows before the reset cascades them away
    // (temp tables live for this psql session, which also applies the seeds)
    `CREATE TEMP TABLE ps_saved_project_users AS SELECT * FROM project_users WHERE project_id = '${PROJECT_ID}';`,
    `CREATE TEMP TABLE ps_saved_project_roles AS SELECT * FROM project_roles WHERE project_id = '${PROJECT_ID}';`,
    `CREATE TEMP TABLE ps_saved_subproject_roles AS SELECT * FROM subproject_roles WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${PROJECT_ID}');`,
    `CREATE TEMP TABLE ps_saved_place_roles AS SELECT * FROM place_roles WHERE place_id IN (SELECT place_id FROM places WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${PROJECT_ID}'));`,
    `BEGIN; SET LOCAL electric.syncing TO 'true'; DELETE FROM projects WHERE project_id = '${PROJECT_ID}'; COMMIT;`,
    `SET electric.syncing TO 'true';`,
  ],
  [
    `BEGIN;
SET LOCAL electric.syncing TO 'true';

-- the access rows from before the reset, with their original ids (saved
-- project_roles reference them); as far as their rows still exist —
-- switching from 'all' to 'test' drops the removed species' specific roles
INSERT INTO project_users(project_user_id, project_id, email, auth_user_id)
  SELECT project_user_id, project_id, email, auth_user_id FROM ps_saved_project_users
ON CONFLICT (project_id, email) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;

-- owner directory row and 'own' role for the account owner, like
-- projects_insert_owner_trigger would have created (it skips while
-- electric.syncing is set); only adds emails the snapshot does not have
INSERT INTO project_users(project_id, email, auth_user_id)
  SELECT p.project_id, coalesce(a.email, u.email), a.user_id
  FROM projects p
  JOIN accounts a ON a.account_id = p.account_id
  LEFT JOIN users u ON u.user_id = a.user_id
  WHERE p.project_id = '${PROJECT_ID}'
    AND a.user_id IS NOT NULL
    AND coalesce(a.email, u.email) IS NOT NULL
    AND coalesce(a.email, u.email) NOT IN (
      SELECT email FROM project_users WHERE project_id = '${PROJECT_ID}'
    )
ON CONFLICT (project_id, email) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;

INSERT INTO project_roles(project_id, project_user_id, role, label)
  SELECT r.project_id, r.project_user_id, r.role, roles_label(r.project_user_id, r.role)
  FROM ps_saved_project_roles r
ON CONFLICT (project_user_id, project_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

INSERT INTO project_roles(project_id, project_user_id, role, label)
  SELECT '${PROJECT_ID}', pu.project_user_id, 'own', roles_label(pu.project_user_id, 'own'::user_roles_enum)
  FROM project_users pu
  WHERE pu.project_id = '${PROJECT_ID}'
    AND pu.email IN (
      SELECT coalesce(a.email, u.email)
      FROM projects p
      JOIN accounts a ON a.account_id = p.account_id
      LEFT JOIN users u ON u.user_id = a.user_id
      WHERE p.project_id = '${PROJECT_ID}'
    )
ON CONFLICT (project_user_id, project_id) DO NOTHING;

-- replicate project_roles_cascade_trigger (it skips while electric.syncing
-- is set): propagate non-specific roles to the re-imported subprojects/places
INSERT INTO subproject_roles(subproject_id, project_user_id, role, label)
  SELECT s.subproject_id, pr.project_user_id, pr.role, roles_label(pr.project_user_id, pr.role)
  FROM project_roles pr
  JOIN subprojects s ON s.project_id = pr.project_id
  WHERE pr.project_id = '${PROJECT_ID}' AND pr.role NOT IN ('read-specific', 'write-specific')
ON CONFLICT (project_user_id, subproject_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

INSERT INTO place_roles(place_id, project_user_id, role, label)
  SELECT p.place_id, pr.project_user_id, pr.role, roles_label(pr.project_user_id, pr.role)
  FROM project_roles pr
  JOIN subprojects s ON s.project_id = pr.project_id
  JOIN places p ON p.subproject_id = s.subproject_id
  WHERE pr.project_id = '${PROJECT_ID}' AND pr.role NOT IN ('read-specific', 'write-specific')
ON CONFLICT (project_user_id, place_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

-- saved -specific roles that survived the mode switch
INSERT INTO subproject_roles(subproject_id, project_user_id, role, label)
  SELECT r.subproject_id, r.project_user_id, r.role, roles_label(r.project_user_id, r.role)
  FROM ps_saved_subproject_roles r
  JOIN subprojects s ON s.subproject_id = r.subproject_id
ON CONFLICT (project_user_id, subproject_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

INSERT INTO place_roles(place_id, project_user_id, role, label)
  SELECT r.place_id, r.project_user_id, r.role, roles_label(r.project_user_id, r.role)
  FROM ps_saved_place_roles r
  JOIN places p ON p.place_id = r.place_id
ON CONFLICT (project_user_id, place_id) DO UPDATE SET role = EXCLUDED.role, label = EXCLUDED.label;

COMMIT;`,
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
  UNION ALL SELECT 'project roles: ' || count(*) FROM project_roles WHERE project_id = '${PROJECT_ID}'
  UNION ALL SELECT 'place roles: ' || count(*) FROM place_roles WHERE place_id IN (SELECT place_id FROM places WHERE subproject_id IN (SELECT subproject_id FROM subprojects WHERE project_id = '${PROJECT_ID}'))
  UNION ALL SELECT 'filtered views: ' || count(*) FROM filtered_views WHERE project_id = '${PROJECT_ID}'
`)
console.log('\nDone:')
console.log(counts)
