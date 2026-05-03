#!/usr/bin/env node
// Regenerates backend/db/init/09_seedQcs.sql from seed-data/qcs.csv.
// Run from the project root: node backend/db/generate_qcs_sql.mjs

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

const csvPath = join(projectRoot, 'seed-data', 'qcs.csv')
const sqlPath = join(projectRoot, 'backend', 'db', 'init', '09_seedQcs.sql')

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
const rows = allRows.slice(1).filter((r) => r[0]?.trim())

// Escape single quotes for SQL string literals
const esc = (s) => (s ?? '').trim().replaceAll("'", "''")

const bool = (s) => ((s ?? '').trim() === 'true' ? 'true' : 'false')

const valueLines = rows
  .map((cols) => {
    // name_de;name_en;name_fr;name_it;is_root_level;is_project_level;is_subproject_level;filter_by_year;sql;description
    const [
      name_de,
      name_en,
      name_fr,
      name_it,
      is_root_level,
      is_project_level,
      is_subproject_level,
      filter_by_year,
      sql_val,
    ] = cols

    if (!name_de?.trim()) return null

    const sqlLiteral = (sql_val ?? '').trim() ? `'${esc(sql_val)}'` : 'NULL'

    return (
      `('${esc(name_de)}', '${esc(name_en)}', '${esc(name_fr)}', '${esc(name_it)}', ` +
      `${bool(is_root_level)}, ${bool(is_project_level)}, ${bool(is_subproject_level)}, ${bool(filter_by_year)}, ${sqlLiteral})`
    )
  })
  .filter(Boolean)
  .join(',\n')

const sql = `-- qcs: quality controls for data
-- Generated from seed-data/qcs.csv
-- Run \`node backend/db/generate_qcs_sql.mjs\` from project root to regenerate after editing the CSV.

INSERT INTO qcs (name_de, name_en, name_fr, name_it, is_root_level, is_project_level, is_subproject_level, filter_by_year, sql)
VALUES
${valueLines}
ON CONFLICT (name_de) DO UPDATE SET
  name_en             = EXCLUDED.name_en,
  name_fr             = EXCLUDED.name_fr,
  name_it             = EXCLUDED.name_it,
  is_root_level       = EXCLUDED.is_root_level,
  is_project_level    = EXCLUDED.is_project_level,
  is_subproject_level = EXCLUDED.is_subproject_level,
  filter_by_year      = EXCLUDED.filter_by_year;
  -- NOTE: sql is intentionally excluded from ON CONFLICT — it is user-edited and must not be overwritten by CSV regeneration.
`

writeFileSync(sqlPath, sql, 'utf-8')
console.log(`Written ${rows.length} rows to ${sqlPath}`)
