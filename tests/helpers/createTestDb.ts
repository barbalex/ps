import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { postgis } from '@electric-sql/pglite-postgis'

/**
 * A real in-memory Postgres loaded with the app's actual SQL schema
 * (the same files ElectricSQL syncs into the browser).
 * Order matters: uuidv7/immutableDate define functions used by
 * generated columns in createTables.sql.
 */
const SQL_FILES = [
  'uuidv7.sql',
  'immutableDate.sql',
  'createTables.sql',
  'triggers.sql',
] as const

export type TestFixture = {
  db: PGlite
  ids: {
    reader: string
    writer: string
    designer: string
    outsider: string
    stranger: string
    project: string
    subproject: string
    place: string
    otherPlace: string
    action: string
    wmsLayer: string
    account: string
  }
}

export async function createTestDb(): Promise<TestFixture> {
  const db = await PGlite.create({
    extensions: { postgis },
  })
  await db.exec('CREATE EXTENSION IF NOT EXISTS postgis;')

  for (const file of SQL_FILES) {
    const sql = readFileSync(
      new URL(`../../src/sql/${file}`, import.meta.url),
      'utf8',
    )
    await db.exec(sql)
  }

  const ids = {
    reader: '00000000-0000-7000-8000-000000000001',
    writer: '00000000-0000-7000-8000-000000000002',
    designer: '00000000-0000-7000-8000-000000000003',
    outsider: '00000000-0000-7000-8000-000000000004',
    stranger: '00000000-0000-7000-8000-000000000005',
    project: '10000000-0000-7000-8000-000000000001',
    subproject: '20000000-0000-7000-8000-000000000001',
    place: '30000000-0000-7000-8000-000000000001',
    otherPlace: '30000000-0000-7000-8000-000000000002',
    action: '40000000-0000-7000-8000-000000000001',
    wmsLayer: '50000000-0000-7000-8000-000000000001',
    account: '60000000-0000-7000-8000-000000000001',
  }

  // Role inheritance happens via triggers at write time:
  // - inserting subprojects copies general project roles into subproject_users
  // - inserting places copies general subproject roles into place_users
  // So writer/designer/outsider end up with lower-level rows automatically;
  // only role grants that inheritance can't produce are inserted manually.
  await db.exec(`
    INSERT INTO users (user_id, email) VALUES
      ('${ids.reader}', 'reader@example.com'),
      ('${ids.writer}', 'writer@example.com'),
      ('${ids.designer}', 'designer@example.com'),
      ('${ids.outsider}', 'outsider@example.com'),
      ('${ids.stranger}', 'stranger@example.com');

    -- account owned by writer (for project-creation checks)
    INSERT INTO accounts (account_id, user_id, type) VALUES
      ('${ids.account}', '${ids.writer}', 'free');

    INSERT INTO projects (project_id, name) VALUES
      ('${ids.project}', 'Test Project');

    INSERT INTO project_users (project_id, user_id, role) VALUES
      ('${ids.project}', '${ids.reader}', 'read-all'),
      ('${ids.project}', '${ids.writer}', 'write-all'),
      ('${ids.project}', '${ids.designer}', 'design');

    INSERT INTO subprojects (subproject_id, project_id, name) VALUES
      ('${ids.subproject}', '${ids.project}', 'Test Subproject');

    -- outsider only has a subproject-level role (general: inherited into places)
    INSERT INTO subproject_users (subproject_id, user_id, role) VALUES
      ('${ids.subproject}', '${ids.outsider}', 'read-all');

    INSERT INTO places (place_id, subproject_id, level) VALUES
      ('${ids.place}', '${ids.subproject}', 1),
      ('${ids.otherPlace}', '${ids.subproject}', 1);

    -- stranger only has a role on otherPlace
    INSERT INTO place_users (place_id, user_id, role) VALUES
      ('${ids.otherPlace}', '${ids.stranger}', 'read-specific');

    INSERT INTO actions (action_id, place_id) VALUES
      ('${ids.action}', '${ids.place}');

    INSERT INTO wms_layers (wms_layer_id, project_id) VALUES
      ('${ids.wmsLayer}', '${ids.project}');
  `)

  return { db, ids }
}
