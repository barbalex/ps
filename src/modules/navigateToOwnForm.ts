import type { useNavigate } from '@tanstack/react-router'

import type { QueryableDb } from './geoQueries.ts'

type Navigate = ReturnType<typeof useNavigate>

// Where a clicked own-table feature points to. Places carry their
// subproject/parent in the feature properties; checks/actions reference
// their place, whose hierarchy is resolved inside navigateToOwnForm.
export type OwnFormTarget = {
  ownTable: 'place' | 'check' | 'action'
  ownId: string
  ownPlaceId?: string
  ownSubprojectId?: string
  ownParentId?: string
  projectId: string
}

// Navigates to the form route of an own-table row (place/check/action).
// Level-2 places live under their parent place; checks/actions live under
// their place, whose subproject (and parent, for level-2 places) is not
// part of the feature properties and is looked up here.
export const navigateToOwnForm = async (
  db: QueryableDb,
  navigate: Navigate,
  { ownTable, ownId, ownPlaceId, ownSubprojectId, ownParentId, projectId }: OwnFormTarget,
) => {
  if (ownTable === 'place') {
    if (ownParentId) {
      navigate({
        to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/place',
        params: {
          projectId,
          subprojectId: ownSubprojectId!,
          placeId: ownParentId,
          placeId2: ownId,
        },
      })
    } else {
      navigate({
        to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/place',
        params: {
          projectId,
          subprojectId: ownSubprojectId!,
          placeId: ownId,
        },
      })
    }
    return
  }

  const placeRes = await db.query(
    `SELECT subproject_id, parent_id FROM places WHERE place_id = $1`,
    [ownPlaceId],
  )
  const place = placeRes?.rows?.[0] as
    | { subproject_id: string; parent_id: string | null }
    | undefined
  if (!place) return
  if (ownTable === 'check') {
    if (place.parent_id) {
      navigate({
        to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/checks/$checkId/check',
        params: {
          projectId,
          subprojectId: place.subproject_id,
          placeId: place.parent_id,
          placeId2: ownPlaceId!,
          checkId: ownId,
        },
      })
    } else {
      navigate({
        to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/checks/$checkId/check',
        params: {
          projectId,
          subprojectId: place.subproject_id,
          placeId: ownPlaceId!,
          checkId: ownId,
        },
      })
    }
  } else if (ownTable === 'action') {
    if (place.parent_id) {
      navigate({
        to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/places/$placeId2/actions/$actionId/action',
        params: {
          projectId,
          subprojectId: place.subproject_id,
          placeId: place.parent_id,
          placeId2: ownPlaceId!,
          actionId: ownId,
        },
      })
    } else {
      navigate({
        to: '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId/actions/$actionId/action',
        params: {
          projectId,
          subprojectId: place.subproject_id,
          placeId: ownPlaceId!,
          actionId: ownId,
        },
      })
    }
  }
}
