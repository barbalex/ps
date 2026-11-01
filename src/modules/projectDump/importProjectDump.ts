import type { PGlite } from '@electric-sql/pglite'
import { v7 as uuidv7 } from 'uuid'

import type { QueuedOperation } from '../../store.ts'
import {
  projectTables,
  projectTableWhere,
} from '../../../scripts/project-dump-tables.mjs'
import { applyOperations } from '../applyOperations.ts'
import { tableColumns } from './exportProjectDump.ts'
import { ProjectDumpError, type ParsedDump } from './parseProjectDump.ts'

export { parseProjectDump, ProjectDumpError } from './parseProjectDump.ts'
export type { ParsedDump, DumpStatement } from './parseProjectDump.ts'

/**
 * Imports a project dump (format: see exportProjectDump.ts) by uploading
 * its rows to the server through apply_operations, in foreign-key order and
 * in chunks. Nothing is written locally: the server's triggers give the
 * importing user the owner role, Electric then streams the project down
 * like any other. Ids are kept verbatim (restore semantics); the project is
 * attached to the chosen account; access rows (project_users, *_roles) are
 * not imported — the server recreates the owner's and cascades them.
 */

const ROWS_PER_OPERATION = 250
const OPERATIONS_PER_REQUEST = 4
const ACCESS_TABLES = new Set([
  'project_users',
  'project_roles',
  'subproject_roles',
  'place_roles',
])

/** the rows the import uploads (access rows excluded), i.e. what will arrive by sync */
export const importedRowCount = (dump: ParsedDump) =>
  dump.statements
    .filter((s) => !ACCESS_TABLES.has(s.table))
    .reduce((sum, s) => sum + s.rows.length, 0)

/**
 * How many of the imported project's rows have arrived locally — the
 * server needs minutes to stream a large import (Electric evaluates every
 * row against all subquery shapes), so the arrival is tracked separately
 * from the upload. One query summing the project's rows per dumped table.
 */
export const countArrivedRows = async (
  db: Pick<PGlite, 'query'>,
  dump: ParsedDump,
) => {
  const tables = [
    ...new Set(
      dump.statements
        .map((s) => s.table)
        .filter((t) => !ACCESS_TABLES.has(t)),
    ),
  ]
  const res = await db.query<{ n: number }>(
    `SELECT (${tables
      .map(
        (t) =>
          `(SELECT count(*) FROM "${t}" WHERE ${projectTableWhere(t, dump.projectId)})`,
      )
      .join(' + ')})::int AS n`,
  )
  return res.rows[0]?.n ?? 0
}
// rows the server's insert triggers create on their own (projects and
// place_levels → vector_layers → vector_layer_displays + layer_presentations,
// wms_layers → layer_presentations) with fresh ids. They would collide with
// the dump's rows (unique layer names, duplicate presentations), so they are
// removed right before the dump's version of the table goes in; the cascade
// takes the displays along
const TRIGGER_DERIVED_TABLES = new Set(['vector_layers', 'layer_presentations'])

export type ImportProgress = { table: string; rows: number; total: number }

type ImportOptions = {
  db: Pick<PGlite, 'query'>
  dump: ParsedDump
  accountId: string
  onProgress?: (progress: ImportProgress) => void
}

type Row = Record<string, unknown>

const operation = (
  table: string,
  kind: 'insert' | 'insertMany',
  draft: Row | Row[],
): QueuedOperation => ({
  id: uuidv7(),
  time: new Date().toISOString(),
  table,
  operation: kind,
  draft,
})

const tableIndex = new Map(projectTables.map((entry, i) => [entry.table, i]))

type ForeignKey = { table: string; column: string; ref: string }

/**
 * Every upload request is its own transaction, so a row may only reference
 * rows uploaded before it. Foreign keys pointing at a table LATER in the
 * import order (projects.*_default_unit_id → units) are stripped on insert
 * and set by updates at the end; self references (places.parent_id) are
 * handled by ordering parents before children.
 */
const foreignKeys = async (db: Pick<PGlite, 'query'>) => {
  const res = await db.query<ForeignKey>(
    `SELECT c.conrelid::regclass::text AS table, a.attname AS column,
            c.confrelid::regclass::text AS ref
     FROM pg_constraint c
     JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
     WHERE c.contype = 'f' AND c.connamespace = 'public'::regnamespace`,
  )
  const forward = new Map<string, string[]>()
  const self = new Map<string, string>()
  for (const fk of res.rows) {
    const own = tableIndex.get(fk.table)
    const other = tableIndex.get(fk.ref)
    if (own === undefined || other === undefined) continue
    if (fk.table === fk.ref) self.set(fk.table, fk.column)
    else if (other > own) {
      forward.set(fk.table, [...(forward.get(fk.table) ?? []), fk.column])
    }
  }
  return { forward, self }
}

const primaryKey = async (db: Pick<PGlite, 'query'>, table: string) => {
  const res = await db.query<{ attname: string }>(
    `SELECT a.attname FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
     WHERE i.indrelid = $1::regclass AND i.indisprimary`,
    [table],
  )
  return res.rows[0]?.attname ?? null
}

/** parents before children; rows whose parent is missing come last */
const orderByParent = (rows: Row[], idColumn: string, parentColumn: string) => {
  const byId = new Map(rows.map((row) => [row[idColumn], row]))
  const emitted = new Set<unknown>()
  const ordered: Row[] = []
  let pending = rows
  while (pending.length) {
    const next = pending.filter((row) => {
      const parent = row[parentColumn]
      return parent == null || emitted.has(parent) || !byId.has(parent)
    })
    if (!next.length) break // a cycle: append as is
    for (const row of next) {
      ordered.push(row)
      emitted.add(row[idColumn])
    }
    pending = pending.filter((row) => !emitted.has(row[idColumn]))
  }
  return [...ordered, ...pending]
}

/** uploads the dump; resolves with the row count, rejects with ProjectDumpError */
export const importProjectDump = async ({
  db,
  dump,
  accountId,
  onProgress,
}: ImportOptions) => {
  if (!navigator.onLine) {
    throw new ProjectDumpError('offline', 'import needs a server connection')
  }
  const exists = await db.query<{ exists: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM projects WHERE project_id = $1) AS exists`,
    [dump.projectId],
  )
  if (exists.rows[0]?.exists) {
    throw new ProjectDumpError(
      'exists',
      `project ${dump.projectId} already exists`,
      dump.projectName,
    )
  }

  const { forward, self } = await foreignKeys(db)

  // rows per table in the canonical FK order (not the file's), columns
  // unknown to this schema version dropped (the server would drop them too,
  // but silently per row); access rows are never imported
  const rowsByTable = new Map<string, Row[]>()
  for (const statement of dump.statements) {
    if (ACCESS_TABLES.has(statement.table)) continue
    const localColumns = new Set(
      (await tableColumns(db, statement.table))
        .filter((c) => c.is_generated === 'NEVER')
        .map((c) => c.column_name),
    )
    const keep = statement.columns.filter((c) => localColumns.has(c))
    const rows = statement.rows.map((row) =>
      Object.fromEntries(keep.map((c) => [c, row[c] ?? null])),
    )
    rowsByTable.set(statement.table, [
      ...(rowsByTable.get(statement.table) ?? []),
      ...rows,
    ])
  }

  const operations: QueuedOperation[] = []
  const deferredUpdates: QueuedOperation[] = []
  let total = 0
  for (const { table } of projectTables) {
    let rows = rowsByTable.get(table)
    if (!rows?.length) continue
    const pk = await primaryKey(db, table)

    const forwardColumns = forward.get(table) ?? []
    if (forwardColumns.length && pk) {
      for (const row of rows) {
        const draft: Row = {}
        for (const column of forwardColumns) {
          if (row[column] == null) continue
          draft[column] = row[column]
          row[column] = null
        }
        if (Object.keys(draft).length) {
          deferredUpdates.push({
            id: uuidv7(),
            time: new Date().toISOString(),
            table,
            operation: 'update',
            rowIdName: pk,
            rowId: row[pk] as string,
            draft,
          })
        }
      }
    }
    const selfColumn = self.get(table)
    if (selfColumn && pk) rows = orderByParent(rows, pk, selfColumn)

    if (TRIGGER_DERIVED_TABLES.has(table)) {
      operations.push({
        id: uuidv7(),
        time: new Date().toISOString(),
        table,
        operation: 'delete',
        filter: { column: 'project_id', function: 'eq', value: dump.projectId },
      })
    }

    if (table === 'projects') {
      for (const row of rows) row.account_id = accountId
      // a plain insert: the server's owner trigger needs the project row
      // committed before anything else — it is the first operation
      operations.push(...rows.map((row) => operation('projects', 'insert', row)))
    } else {
      for (let i = 0; i < rows.length; i += ROWS_PER_OPERATION) {
        operations.push(
          operation(table, 'insertMany', rows.slice(i, i + ROWS_PER_OPERATION)),
        )
      }
    }
    total += rows.length
  }
  operations.push(...deferredUpdates)

  let done = 0
  const rowsOf = (op: QueuedOperation) =>
    op.operation !== 'insert' && op.operation !== 'insertMany' ? 0
    : Array.isArray(op.draft) ? op.draft.length
    : 1
  // the project row goes alone: its owner role must exist before the rest
  // is permission-checked, and a failure there must not take other
  // operations along
  const batches: QueuedOperation[][] = [operations.slice(0, 1)]
  for (let i = 1; i < operations.length; i += OPERATIONS_PER_REQUEST) {
    batches.push(operations.slice(i, i + OPERATIONS_PER_REQUEST))
  }
  let projectInserted = false
  try {
    for (const batch of batches) {
      const results = await applyOperations(batch)
      const failed = results.find((r) => r.status !== 'applied')
      if (failed) {
        const op = batch[failed.op_index]
        // the project row itself still exists on the server: a local delete
        // not yet flushed, or the project was never deleted there
        if (op?.table === 'projects' && failed.status === 'duplicate') {
          throw new ProjectDumpError(
            'exists',
            `project ${dump.projectId} exists on the server`,
            dump.projectName,
          )
        }
        throw new ProjectDumpError(
          'server',
          `${op?.table ?? '?'}: ${failed.status}${failed.detail ? ` — ${failed.detail}` : ''}`,
          dump.projectName,
        )
      }
      projectInserted = true
      done += batch.reduce((sum, op) => sum + rowsOf(op), 0)
      onProgress?.({ table: batch.at(-1)?.table ?? '', rows: done, total })
    }
  } catch (error) {
    // no half-imported project: the cascade removes what already landed —
    // only for a project THIS import created
    if (projectInserted) {
      await applyOperations([
        {
          id: uuidv7(),
          time: new Date().toISOString(),
          table: 'projects',
          operation: 'delete',
          rowIdName: 'project_id',
          rowId: dump.projectId,
        },
      ]).catch(() => undefined)
    }
    if (error instanceof ProjectDumpError) throw error
    throw new ProjectDumpError(
      'server',
      (error as Error).message,
      dump.projectName,
    )
  }

  return { projectId: dump.projectId, projectName: dump.projectName, rowCount: total }
}
