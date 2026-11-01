import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import type { PGlite } from '@electric-sql/pglite'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import { buildProjectDump } from '../src/modules/projectDump/exportProjectDump.ts'
import { parseProjectDump } from '../src/modules/projectDump/parseProjectDump.ts'

/**
 * The in-app import against the real server function: every batch goes
 * through apply_operations in its own transaction (as PostgREST does), with
 * the write-permission triggers loaded and the importer identified via the
 * JWT claims GUC.
 */

const WRITER = '00000000-0000-7000-8000-000000000002' // owns the fixture account

const target = vi.hoisted(() => ({ db: null as PGlite | null, calls: 0 }))

vi.mock('../src/modules/applyOperations.ts', () => ({
  applyOperations: async (ops: { table: string; operation: string; rowIdName?: string; rowId?: unknown; draft?: unknown; time: string }[]) => {
    target.calls += 1
    const res = await target.db!.query<{ op_index: number; status: string; detail: string | null }>(
      `SELECT * FROM apply_operations($1::jsonb)`,
      [JSON.stringify(ops.map((o) => ({ ...o, rowId: o.rowId == null ? null : String(o.rowId) })))],
    )
    return ops.map((_, index) => res.rows.find((r) => r.op_index === index) ?? { op_index: index, status: 'error', detail: 'missing result' })
  },
}))

// the module under test reads navigator.onLine
vi.stubGlobal('navigator', { onLine: true })

const { importProjectDump } = await import(
  '../src/modules/projectDump/importProjectDump.ts'
)

let source: TestFixture
let server: TestFixture

beforeAll(async () => {
  source = await createTestDb()
  server = await createTestDb([
    '12_writePermissionTriggers.sql',
    '14_applyOperations.sql',
  ])
  target.db = server.db

  // a unit referenced by the project (projects → units → projects cycle)
  // and a child place (self reference) in the source
  await source.db.exec(`
    INSERT INTO units (unit_id, project_id, name) VALUES
      ('80000000-0000-7000-8000-000000000001', '${source.ids.project}', 'Triebe');
    UPDATE projects SET check_taxa_default_unit_id = '80000000-0000-7000-8000-000000000001'
      WHERE project_id = '${source.ids.project}';
    INSERT INTO places (place_id, parent_id, subproject_id, level, name) VALUES
      ('30000000-0000-7000-8000-000000000009', '${source.ids.place}', '${source.ids.subproject}', 2, 'child');
  `)
  // the server has the same users but not the project (the permission
  // triggers are loaded: use the sync escape hatch for the fixture cleanup)
  await server.db.exec(
    `SET electric.syncing TO 'true';
     DELETE FROM projects WHERE project_id = '${source.ids.project}';
     SET electric.syncing TO DEFAULT;
     SET request.jwt.claims = '{"role":"app_user","user_id":"${WRITER}"}';`,
  )
}, 120_000)

afterAll(async () => {
  await source?.db.close()
  await server?.db.close()
})

describe('project dump import through apply_operations', () => {
  it('imports in FK-safe chunks, defers the unit cycle, grants the importer own', async () => {
    const { parts } = await buildProjectDump(source.db, source.ids.project)
    const dump = parseProjectDump(parts.join(''))

    const progress: number[] = []
    const result = await importProjectDump({
      db: server.db,
      dump,
      accountId: source.ids.account,
      onProgress: ({ rows }) => progress.push(rows),
    })
    expect(result.projectId).toBe(source.ids.project)
    expect(target.calls).toBeGreaterThan(1)
    expect(progress.at(-1)).toBe(result.rowCount)

    const project = await server.db.query<{
      account_id: string
      check_taxa_default_unit_id: string
    }>(
      `SELECT account_id, check_taxa_default_unit_id FROM projects WHERE project_id = $1`,
      [source.ids.project],
    )
    expect(project.rows[0]).toEqual({
      account_id: source.ids.account,
      check_taxa_default_unit_id: '80000000-0000-7000-8000-000000000001',
    })

    const places = await server.db.query<{ n: number }>(
      `SELECT count(*)::int n FROM places WHERE subproject_id = $1`,
      [source.ids.subproject],
    )
    expect(places.rows[0]?.n).toBe(3)

    // access rows are not imported: only the owner trigger's own role exists
    const roles = await server.db.query<{ email: string; role: string }>(
      `SELECT pu.email, pr.role FROM project_roles pr
       JOIN project_users pu USING (project_user_id)
       WHERE pr.project_id = $1`,
      [source.ids.project],
    )
    expect(roles.rows).toEqual([{ email: 'writer@example.com', role: 'own' }])
  })

  it('refuses when the project already exists locally', async () => {
    const { parts } = await buildProjectDump(source.db, source.ids.project)
    const dump = parseProjectDump(parts.join(''))
    await expect(
      importProjectDump({ db: source.db, dump, accountId: source.ids.account }),
    ).rejects.toMatchObject({ reason: 'exists' })
  })
})
