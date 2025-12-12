import { useLiveQuery } from '@electric-sql/pglite-react'

import { ChecksNode } from '../Checks.tsx'
import { ActionsNode } from '../Actions.tsx'
import { PlaceReportsNode } from '../PlaceReports.tsx'
import { PlaceUsersNode } from '../PlaceUsers.tsx'
import { PlacesNode } from '../Places.tsx'
import { OccurrencesAssignedNode } from '../OccurrencesAssigned.tsx'
import { FilesNode } from '../Files.tsx'

// TODO: add charts?
export const PlaceChildren = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  level,
}) => {
  // const level = placeId2 ? 8 : 6

  // query from place_level what children to show
  const resPlaceLevels = useLiveQuery(
    `SELECT * FROM place_levels WHERE project_id = $1 AND level = $2`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = resPlaceLevels?.rows?.[0]

  // need project to know whether to show files
  const resProject = useLiveQuery(
    `SELECT project_id, files_active_places FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const project = resProject?.rows?.[0]
  const showFiles = project?.files_active_places ?? false

  return (
    <>
      {!placeId2 && (
        <PlacesNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          level={level + 1}
        />
      )}
      {!!placeLevel?.checks && (
        <ChecksNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {!!placeLevel?.actions && (
        <ActionsNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {!!placeLevel?.reports && (
        <PlaceReportsNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      {!!placeLevel?.occurrences && (
        <OccurrencesAssignedNode
          projectId={projectId}
          subprojectId={subprojectId}
          placeId={placeId}
          placeId2={placeId2}
          level={level + 1}
        />
      )}
      <PlaceUsersNode
        projectId={projectId}
        subprojectId={subprojectId}
        placeId={placeId}
        placeId2={placeId2}
        level={level + 1}
      />
      {showFiles && (
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
