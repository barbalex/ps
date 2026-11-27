import type { PGlite } from '@electric-sql/pglite'
import initSqlJs, { type SqlValue } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url'
import { validate as isUuid } from 'uuid'

import {
  projectTables,
  projectTableWhere,
} from '../../../scripts/project-dump-tables.mjs'
import { quoteIdent, tableColumns } from './exportProjectDump.ts'
import {
  collectionLayers,
  geoPackageGeometry,
  initializeGeoPackage,
  registerGeoPackageTable,
} from './geoPackage.ts'

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
  format: 'sqlite' | 'gpkg' = 'sqlite',
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
      const layers =
        format === 'gpkg' ? await initializeGeoPackage(sqlite, tx) : undefined
      for (const table of names) {
        const columns = await tableColumns(tx, table)
        if (!columns.length) continue
        const layer = layers?.get(table)
        const where = projectTableWhere(table, projectId)
        const families =
          layer?.type === 'GEOMETRYCOLLECTION' || layer?.type === 'GEOMETRY' ?
            await collectionLayers(tx, table, layer.column_name, where)
          : undefined
        const mainType =
          families ?
            families.length === 1 ?
              families[0].type
            : undefined
          : layer?.type
        const definitions = columns.map((c) => {
          let type = sqliteType(c.udt_name)
          if (layers && c.udt_name === 'geometry') {
            if (
              !layer ||
              layer.column_name !== c.column_name ||
              layer.srid !== 4326 ||
              layer.coord_dimension !== 2 ||
              ![
                'GEOMETRY',
                'POINT',
                'MULTIPOINT',
                'LINESTRING',
                'MULTILINESTRING',
                'POLYGON',
                'MULTIPOLYGON',
                'GEOMETRYCOLLECTION',
              ].includes(layer.type)
            )
              throw new Error(
                `Unsupported GeoPackage geometry: ${table}.${c.column_name}`,
              )
            type = mainType ?? 'BLOB'
          }
          return `${quoteIdent(c.column_name)} ${type}`
        })
        if (layers) definitions.unshift('fid INTEGER PRIMARY KEY AUTOINCREMENT')
        for (const k of keys.filter((k) => k.table_name === table)) {
          definitions.push(
            k.kind === 'p' ?
              `${layers ? 'UNIQUE' : 'PRIMARY KEY'} (${columnList(k.columns)})`
            : `FOREIGN KEY (${columnList(k.columns)}) REFERENCES ${quoteIdent(k.parent!)} (${columnList(k.parent_columns)})`,
          )
        }
        sqlite.run(
          `CREATE TABLE ${quoteIdent(table)} (${definitions.join(',')})`,
        )
        if (layers) {
          registerGeoPackageTable(sqlite, table, layer?.column_name, mainType)
        }
        const select = columns.map((c) => {
          const col = quoteIdent(c.column_name)
          if (c.udt_name === 'geometry') {
            const source = `t.${col}`
            const value = mainType ? geoPackageGeometry(families?.[0]?.sql ?? source)
              : layers ? `ST_AsEWKB(${source})` : `ST_AsGeoJSON(${source},17)`
            return `${value} AS ${col}`
          }
          if (c.udt_name === 'bool') return `t.${col}::int AS ${col}`
          if (c.udt_name === 'bytea') return `t.${col}`
          // Bind exact PostgreSQL text, including bigint/decimal values that exceed JS precision.
          return `t.${col}::text AS ${col}`
        })
        const parts = families && families.length > 1 ? families : []
        const pk = keys.find(
          (k) => k.table_name === table && k.kind === 'p',
        )?.columns
        const extra = parts.map((part) => {
          if (pk?.length !== 1 || !layer)
            throw new Error(`Missing geometry source key: ${table}`)
          const id = quoteIdent(pk[0]),
            name = quoteIdent(part.name),
            col = quoteIdent(layer.column_name)
          sqlite.run(
            `CREATE TABLE ${name} (fid INTEGER PRIMARY KEY AUTOINCREMENT, ${id} TEXT NOT NULL UNIQUE REFERENCES ${quoteIdent(table)}(${id}), ${col} ${part.type} NOT NULL)`,
          )
          registerGeoPackageTable(
            sqlite,
            part.name,
            layer.column_name,
            part.type,
          )
          select.push(
            `CASE WHEN NOT ST_IsEmpty(${part.sql}) THEN ${geoPackageGeometry(part.sql)} END AS ${name}`,
          )
          return {
            key: pk[0],
            alias: part.name,
            insert: sqlite.prepare(
              `INSERT INTO ${name} (${id},${col}) VALUES (?,?)`,
            ),
          }
        })
        await tx.exec(
          `DECLARE sqlite_rows CURSOR FOR SELECT ${select.join(',')} FROM ${quoteIdent(table)} t WHERE ${where}`,
        )
        const insert = sqlite.prepare(
          `INSERT INTO ${quoteIdent(table)} (${columnList(columns.map((c) => c.column_name))}) VALUES (${columns.map(() => '?').join(',')})`,
        )
        try {
          for (;;) {
            const { rows } = await tx.query<Record<string, SqlValue>>(
              'FETCH 500 FROM sqlite_rows',
            )
            for (const row of rows) {
              insert.run(columns.map((c) => row[c.column_name]))
              for (const part of extra) {
                if (row[part.alias] !== null)
                  part.insert.run([row[part.key], row[part.alias]])
              }
            }
            rowCount += rows.length
            if (rows.length < 500) break
          }
        } finally {
          insert.free()
          for (const part of extra) part.insert.free()
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
          type:
            layers ?
              'application/geopackage+sqlite3'
            : 'application/vnd.sqlite3',
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
