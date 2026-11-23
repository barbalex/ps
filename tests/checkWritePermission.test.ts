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
  operation?: string,
) => checkWritePermission(fixture.db, userId, table, row, operation)

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
  it.each(['project_users', 'project_roles', 'export_assignments'])(
    'denies a writer on %s',
    async (table) => {
      const res = await check(fixture.ids.writer, table, {
        project_id: fixture.ids.project,
      })
      expect(res.allowed).toBe(false)
      expect(res.userRole).toBe('write-all')
    },
  )

  it('allows a designer on the directory (project_users)', async () => {
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

  it('checks only the row’s own place in place_roles — a role on another place does not grant access', async () => {
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

  // Regression: the map drawer's layer rows carry only layer_presentation_id
  // and active — the check used to deny those (triggering a broken revert)
  // instead of resolving the parent layer from the db
  it('resolves layer_presentations by id when the row is partial', async () => {
    const insertRes = await fixture.db.query(
      `INSERT INTO layer_presentations (wms_layer_id, active) VALUES ($1, FALSE) RETURNING layer_presentation_id`,
      [fixture.ids.wmsLayer],
    )
    const layerPresentationId = (
      insertRes.rows[0] as { layer_presentation_id: string }
    ).layer_presentation_id

    const writer = await check(fixture.ids.writer, 'layer_presentations', {
      layer_presentation_id: layerPresentationId,
      active: false,
    })
    expect(writer.allowed).toBe(true)
    expect(writer.userRole).toBe('write-all')

    const outsider = await check(fixture.ids.outsider, 'layer_presentations', {
      layer_presentation_id: layerPresentationId,
      active: false,
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

describe('checkWritePermission — anchor-table inserts (create flows)', () => {
  // Regression: places used to be checked via place_roles by the row's own
  // (brand-new) place_id, which never has place_roles rows — so creating a
  // place was always denied. The backend (enforce_places_write) governs
  // places by the subproject or its project instead.
  it('allows a project writer to create a level-1 place', async () => {
    const res = await check(
      fixture.ids.writer,
      'places',
      {
        place_id: 'new-place',
        subproject_id: fixture.ids.subproject,
        level: 1,
      },
      'insert',
    )
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBe('write-all')
  })

  it('resolves level-2 places through the parent place', async () => {
    const res = await check(
      fixture.ids.writer,
      'places',
      { place_id: 'new-place-2', parent_id: fixture.ids.place, level: 2 },
      'insert',
    )
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBe('write-all')
  })

  it('denies creating a place for a user with only a role on another place', async () => {
    const res = await check(
      fixture.ids.stranger,
      'places',
      {
        place_id: 'new-place',
        subproject_id: fixture.ids.subproject,
        level: 1,
      },
      'insert',
    )
    expect(res.allowed).toBe(false)
    expect(res.userRole).toBeUndefined()
  })

  it('denies read-only roles when creating a place', async () => {
    const reader = await check(
      fixture.ids.reader,
      'places',
      {
        place_id: 'new-place',
        subproject_id: fixture.ids.subproject,
        level: 1,
      },
      'insert',
    )
    expect(reader.allowed).toBe(false)
    expect(reader.userRole).toBe('read-all')

    const outsider = await check(
      fixture.ids.outsider,
      'places',
      {
        place_id: 'new-place',
        subproject_id: fixture.ids.subproject,
        level: 1,
      },
      'insert',
    )
    expect(outsider.allowed).toBe(false)
  })

  it('denies updating a place for a place-only reader (places are governed by subproject/project)', async () => {
    const res = await check(fixture.ids.stranger, 'places', {
      place_id: fixture.ids.place,
      subproject_id: fixture.ids.subproject,
    })
    expect(res.allowed).toBe(false)
  })

  it('allows creating a project in an account the user owns', async () => {
    const res = await check(
      fixture.ids.writer,
      'projects',
      { project_id: 'new-project', account_id: fixture.ids.account },
      'insert',
    )
    expect(res.allowed).toBe(true)
  })

  it('denies creating a project in an account owned by someone else', async () => {
    const res = await check(
      fixture.ids.outsider,
      'projects',
      { project_id: 'new-project', account_id: fixture.ids.account },
      'insert',
    )
    expect(res.allowed).toBe(false)
    expect(res.userRole).toBeUndefined()
  })

  it('denies creating a project without an account', async () => {
    const res = await check(
      fixture.ids.writer,
      'projects',
      { project_id: 'new-project' },
      'insert',
    )
    expect(res.allowed).toBe(false)
  })

  it('still requires a writer role to update a project', async () => {
    const res = await check(fixture.ids.reader, 'projects', {
      project_id: fixture.ids.project,
    })
    expect(res.allowed).toBe(false)
    expect(res.userRole).toBe('read-all')
  })

  it('requires design or own on the project to create a subproject (as the backend does)', async () => {
    const designer = await check(
      fixture.ids.designer,
      'subprojects',
      { subproject_id: 'new-subproject', project_id: fixture.ids.project },
      'insert',
    )
    expect(designer.allowed).toBe(true)

    // a writer may edit subprojects but not create them
    const writer = await check(
      fixture.ids.writer,
      'subprojects',
      { subproject_id: 'new-subproject', project_id: fixture.ids.project },
      'insert',
    )
    expect(writer.allowed).toBe(false)
    expect(writer.userRole).toBe('write-all')

    // outsider only has a subproject-level role, not a project role
    const outsider = await check(
      fixture.ids.outsider,
      'subprojects',
      { subproject_id: 'new-subproject', project_id: fixture.ids.project },
      'insert',
    )
    expect(outsider.allowed).toBe(false)
    expect(outsider.userRole).toBeUndefined()
  })

  it('denies creating a subproject without a project', async () => {
    const res = await check(
      fixture.ids.designer,
      'subprojects',
      { subproject_id: 'new-subproject' },
      'insert',
    )
    expect(res.allowed).toBe(false)
  })

  it('still allows a project writer to update an existing subproject', async () => {
    const res = await check(fixture.ids.writer, 'subprojects', {
      subproject_id: fixture.ids.subproject,
      project_id: fixture.ids.project,
    })
    expect(res.allowed).toBe(true)
    expect(res.userRole).toBe('write-all')
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
