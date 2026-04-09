#!/usr/bin/env node
// Regenerates backend/db/init/10_qcs.sql from seed-data/qcs.csv.
// Run from the project root: node backend/db/generate_qcs_sql.mjs

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

const csvPath = join(projectRoot, 'seed-data', 'qcs.csv')
const sqlPath = join(projectRoot, 'backend', 'db', 'init', '10_qcs.sql')

const csv = readFileSync(csvPath, 'utf-8')

// RFC 4180-compliant CSV parser (handles quoted fields with embedded newlines)
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
        i++
      } else {
        field += ch
        i++
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
      } else if (ch === delimiter) {
        row.push(field)
        field = ''
        i++
      } else if (ch === '\r' && text[i + 1] === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
        i += 2
      } else if (ch === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
        i++
      } else {
        field += ch
        i++
      }
    }
  }
  if (row.length > 0 || field) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const allRows = parseCSV(csv)
// skip header, skip empty trailing rows
const rows = allRows.slice(1).filter((r) => r[4]?.trim())

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
  .map((cols) => {
    // label_de;label_en;label_fr;label_it;name;table_name;place_level;is_root_level;is_project_level;is_subproject_level;filter_by_year;sql;sort;description
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
      filter_by_year,
      sql_val,
    ] = cols

    if (!name?.trim()) return null

    const sqlLiteral = (sql_val ?? '').trim() ? `'${esc(sql_val)}'` : 'NULL'

    return (
      `('${esc(name)}', '${esc(label_de)}', '${esc(label_en)}', '${esc(label_fr)}', '${esc(label_it)}', ` +
      `'${esc(table_name)}', ${placeLevel(place_level_raw)}, ${bool(is_root_level)}, ${bool(is_project_level)}, ${bool(is_subproject_level)}, ${bool(filter_by_year)}, ${sqlLiteral})`
    )
  })
  .filter(Boolean)
  .join(',\n')

const sql = `-- qcs: quality controls for data
-- Generated from seed-data/qcs.csv
-- Run \`node backend/db/generate_qcs_sql.mjs\` from project root to regenerate after editing the CSV.
--
-- place_level: NULL means the QC applies to all place levels (1 and 2).
--              An integer (1 or 2) restricts it to that specific place level.

INSERT INTO qcs (name, label_de, label_en, label_fr, label_it, table_name, place_level, is_root_level, is_project_level, is_subproject_level, filter_by_year, sql)
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
  is_subproject_level = EXCLUDED.is_subproject_level,
  filter_by_year      = EXCLUDED.filter_by_year;
  -- NOTE: sql is intentionally excluded from ON CONFLICT — it is user-edited and must not be overwritten by CSV regeneration.
`

writeFileSync(sqlPath, sql, 'utf-8')
console.log(`Written ${rows.length} rows to ${sqlPath}`)
