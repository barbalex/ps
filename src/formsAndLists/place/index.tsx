import { useParams } from '@tanstack/react-router'
import { useNavRollups } from '../../modules/navRollupsContext.ts'

import { Place } from './Place.tsx'

export const PlaceIndex = ({ from }: { from: string }) => {
  const { projectId, placeId2 } = useParams({ strict: false })
  const level = useNavRollups().placeLevel(projectId!, placeId2 ? 2 : 1)
  const usersInPlace = level?.place_roles_in_place !== false
  const showFiles = level?.place_files !== false
  const filesInPlace = level?.place_files_in_place !== false

  // Parent layout renders PlaceWithFiles when inline sub-sections are enabled.
  if (usersInPlace || (showFiles && filesInPlace)) return null
  return <Place from={from} />
}
