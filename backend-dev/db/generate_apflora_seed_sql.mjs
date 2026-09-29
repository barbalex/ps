#!/usr/bin/env node
// Regenerates backend/db/init/11a_seedApfloraTaxonomies.sql from seed-data/apflora/*.csv.
// Run from the project root: node backend/db/generate_apflora_seed_sql.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

const DEMO_ACCOUNT_ID = '018cf958-27e2-7000-90d3-59f024d467be'
// the apflora project (created for real in 11b_seedApfloraExampleData.sql;
// this seed only ensures the row exists so the taxonomy's project_id
// foreign key holds on a fresh docker-entrypoint init, where this file
// runs before 11b)
const APFLORA_PROJECT_ID = '0195a101-0000-7000-8000-000000000001'

const taxonomySources = [
  {
    taxonomyName: 'DB-TAXREF (2017)',
    csvPath: join(projectRoot, 'seed-data', 'apflora', 'dbTaxref2017.csv'),
  },
  // {
  //   taxonomyName: 'SISF (2005)',
  //   csvPath: join(projectRoot, 'seed-data', 'apflora', 'sisf2005.csv'),
  // },
]

const sqlPath = join(
  projectRoot,
  'backend',
  'db',
  'init',
  '11a_seedApfloraTaxonomies.sql',
)

function parseCSV(text, delimiter = ';') {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i += 2
      } else if (ch === '"') {
        inQuotes = false
        i += 1
      } else {
        field += ch
        i += 1
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i += 1
      continue
    }

    if (ch === delimiter) {
      row.push(field)
      field = ''
      i += 1
      continue
    }

    if (ch === '\r' && text[i + 1] === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 2
      continue
    }

    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }

    field += ch
    i += 1
  }

  if (row.length > 0 || field) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

const esc = (value) => String(value ?? '').replaceAll("'", "''")

const readTaxa = ({ taxonomyName, csvPath }) => {
  const csv = readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csv)
  const [header = [], ...dataRows] = rows
  const nameIndex = header.indexOf('name')
  const idInSourceIndex = header.indexOf('id_in_source')

  if (nameIndex === -1 || idInSourceIndex === -1) {
    throw new Error(
      `CSV ${csvPath} must contain columns \"name\" and \"id_in_source\"`,
    )
  }

  return dataRows
    .filter((row) => row.some((value) => value?.trim?.()))
    .map((row) => ({
      taxonomyName,
      name: row[nameIndex]?.trim?.() ?? '',
      idInSource: row[idInSourceIndex]?.trim?.() ?? '',
    }))
    .filter((row) => row.name && row.idInSource)
}

const allTaxa = taxonomySources.flatMap(readTaxa)

const taxonomyValues = taxonomySources
  .map(
    ({ taxonomyName }) =>
      `  ('${esc(APFLORA_PROJECT_ID)}', '${esc(taxonomyName)}', 'species')`,
  )
  .join(',\n')

const taxonValues = allTaxa
  .map(
    ({ taxonomyName, name, idInSource }) =>
      `    ('${esc(taxonomyName)}', '${esc(name)}', '${esc(idInSource)}')`,
  )
  .join(',\n')

const taxonomyNameList = taxonomySources
  .map(({ taxonomyName }) => `'${esc(taxonomyName)}'`)
  .join(', ')

const sourceListComment = taxonomySources
  .map(({ csvPath }) => `--   - ${csvPath.replace(`${projectRoot}/`, '')}`)
  .join('\n')

const sql = `-- apflora test taxonomies and taxa
-- Generated from:
${sourceListComment}
-- Run \`node backend/db/generate_apflora_seed_sql.mjs\` from project root to regenerate.
--
-- This seed is idempotent at execution time:
-- 1. Delete taxa belonging to the target taxonomy names.
-- 2. Delete the target taxonomies.
-- 3. Recreate both taxonomies and all taxa from CSV.

BEGIN;

DELETE FROM taxa
WHERE taxonomy_id IN (
  SELECT taxonomy_id
  FROM taxonomies
  WHERE name IN (${taxonomyNameList})
);

DELETE FROM taxonomies
WHERE name IN (${taxonomyNameList});

-- ensure the apflora project exists before referencing it: on a fresh
-- docker-entrypoint init this file runs before 11b, which creates it
INSERT INTO projects(project_id, account_id, name, label, subproject_name_singular, subproject_name_plural, places_label_by) values
  ('${esc(APFLORA_PROJECT_ID)}', '${esc(DEMO_ACCOUNT_ID)}', 'apflora', 'apflora', 'Art', 'Arten', 'name')
  ON CONFLICT (project_id) DO NOTHING;

WITH inserted_taxonomies AS (
  INSERT INTO taxonomies(project_id, name, type)
  VALUES
  -- the apflora project owns its taxonomy: its subproject_taxa reference
  -- these taxa, and every local browser enforces the foreign keys, so the
  -- referenced rows must be inside the project's own referential closure
${taxonomyValues}
  RETURNING taxonomy_id, name
)
INSERT INTO taxa(taxonomy_id, name, id_in_source)
SELECT
  inserted_taxonomies.taxonomy_id,
  seed.name,
  seed.id_in_source
FROM inserted_taxonomies
JOIN (
  VALUES
${taxonValues}
) AS seed(taxonomy_name, name, id_in_source)
  ON seed.taxonomy_name = inserted_taxonomies.name;

COMMIT;
`

const previous = existsSync(sqlPath) ? readFileSync(sqlPath, 'utf-8').toString() : ''

if (previous === sql) {
  console.log(`No changes needed for ${sqlPath}`)
} else {
  writeFileSync(sqlPath, sql, 'utf-8')
  console.log(`Written ${allTaxa.length} taxa to ${sqlPath}`)
}