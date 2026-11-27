import type { Database } from 'sql.js'
import type { PGlite } from '@electric-sql/pglite'
import { quoteIdent } from './exportProjectDump.ts'

// GeoPackage 1.3 core tables. No tile or extension tables are needed.
export async function initializeGeoPackage(
  sqlite: Database,
  tx: Pick<PGlite, 'query'>,
) {
  sqlite.run(`
    PRAGMA application_id = 0x47504b47;
    PRAGMA user_version = 10300;
    CREATE TABLE gpkg_spatial_ref_sys (
      srs_name TEXT NOT NULL, srs_id INTEGER NOT NULL PRIMARY KEY,
      organization TEXT NOT NULL, organization_coordsys_id INTEGER NOT NULL,
      definition TEXT NOT NULL, description TEXT);
    INSERT INTO gpkg_spatial_ref_sys VALUES
      ('Undefined Cartesian',-1,'NONE',-1,'undefined',NULL),
      ('Undefined geographic',0,'NONE',0,'undefined',NULL);
    CREATE TABLE gpkg_contents (
      table_name TEXT NOT NULL PRIMARY KEY, data_type TEXT NOT NULL, identifier TEXT UNIQUE,
      description TEXT DEFAULT '', last_change DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      min_x DOUBLE, min_y DOUBLE, max_x DOUBLE, max_y DOUBLE,
      srs_id INTEGER REFERENCES gpkg_spatial_ref_sys(srs_id));
    CREATE TABLE gpkg_geometry_columns (
      table_name TEXT NOT NULL UNIQUE REFERENCES gpkg_contents(table_name), column_name TEXT NOT NULL,
      geometry_type_name TEXT NOT NULL, srs_id INTEGER NOT NULL REFERENCES gpkg_spatial_ref_sys(srs_id),
      z TINYINT NOT NULL, m TINYINT NOT NULL, PRIMARY KEY(table_name,column_name));`)
  const {
    rows: [srs],
  } = await tx.query<{ srtext: string }>(
    'SELECT srtext FROM spatial_ref_sys WHERE srid=4326',
  )
  if (!srs?.srtext) throw new Error('Missing WGS 84 reference system')
  sqlite.run(
    "INSERT INTO gpkg_spatial_ref_sys VALUES ('WGS 84',4326,'EPSG',4326,?,NULL)",
    [srs.srtext],
  )
  const { rows } = await tx.query<{
    table_name: string
    column_name: string
    type: string
    srid: number
    coord_dimension: number
  }>(`
    SELECT f_table_name AS table_name, f_geometry_column AS column_name, type, srid, coord_dimension
    FROM geometry_columns WHERE f_table_schema='public'`)
  return new Map(rows.map((row) => [row.table_name, row]))
}

// Header: GP, version 0, little-endian/no envelope, SRID 4326. Bit 4
// distinguishes an empty geometry from a nonempty one; NULL stays NULL.
export const geoPackageGeometry = (column: string) => `(
  CASE WHEN ST_IsEmpty(${column}) THEN decode('47500011e6100000','hex')
       ELSE decode('47500001e6100000','hex') END || ST_AsBinary(${column},'NDR'))`

const families = {
  POINT: { number: 1, suffix: 'points' },
  LINESTRING: { number: 2, suffix: 'lines' },
  POLYGON: { number: 3, suffix: 'polygons' },
} as const

// Inspect the exported rows, not just the column typmod. One multipart
// feature per family and source row keeps UUIDs unique, even for nested collections.
export async function collectionLayers(
  tx: Pick<PGlite, 'query'>,
  table: string,
  column: string,
  where: string,
) {
  const geom = `t.${quoteIdent(column)}`
  const { rows } = await tx.query<{ kind: string; multi: boolean }>(`
    SELECT kind, bool_or(n > 1) AS multi FROM (
      SELECT t.ctid, GeometryType(d.geom) AS kind, count(*) AS n
      FROM ${quoteIdent(table)} t CROSS JOIN LATERAL ST_Dump(${geom}) d
      WHERE (${where}) AND NOT ST_IsEmpty(d.geom) GROUP BY t.ctid, kind
    ) parts GROUP BY kind ORDER BY kind`)
  return rows.map(({ kind, multi }) => {
    if (!Object.hasOwn(families, kind))
      throw new Error(`Unsupported geometry in ${table}: ${kind}`)
    const family = families[kind as keyof typeof families]
    const extracted = `ST_CollectionExtract(${geom},${family.number})`
    return {
      name: `${table}_${family.suffix}`,
      type: multi ? `MULTI${kind}` : kind,
      sql: multi ? `ST_Multi(${extracted})` : `ST_GeometryN(${extracted},1)`,
    }
  })
}

export function registerGeoPackageTable(
  sqlite: Database,
  table: string,
  column?: string,
  type?: string,
) {
  sqlite.run(
    'INSERT INTO gpkg_contents(table_name,identifier,data_type,srs_id) VALUES (?,?,?,?)',
    [table, table, type ? 'features' : 'attributes', type ? 4326 : null],
  )
  if (type && column)
    sqlite.run('INSERT INTO gpkg_geometry_columns VALUES (?,?,?,?,0,0)', [
      table,
      column,
      type,
      4326,
    ])
}
