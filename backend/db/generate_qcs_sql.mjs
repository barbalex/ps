#!/usr/bin/env node
// Regenerates backend/db/init/07_qcs.sql from src/other/qcs.csv.
// Run from the project root: node backend/db/generate_qcs_sql.mjs

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

const csvPath = join(projectRoot, 'src', 'other', 'qcs.csv')
const sqlPath = join(projectRoot, 'backend', 'db', 'init', '07_qcs.sql')

const csv = readFileSync(csvPath, 'utf-8')
const lines = csv.split('\n').filter((l) => l.trim())
// skip header
const rows = lines.slice(1)

// Escape single quotes for SQL string literals
const esc = (s) => (s ?? '').trim().replaceAll("'", "''")

// Convert CSV place_level to SQL:
//   ''   → NULL
//   '1'  → 1
//   '1, 2' or '2, 1' → NULL (applies to all place levels)
const placeLevel = (s) => {
  const v = (s ?? '').trim()
  if (!v || v.includes(',')) return 'NULL'
  const n = parseInt(v, 10)
  return isNaN(n) ? 'NULL' : String(n)
}

const bool = (s) => ((s ?? '').trim() === 'true' ? 'true' : 'false')

const valueLines = rows
  .map((line) => {
    const cols = line.split(';')
    // label_de;label_en;label_fr;label_it;name;table_name;place_level;is_root_level;is_project_level;is_subproject_level;;sort;description
    const [
      label_de,
      label_en,
      label_fr,
      label_it,
      name,
      table_name,
      place_level_raw,
      is_root_level,
      is_project_level,
      is_subproject_level,
    ] = cols

    if (!name?.trim()) return null

    return (
      `('${esc(name)}', '${esc(label_de)}', '${esc(label_en)}', '${esc(label_fr)}', '${esc(label_it)}', ` +
      `'${esc(table_name)}', ${placeLevel(place_level_raw)}, ${bool(is_root_level)}, ${bool(is_project_level)}, ${bool(is_subproject_level)}, NULL)`
    )
  })
  .filter(Boolean)
  .join(',\n')

const sql = `-- qcs: quality controls for data
-- Generated from src/other/qcs.csv
-- Run \`node backend/db/generate_qcs_sql.mjs\` from project root to regenerate after editing the CSV.
--
-- place_level: NULL means the QC applies to all place levels (1 and 2).
--              An integer (1 or 2) restricts it to that specific place level.

INSERT INTO qcs (name, label_de, label_en, label_fr, label_it, table_name, place_level, is_root_level, is_project_level, is_subproject_level, sql)
VALUES
${valueLines}
ON CONFLICT (name) DO UPDATE SET
  label_de            = EXCLUDED.label_de,
  label_en            = EXCLUDED.label_en,
  label_fr            = EXCLUDED.label_fr,
  label_it            = EXCLUDED.label_it,
  table_name          = EXCLUDED.table_name,
  place_level         = EXCLUDED.place_level,
  is_root_level       = EXCLUDED.is_root_level,
  is_project_level    = EXCLUDED.is_project_level,
  is_subproject_level = EXCLUDED.is_subproject_level;
  -- NOTE: sql is intentionally excluded from ON CONFLICT — it is user-edited and must not be overwritten by CSV regeneration.
`

writeFileSync(sqlPath, sql, 'utf-8')
console.log(`Written ${rows.length} rows to ${sqlPath}`)
