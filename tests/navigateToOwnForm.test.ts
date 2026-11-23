import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import type { useNavigate } from '@tanstack/react-router'

import { createTestDb, type TestFixture } from './helpers/createTestDb.ts'
import { navigateToOwnForm } from '../src/modules/navigateToOwnForm.ts'

type Navigate = ReturnType<typeof useNavigate>

let fixture: TestFixture

const ids = {
  // child of the fixture's level-1 place
  placeLevel2: '30000000-0000-7000-8000-000000000201',
  check: '70000000-0000-7000-8000-000000000001',
}

beforeAll(async () => {
  fixture = await createTestDb()
  await fixture.db.exec(`
    INSERT INTO places (place_id, subproject_id, parent_id, level, label) VALUES
      ('${ids.placeLevel2}', '${fixture.ids.subproject}', '${fixture.ids.place}', 2, 'child place');

    INSERT INTO checks (check_id, place_id) VALUES
      ('${ids.check}', '${fixture.ids.place}');
  `)
})

afterAll(async () => {
  await fixture.db.close()
})

const navigateMock = () => {
  const fn = vi.fn()
  return { fn, navigate: fn as unknown as Navigate }
}

describe('navigateToOwnForm', () => {
  it('navigates to a level-1 place form', async () => {
    const { fn, navigate } = navigateMock()
    await navigateToOwnForm(fixture.db, navigate, {
      ownTable: 'place',
      ownId: fixture.ids.place,
      ownSubprojectId: fixture.ids.subproject,
      projectId: fixture.ids.project,
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({
      to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/place',
      params: {
        projectId: fixture.ids.project,
        subprojectId: fixture.ids.subproject,
        placeId: fixture.ids.place,
      },
    })
  })

  it('navigates to a level-2 place form through its parent', async () => {
    const { fn, navigate } = navigateMock()
    await navigateToOwnForm(fixture.db, navigate, {
      ownTable: 'place',
      ownId: ids.placeLevel2,
      ownSubprojectId: fixture.ids.subproject,
      ownParentId: fixture.ids.place,
      projectId: fixture.ids.project,
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({
      to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/place',
      params: {
        projectId: fixture.ids.project,
        subprojectId: fixture.ids.subproject,
        placeId: fixture.ids.place,
        placeId2: ids.placeLevel2,
      },
    })
  })

  it('navigates to a check form, resolving the place hierarchy from the db', async () => {
    const { fn, navigate } = navigateMock()
    await navigateToOwnForm(fixture.db, navigate, {
      ownTable: 'check',
      ownId: ids.check,
      ownPlaceId: fixture.ids.place,
      projectId: fixture.ids.project,
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({
      to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/checks/$checkId/check',
      params: {
        projectId: fixture.ids.project,
        subprojectId: fixture.ids.subproject,
        placeId: fixture.ids.place,
        checkId: ids.check,
      },
    })
  })

  it('navigates to an action form of the fixture action', async () => {
    const { fn, navigate } = navigateMock()
    await navigateToOwnForm(fixture.db, navigate, {
      ownTable: 'action',
      ownId: fixture.ids.action,
      ownPlaceId: fixture.ids.place,
      projectId: fixture.ids.project,
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith({
      to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/actions/$actionId/action',
      params: {
        projectId: fixture.ids.project,
        subprojectId: fixture.ids.subproject,
        placeId: fixture.ids.place,
        actionId: fixture.ids.action,
      },
    })
  })

  it('does not navigate when the place of a check no longer exists', async () => {
    const { fn, navigate } = navigateMock()
    await navigateToOwnForm(fixture.db, navigate, {
      ownTable: 'check',
      ownId: ids.check,
      ownPlaceId: '99999999-9999-9999-9999-999999999999',
      projectId: fixture.ids.project,
    })
    expect(fn).not.toHaveBeenCalled()
  })
})
