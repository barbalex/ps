import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Place } from './Place.tsx'

export const PlaceIndex = ({ from }: { from: string }) => {
  const { projectId, placeId2 } = useParams({ strict: false })
  const res = useLiveQuery(
    `SELECT place_users_in_place, place_files, place_files_in_place FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  if (res === undefined) return null
  const usersInPlace = res?.rows?.[0]?.place_users_in_place !== false
  const showFiles = res?.rows?.[0]?.place_files !== false
  const filesInPlace = res?.rows?.[0]?.place_files_in_place !== false

  // Parent layout renders PlaceWithFiles when inline sub-sections are enabled.
  if (usersInPlace || (showFiles && filesInPlace)) return null
  return <Place from={from} />
}
