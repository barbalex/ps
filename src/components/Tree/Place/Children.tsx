import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'

import { Node } from '../Node.tsx'
import { ChecksNode } from '../Checks.tsx'
import { ActionsNode } from '../Actions.tsx'
import { CheckReportsNode } from '../CheckReports.tsx'
import { ActionReportsNode } from '../ActionReports.tsx'
import { PlaceUsersNode } from '../PlaceUsers.tsx'
import { PlacesNode } from '../Places.tsx'
import { ObservationsAssignedNode } from '../ObservationsAssigned.tsx'
import { FilesNode } from '../Files.tsx'
import type PlaceLevels from '../../../models/public/PlaceLevels.ts'
import { languageAtom, designingAtom } from '../../../store.ts'

// TODO: add charts?
export const PlaceChildren = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  level,
}) => {
  // const level = placeId2 ? 8 : 6
  const [language] = useAtom(languageAtom)
  const [isDesigning] = useAtom(designingAtom)

  // query from place_level what children to show
  const resPlaceLevels = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel: PlaceLevels = resPlaceLevels?.rows?.[0]

  // need place_level to know whether to show files
  const showFiles = isDesigning || placeLevel?.place_files !== false
  const filesInPlace = placeLevel?.place_files_in_place !== false
  const showFilesNav = showFiles && !filesInPlace

  const location = useLocation()
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const ownArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    ...(placeId2 ? [placeId, 'places', placeId2] : [placeId]),
  ]

  return (
    <>
      <Node
        label={placeLevel?.[`name_singular_${language}`] ?? 'Place'}
        level={level + 1}
        isInActiveNodeArray={
          ownArray.every((part, i) => urlPath[i] === part) &&
          urlPath[ownArray.length] === 'place'
        }
        isActive={isEqual([...ownArray, 'place'], urlPath)}
        childrenCount={0}
        to={`/${ownArray.join('/')}/place`}
      />
      {!placeId2 && (
        <PlacesNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          level={level + 1}
        />
      )}
      {(isDesigning || !!placeLevel?.checks) && (
        <ChecksNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {(isDesigning || !!placeLevel?.check_reports) && (
        <CheckReportsNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {(isDesigning || !!placeLevel?.actions) && (
        <ActionsNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {(isDesigning || !!placeLevel?.action_reports) && (
        <ActionReportsNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {(isDesigning || !!placeLevel?.observations) && (
        <ObservationsAssignedNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {isDesigning && (
        <PlaceUsersNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {showFilesNav && (
        <FilesNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
    </>
  )
}
