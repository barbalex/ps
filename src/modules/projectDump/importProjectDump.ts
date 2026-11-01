import type { PGlite } from '@electric-sql/pglite'
import { v7 as uuidv7 } from 'uuid'

import type { QueuedOperation } from '../../store.ts'
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

export type ImportProgress = { table: string; rows: number; total: number }

type ImportOptions = {
  db: Pick<PGlite, 'query'>
  dump: ParsedDump
  accountId: string
  onProgress?: (progress: ImportProgress) => void
}

const operation = (
  table: string,
  kind: 'insert' | 'insertMany',
  draft: Record<string, unknown> | Record<string, unknown>[],
): QueuedOperation => ({
  id: uuidv7(),
  time: new Date().toISOString(),
  table,
  operation: kind,
  draft,
})

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

  // columns unknown to this schema version are dropped (the server would
  // drop them too, but silently per row); access rows are never imported
  const operations: QueuedOperation[] = []
  let total = 0
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
    if (statement.table === 'projects') {
      for (const row of rows) row.account_id = accountId
      // a plain insert: the server's owner trigger needs the project row
      // committed before anything else — it is the first operation
      operations.push(...rows.map((row) => operation('projects', 'insert', row)))
    } else {
      for (let i = 0; i < rows.length; i += ROWS_PER_OPERATION) {
        operations.push(
          operation(
            statement.table,
            'insertMany',
            rows.slice(i, i + ROWS_PER_OPERATION),
          ),
        )
      }
    }
    total += rows.length
  }

  let done = 0
  const rowsOf = (op: QueuedOperation) =>
    Array.isArray(op.draft) ? op.draft.length : 1
  // the project row goes alone: its owner role must exist before the rest
  // is permission-checked, and a failure there must not take other
  // operations along
  const batches: QueuedOperation[][] = [operations.slice(0, 1)]
  for (let i = 1; i < operations.length; i += OPERATIONS_PER_REQUEST) {
    batches.push(operations.slice(i, i + OPERATIONS_PER_REQUEST))
  }
  try {
    for (const batch of batches) {
      const results = await applyOperations(batch)
      const failed = results.find((r) => r.status !== 'applied')
      if (failed) {
        const op = batch[failed.op_index]
        throw new ProjectDumpError(
          'server',
          `${op?.table ?? '?'}: ${failed.status}${failed.detail ? ` — ${failed.detail}` : ''}`,
          dump.projectName,
        )
      }
      done += batch.reduce((sum, op) => sum + rowsOf(op), 0)
      onProgress?.({ table: batch.at(-1)?.table ?? '', rows: done, total })
    }
  } catch (error) {
    // no half-imported project: the cascade removes what already landed
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
    if (error instanceof ProjectDumpError) throw error
    throw new ProjectDumpError(
      'server',
      (error as Error).message,
      dump.projectName,
    )
  }

  return { projectId: dump.projectId, projectName: dump.projectName, rowCount: total }
}
