import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { checkWritePermission } from '../src/modules/checkWritePermission.ts'
import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'

let fixture: TestFixture

beforeAll(async () => {
  fixture = await createTestDb()
})

afterAll(async () => {
  await fixture?.db.close()
})

const check = (
  userId: string,
  table: string,
  row: Record<string, unknown>,
) => checkWritePermission(fixture.db, userId, table, row)

describe('checkWritePermission — project level', () => {
  it('allows a project writer and reports their role', async () => {
    const res = await check(fixture.ids.writer, 'lists', {
      project_id: fixture.ids.project,
    })
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBe('write-all')
  })

  it('denies a user without any role on the project', async () => {
    const res = await check(fixture.ids.outsider, 'lists', {
      project_id: fixture.ids.project,
    })
    expect(res.allowed).toBe(false)
    expect(res.userRole).toBeUndefined()
  })

  it('denies read-only roles on regular tables (minimum is write-specific)', async () => {
    const res = await check(fixture.ids.reader, 'lists', {
      project_id: fixture.ids.project,
    })
    expect(res.allowed).toBe(false)
    expect(res.userRole).toBe('read-all')
  })

  it('denies read-only subproject roles on subproject tables (goals)', async () => {
    const res = await check(fixture.ids.outsider, 'goals', {
      subproject_id: fixture.ids.subproject,
    })
    expect(res.allowed).toBe(false)
    expect(res.userRole).toBe('read-all')
  })
})

describe('checkWritePermission — designer-only tables', () => {
  it.each(['project_users', 'export_assignments'])(
    'denies a writer on %s',
    async (table) => {
      const res = await check(fixture.ids.writer, table, {
        project_id: fixture.ids.project,
      })
      expect(res.allowed).toBe(false)
      expect(res.userRole).toBe('write-all')
    },
  )

  it('allows a designer on project_users', async () => {
    const res = await check(fixture.ids.designer, 'project_users', {
      project_id: fixture.ids.project,
    })
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBe('design')
  })
})

describe('checkWritePermission — subproject and place level', () => {
  it('checks subproject roles directly (goals)', async () => {
    const res = await check(fixture.ids.writer, 'goals', {
      subproject_id: fixture.ids.subproject,
    })
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBe('write-all')
  })

  it('checks only the row\'s own place in place_users — a role on another place does not grant access', async () => {
    // stranger has read-specific on otherPlace, not on place
    const res = await check(fixture.ids.stranger, 'actions', {
      place_id: fixture.ids.place,
    })
    expect(res.allowed).toBe(false)
    expect(res.userRole).toBeUndefined()
  })

  it('resolves join tables through their parent (action_quantities -> actions -> place)', async () => {
    const res = await check(fixture.ids.writer, 'action_quantities', {
      action_id: fixture.ids.action,
    })
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBe('write-all')

    const stranger = await check(fixture.ids.stranger, 'action_quantities', {
      action_id: fixture.ids.action,
    })
    expect(stranger.allowed).toBe(false)
  })
})

describe('checkWritePermission — multi-parent and custom tables', () => {
  it('resolves layer_presentations through the wms_layer project', async () => {
    const writer = await check(fixture.ids.writer, 'layer_presentations', {
      wms_layer_id: fixture.ids.wmsLayer,
    })
    expect(writer.allowed).toBe(true)
  })

  // Regression: checkLayerPresentation used to fall through to
  // `{ allowed: true }` when the user had no role on the layer's project
  it('denies layer_presentations writes for users without any role', async () => {
    const outsider = await check(fixture.ids.outsider, 'layer_presentations', {
      wms_layer_id: fixture.ids.wmsLayer,
    })
    expect(outsider.allowed).toBe(false)
  })

  it('checks files by the most specific parent present', async () => {
    // place_id wins over project_id
    const viaPlace = await check(fixture.ids.writer, 'files', {
      place_id: fixture.ids.place,
      project_id: fixture.ids.project,
    })
    expect(viaPlace.userRole).toBe('write-all')

    // falls back to project
    const viaProject = await check(fixture.ids.designer, 'files', {
      project_id: fixture.ids.project,
    })
    expect(viaProject.userRole).toBe('design')
  })
})

describe('checkWritePermission — escape hatches', () => {
  it('allows SKIP_TABLES (users, crs, ...) without any role lookup', async () => {
    const res = await check(fixture.ids.outsider, 'users', {
      user_id: fixture.ids.reader,
    })
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBeUndefined()
  })

  it('allows rows without a parent id', async () => {
    const res = await check(fixture.ids.outsider, 'actions', {})
    expect(res.allowed).toBe(true)
  })

  it('allows unknown tables (with a console warning)', async () => {
    const res = await check(fixture.ids.outsider, 'not_a_real_table', {
      some_id: 'x',
    })
    expect(res.allowed).toBe(true)
  })
})
