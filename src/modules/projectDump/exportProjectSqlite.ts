import type { PGlite } from '@electric-sql/pglite'
import initSqlJs, { type SqlValue } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'
import { validate as isUuid } from 'uuid'

import {
  projectTables,
  projectTableWhere,
} from '../../../scripts/project-dump-tables.mjs'
import { quoteIdent, tableColumns } from './exportProjectDump.ts'

type Key = {
  table_name: string
  kind: string
  columns: string[]
  parent: string | null
  parent_columns: string[]
}
const names = projectTables.map(({ table }) => table)
const columnList = (cols: string[]) => cols.map(quoteIdent).join(', ')

function sqliteType(type: string) {
  if (['int2', 'int4', 'int8', 'bool'].includes(type)) return 'INTEGER'
  if (['float4', 'float8'].includes(type)) return 'REAL'
  if (type === 'bytea') return 'BLOB'
  return 'TEXT'
}

export async function buildProjectSqlite(
  db: Pick<PGlite, 'transaction'>,
  projectId: string,
) {
  if (!isUuid(projectId)) throw new Error('Invalid project UUID')
  const SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const sqlite = new SQL.Database()
  try {
    return await db.transaction(async (tx) => {
      const {
        rows: [project],
      } = await tx.query<{ name: string | null }>(
        'SELECT name FROM projects WHERE project_id=$1',
        [projectId],
      )
      if (!project) throw new Error(`Project ${projectId} not found locally`)
      const { rows: keys } = await tx.query<Key>(
        `
        SELECT t.relname AS table_name, c.contype AS kind, p.relname AS parent,
          ARRAY(SELECT a.attname FROM unnest(c.conkey) WITH ORDINALITY AS k(num,ord)
            JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k.num ORDER BY ord) AS columns,
          ARRAY(SELECT a.attname FROM unnest(c.confkey) WITH ORDINALITY AS k(num,ord)
            JOIN pg_attribute a ON a.attrelid=c.confrelid AND a.attnum=k.num ORDER BY ord) AS parent_columns
        FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid LEFT JOIN pg_class p ON p.oid=c.confrelid
        WHERE t.relnamespace='public'::regnamespace AND t.relname=ANY($1)
          AND (c.contype='p' OR (c.contype='f' AND p.relnamespace=t.relnamespace AND p.relname=ANY($1)))`,
        [names],
      )
      let rowCount = 0
      let tableCount = 0
      sqlite.run('PRAGMA foreign_keys=OFF; BEGIN')
      for (const table of names) {
        const columns = await tableColumns(tx, table)
        if (!columns.length) continue
        const definitions = columns.map(
          (c) => `${quoteIdent(c.column_name)} ${sqliteType(c.udt_name)}`,
        )
        for (const k of keys.filter((k) => k.table_name === table)) {
          definitions.push(
            k.kind === 'p' ?
              `PRIMARY KEY (${columnList(k.columns)})`
            : `FOREIGN KEY (${columnList(k.columns)}) REFERENCES ${quoteIdent(k.parent!)} (${columnList(k.parent_columns)})`,
          )
        }
        sqlite.run(
          `CREATE TABLE ${quoteIdent(table)} (${definitions.join(',')})`,
        )
        const select = columns.map((c) => {
          const col = quoteIdent(c.column_name)
          if (c.udt_name === 'geometry')
            return `ST_AsGeoJSON(t.${col},17) AS ${col}`
          if (c.udt_name === 'bool') return `t.${col}::int AS ${col}`
          if (c.udt_name === 'bytea') return `t.${col}`
          // Bind exact PostgreSQL text, including bigint/decimal values that exceed JS precision.
          return `t.${col}::text AS ${col}`
        })
        await tx.exec(
          `DECLARE sqlite_rows CURSOR FOR SELECT ${select.join(',')} FROM ${quoteIdent(table)} t WHERE ${projectTableWhere(table, projectId)}`,
        )
        const insert = sqlite.prepare(
          `INSERT INTO ${quoteIdent(table)} VALUES (${columns.map(() => '?').join(',')})`,
        )
        try {
          for (;;) {
            const { rows } = await tx.query<Record<string, SqlValue>>(
              'FETCH 500 FROM sqlite_rows',
            )
            for (const row of rows)
              insert.run(columns.map((c) => row[c.column_name]))
            rowCount += rows.length
            if (rows.length < 500) break
          }
        } finally {
          insert.free()
        }
        await tx.exec('CLOSE sqlite_rows')
        tableCount++
      }
      sqlite.run('COMMIT; PRAGMA foreign_keys=ON')
      // Partial role-based sync can leave an internal reference outside this snapshot.
      // Keep the original UUID rather than inventing a parent or dropping the child.
      const missingReferences = Number(
        sqlite.exec('SELECT count(*) FROM pragma_foreign_key_check')[0]
          .values[0][0],
      )
      return {
        blob: new Blob([new Uint8Array(sqlite.export())], {
          type: 'application/vnd.sqlite3',
        }),
        projectName: project.name,
        tableCount,
        rowCount,
        missingReferences,
      }
    })
  } finally {
    sqlite.close()
  }
}
