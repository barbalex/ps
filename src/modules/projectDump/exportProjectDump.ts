import type { PGlite } from '@electric-sql/pglite'

import {
  projectTables,
  projectTableWhere,
} from '../../../scripts/project-dump-tables.mjs'

/**
 * Project dump format (v1): plain SQL, one INSERT statement per line, the
 * rows carried as a jsonb array in a dollar-quoted literal:
 *
 *   INSERT INTO "places" ("place_id", …)
 *     SELECT "place_id", … FROM jsonb_populate_recordset(NULL::"places", $ps_dump$[…]$ps_dump$::jsonb)
 *     ON CONFLICT DO NOTHING;
 *
 * Valid SQL for psql / scripts/import-project-dump.mjs, and trivially
 * parseable by the in-app import (parseProjectDump) without a SQL parser.
 * Tables follow scripts/project-dump-tables.mjs (FK order); generated
 * columns are left out, geometries are written as hex EWKB text.
 */
export const DUMP_FORMAT_LINE = '-- arten-fördern.app project dump v1'
export const DUMP_TAG = '$ps_dump$'
const ROWS_PER_STATEMENT = 1000

export type DumpColumn = {
  column_name: string
  udt_name: string
  is_generated: string
}

export const tableColumns = async (
  db: Pick<PGlite, 'query'>,
  table: string,
): Promise<DumpColumn[]> => {
  const res = await db.query<DumpColumn>(
    `SELECT column_name, udt_name, is_generated
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [table],
  )
  return res.rows
}

const quoteIdent = (name: string) => `"${name.replaceAll('"', '""')}"`

export const dumpStatement = (
  table: string,
  columns: string[],
  rows: Record<string, unknown>[],
) => {
  const json = JSON.stringify(rows)
  if (json.includes(DUMP_TAG)) {
    throw new Error(`project dump: data of ${table} contains ${DUMP_TAG}`)
  }
  const cols = columns.map(quoteIdent).join(', ')
  return `INSERT INTO ${quoteIdent(table)} (${cols}) SELECT ${cols} FROM jsonb_populate_recordset(NULL::${quoteIdent(table)}, ${DUMP_TAG}${json}${DUMP_TAG}::jsonb) ON CONFLICT DO NOTHING;`
}

export type DumpProgress = { table: string; rows: number }

/**
 * Builds the dump of a project from the local database — i.e. of the rows
 * this user has synced. Returns the file as text parts (joined by the
 * caller into a Blob) plus counts.
 */
export const buildProjectDump = async (
  db: Pick<PGlite, 'query'>,
  projectId: string,
  onProgress?: (progress: DumpProgress) => void,
) => {
  const projectRes = await db.query<{ name: string | null }>(
    `SELECT name FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const projectName = projectRes.rows[0]?.name ?? null
  if (!projectRes.rows.length) {
    throw new Error(`project ${projectId} not found locally`)
  }

  const parts: string[] = [
    `${DUMP_FORMAT_LINE}\n`,
    `-- project_id: ${projectId}\n`,
    `-- name: ${projectName ?? ''}\n`,
    `-- exported: ${new Date().toISOString()}\n`,
    `-- Restore in the app: Projects › Import from SQL dumpfile. With psql: run\n`,
    `-- inside a transaction with SET LOCAL electric.syncing = 'true' (see\n`,
    `-- scripts/import-project-dump.mjs); tables are in foreign-key order.\n`,
  ]
  let rowCount = 0
  let tableCount = 0

  for (const { table } of projectTables) {
    const columns = await tableColumns(db, table)
    if (!columns.length) continue // table unknown to this schema version
    const plain = columns.filter((c) => c.is_generated === 'NEVER')
    const generated = columns
      .filter((c) => c.is_generated !== 'NEVER')
      .map((c) => c.column_name)
    const geometries = plain
      .filter((c) => c.udt_name === 'geometry')
      .map((c) => c.column_name)

    // to_jsonb(t) minus generated columns; geometries as hex EWKB text so
    // the restore goes through geometry_in (GeoJSON would lose the SRID)
    const geometryOverrides =
      geometries.length ?
        ` || jsonb_build_object(${geometries
          .map((g) => `'${g}', t.${quoteIdent(g)}::text`)
          .join(', ')})`
      : ''
    const minusGenerated =
      generated.length ?
        ` - ARRAY[${generated.map((g) => `'${g}'`).join(', ')}]::text[]`
      : ''
    const res = await db.query<{ row: Record<string, unknown> }>(
      `SELECT (to_jsonb(t)${minusGenerated})${geometryOverrides} AS row
       FROM ${quoteIdent(table)} t
       WHERE ${projectTableWhere(table, projectId)}`,
    )
    if (!res.rows.length) continue

    const columnNames = plain.map((c) => c.column_name)
    parts.push(`\n-- ${table} (${res.rows.length} rows)\n`)
    for (let i = 0; i < res.rows.length; i += ROWS_PER_STATEMENT) {
      const chunk = res.rows.slice(i, i + ROWS_PER_STATEMENT).map((r) => r.row)
      parts.push(`${dumpStatement(table, columnNames, chunk)}\n`)
    }
    rowCount += res.rows.length
    tableCount += 1
    onProgress?.({ table, rows: rowCount })
  }

  return { parts, rowCount, tableCount, projectName }
}

const safeFileName = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'project'

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string
    types?: { description: string; accept: Record<string, string[]> }[]
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>
      close: () => Promise<void>
    }>
  }>
}

/**
 * Saves the dump: native "save as" dialog where the File System Access API
 * exists (Chromium), else a download. Returns false when the user cancelled.
 */
export const saveProjectDump = async (
  parts: string[],
  projectName: string | null,
) => {
  const blob = new Blob(parts, { type: 'application/sql' })
  const date = new Date().toISOString().slice(0, 10)
  const fileName = `${safeFileName(projectName ?? 'project')}_${date}.sql`

  const picker = (window as SaveFilePickerWindow).showSaveFilePicker
  if (picker) {
    try {
      const handle = await picker({
        suggestedName: fileName,
        types: [
          { description: 'SQL dump', accept: { 'application/sql': ['.sql'] } },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return true
    } catch (error) {
      if ((error as Error).name === 'AbortError') return false
      throw error
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return true
}
