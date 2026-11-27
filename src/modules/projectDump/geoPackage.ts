import type { Database } from 'sql.js'
import type { PGlite } from '@electric-sql/pglite'

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
