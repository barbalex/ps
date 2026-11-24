import type { QueryableDb } from './geoQueries.ts'
import { inferPkColumn } from './inferPkColumn.ts'

// The database's ON DELETE CASCADE graph, discovered from pg_constraint so
// it stays correct as the schema evolves. Used to (a) warn the user before
// a delete takes child rows with it and (b) capture everything a delete
// will destroy so the undo bar can restore it.

export type CascadeColumnPair = { child: string; parent: string }

export type CascadeConstraint = {
  parentTable: string
  childTable: string
  columns: CascadeColumnPair[]
}

export type CascadeLevel = { table: string; rows: Record<string, unknown>[] }

// role rows gate the write-permission checks of the data rows referencing
// them (checks etc. are checked against place_roles) — when restoring a
// cascade they must be re-inserted before the other rows of their level,
// or the server would reject the data rows (no roles to check against)
const ROLE_TABLES = new Set(['project_roles', 'subproject_roles', 'place_roles'])

const graphCache = new WeakMap<object, Promise<CascadeConstraint[]>>()

export const getCascadeGraph = async (db: QueryableDb): Promise<CascadeConstraint[]> => {
  const cached = graphCache.get(db as object)
  if (cached) return cached
  const promise = (async () => {
    const res = await db.query(
      `SELECT
        con.confrelid::regclass::text AS parent_table,
        con.conrelid::regclass::text AS child_table,
        json_agg(
          json_build_object('child', src.attname, 'parent', tgt.attname)
          ORDER BY k.ord
        ) AS column_pairs
      FROM pg_constraint con
      JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord) ON true
      JOIN LATERAL unnest(con.confkey) WITH ORDINALITY AS p(attnum, ord) ON p.ord = k.ord
      JOIN pg_attribute src ON src.attrelid = con.conrelid AND src.attnum = k.attnum
      JOIN pg_attribute tgt ON tgt.attrelid = con.confrelid AND tgt.attnum = p.attnum
      WHERE con.contype = 'f' AND con.confdeltype = 'c'
      GROUP BY con.oid, con.confrelid, con.conrelid`,
    )
    return (res.rows as Record<string, unknown>[]).map((r) => ({
      parentTable: String(r.parent_table).replace(/^public\./, ''),
      childTable: String(r.child_table).replace(/^public\./, ''),
      columns: r.column_pairs as CascadeColumnPair[],
    }))
  })()
  graphCache.set(db as object, promise)
  return promise
}

// children SQL for the given parent rows: WHERE (fk cols) IN (tuples)
const childRowsWhere = (
  constraint: CascadeConstraint,
  parentRows: Record<string, unknown>[],
): { where: string; args: unknown[] } => {
  const childCols = constraint.columns.map((c) => c.child)
  const tuples = parentRows
    .map((row) => constraint.columns.map((c) => row[c.parent]))
    // nullable fk columns never cascade
    .filter((values) => values.every((v) => v != null))
  if (!tuples.length) return { where: 'false', args: [] }
  const colsSql = childCols.join(', ')
  let index = 0
  const tupleSql = tuples
    .map((values) => `(${values.map(() => `$${++index}`).join(', ')})`)
    .join(', ')
  const where =
    childCols.length > 1
      ? `(${colsSql}) IN (${tupleSql})`
      : `${colsSql} IN (${tupleSql})`
  return {
    where,
    args: tuples.flat(),
  }
}

// walks the cascade from the root row, breadth-first: level 0 is the root
// row itself, level n the rows cascade-deleted with level n-1's rows.
// tables without locally present rows simply contribute nothing.
export const captureCascadeClosure = async (
  db: QueryableDb,
  root: { table: string; rowIdName: string; rowId: string },
): Promise<CascadeLevel[]> => {
  const graph = await getCascadeGraph(db)
  const rootRes = await db.query(
    `SELECT * FROM ${root.table} WHERE ${root.rowIdName} = $1`,
    [root.rowId],
  )
  const rootRow = rootRes.rows[0] as Record<string, unknown> | undefined
  if (!rootRow) return []

  // visited keys must carry the pk VALUE — inferPkColumn only names the
  // column; a name-only key would make every row of a table collide
  const pkOf = (table: string, row: Record<string, unknown>): string => {
    const pk = inferPkColumn(table, row)
    return `${table}:${pk != null ? row[pk] : JSON.stringify(row)}`
  }

  const visited = new Set([pkOf(root.table, rootRow)])
  const levels: CascadeLevel[] = [{ table: root.table, rows: [rootRow] }]
  let frontier: { table: string; row: Record<string, unknown> }[] = [
    { table: root.table, row: rootRow },
  ]

  for (let depth = 0; depth < 10 && frontier.length; depth++) {
    const frontierTables = new Set(frontier.map((f) => f.table))
    const next: { table: string; row: Record<string, unknown> }[] = []
    for (const constraint of graph) {
      if (!frontierTables.has(constraint.parentTable)) continue
      const parentRows = frontier
        .filter((f) => f.table === constraint.parentTable)
        .map((f) => f.row)
      const { where, args } = childRowsWhere(constraint, parentRows)
      if (!args.length) continue
      const res = await db.query(
        `SELECT * FROM ${constraint.childTable} WHERE ${where}`,
        args,
      )
      for (const row of res.rows as Record<string, unknown>[]) {
        const key = pkOf(constraint.childTable, row)
        if (visited.has(key)) continue
        visited.add(key)
        next.push({ table: constraint.childTable, row })
      }
    }
    if (!next.length) break
    // group by table, role tables before the rest (see ROLE_TABLES)
    const byTable = new Map<string, Record<string, unknown>[]>()
    for (const { table, row } of next) {
      const rows = byTable.get(table) ?? []
      rows.push(row)
      byTable.set(table, rows)
    }
    const sortedTables = [...byTable.keys()].sort(
      (a, b) => Number(ROLE_TABLES.has(b)) - Number(ROLE_TABLES.has(a)),
    )
    for (const table of sortedTables) {
      levels.push({ table, rows: byTable.get(table)! })
    }
    frontier = next
  }
  return levels
}
