import type { useNavigate } from '@tanstack/react-router'

import type { QueryableDb } from './geoQueries.ts'

export type OwnFormTarget = {
  ownTable: 'place' | 'check' | 'action'
  ownId: string
  ownPlaceId?: string
  ownSubprojectId?: string
  ownParentId?: string
  projectId: string
}

export const ownFormRoute = (
  ownTable: OwnFormTarget['ownTable'],
  ownId: string,
  projectId: string,
  subprojectId: string,
  placeId: string,
  parentId?: string | null,
) => {
  const root =
    '/data/projects/$projectId/subprojects/$subprojectId/places/$placeId'
  const base = parentId ? (`${root}/places/$placeId2` as const) : root
  const params = {
    projectId,
    subprojectId,
    placeId: parentId ?? placeId,
    ...(parentId && { placeId2: placeId }),
  }
  if (ownTable === 'place') return { to: `${base}/place`, params } as const
  if (ownTable === 'check')
    return {
      to: `${base}/checks/$checkId/check`,
      params: { ...params, checkId: ownId },
    } as const
  return {
    to: `${base}/actions/$actionId/action`,
    params: { ...params, actionId: ownId },
  } as const
}

export const navigateToOwnForm = async (
  db: QueryableDb,
  navigate: ReturnType<typeof useNavigate>,
  {
    ownTable,
    ownId,
    ownPlaceId,
    ownSubprojectId,
    ownParentId,
    projectId,
  }: OwnFormTarget,
) => {
  const placeId = ownTable === 'place' ? ownId : ownPlaceId
  if (!placeId) return
  if (ownTable === 'place' && ownSubprojectId) {
    return navigate(
      ownFormRoute(
        ownTable,
        ownId,
        projectId,
        ownSubprojectId,
        placeId,
        ownParentId,
      ),
    )
  }
  const res = await db.query<{
    subproject_id: string
    parent_id: string | null
  }>(
    `SELECT COALESCE(p.subproject_id, parent.subproject_id) AS subproject_id, p.parent_id
     FROM places p LEFT JOIN places parent ON parent.place_id = p.parent_id
     WHERE p.place_id = $1`,
    [placeId],
  )
  const place = res.rows[0]
  if (place?.subproject_id) {
    return navigate(
      ownFormRoute(
        ownTable,
        ownId,
        projectId,
        place.subproject_id,
        placeId,
        place.parent_id,
      ),
    )
  }
}
