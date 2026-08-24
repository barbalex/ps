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
  // - inserting subprojects copies general project roles into subproject_roles
  // - inserting places copies general subproject roles into place_roles
  // So writer/designer/reader end up with lower-level rows automatically;
  // only role grants that inheritance can't produce are inserted manually.
  await db.exec(`
    INSERT INTO users (user_id, email) VALUES
      ('${ids.reader}', 'reader@example.com'),
      ('${ids.writer}', 'writer@example.com'),
      ('${ids.designer}', 'designer@example.com'),
      ('${ids.outsider}', 'outsider@example.com'),
      ('${ids.stranger}', 'stranger@example.com');

    -- account owned by writer (for project-creation checks)
    INSERT INTO accounts (account_id, user_id, email, type) VALUES
      ('${ids.account}', '${ids.writer}', 'writer@example.com', 'free');

    -- project without account: the owner trigger must stay silent
    INSERT INTO projects (project_id, name) VALUES
      ('${ids.project}', 'Test Project');

    -- the project's collaborator directory (one row per person, by email)
    INSERT INTO project_users (project_id, email) VALUES
      ('${ids.project}', 'reader@example.com'),
      ('${ids.project}', 'writer@example.com'),
      ('${ids.project}', 'designer@example.com'),
      ('${ids.project}', 'outsider@example.com'),
      ('${ids.project}', 'stranger@example.com');

    INSERT INTO project_roles (project_id, project_user_id, role)
    SELECT '${ids.project}', pu.project_user_id, r.role::user_roles_enum
    FROM project_users pu
    JOIN (VALUES
      ('reader@example.com', 'read-all'),
      ('writer@example.com', 'write-all'),
      ('designer@example.com', 'design')
    ) AS r(email, role) ON r.email = pu.email
    WHERE pu.project_id = '${ids.project}';

    INSERT INTO subprojects (subproject_id, project_id, name) VALUES
      ('${ids.subproject}', '${ids.project}', 'Test Subproject');

    -- outsider only has a subproject-level role (general: inherited into places)
    INSERT INTO subproject_roles (subproject_id, project_user_id, role)
    SELECT '${ids.subproject}', pu.project_user_id, 'read-all'
    FROM project_users pu
    WHERE pu.project_id = '${ids.project}'
      AND pu.email = 'outsider@example.com';

    INSERT INTO places (place_id, subproject_id, level) VALUES
      ('${ids.place}', '${ids.subproject}', 1),
      ('${ids.otherPlace}', '${ids.subproject}', 1);

    -- stranger only has a role on otherPlace
    INSERT INTO place_roles (place_id, project_user_id, role)
    SELECT '${ids.otherPlace}', pu.project_user_id, 'read-specific'
    FROM project_users pu
    WHERE pu.project_id = '${ids.project}'
      AND pu.email = 'stranger@example.com';

    INSERT INTO actions (action_id, place_id) VALUES
      ('${ids.action}', '${ids.place}');

    INSERT INTO wms_layers (wms_layer_id, project_id) VALUES
      ('${ids.wmsLayer}', '${ids.project}');
  `)

  return { db, ids }
}
