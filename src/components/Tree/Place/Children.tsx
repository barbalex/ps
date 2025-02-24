import { memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { usePGlite } from '@electric-sql/pglite-react'

import { ChecksNode } from '../Checks.tsx'
import { ActionsNode } from '../Actions.tsx'
import { PlaceReportsNode } from '../PlaceReports.tsx'
import { PlaceUsersNode } from '../PlaceUsers.tsx'
import { PlacesNode } from '../Places.tsx'
import { OccurrencesAssignedNode } from '../OccurrencesAssigned.tsx'
import { FilesNode } from '../Files.tsx'

export const PlaceChildren = memo(
  ({ project_id, subproject_id, place_id, place }) => {
    const level = place_id ? 8 : 6

    const db = usePGlite()
    // query from place_level what children to show
    const resPlaceLevels = useLiveQuery(
      `SELECT * FROM place_levels WHERE project_id = $1 AND level = $2`,
      [project_id, place_id ? 2 : 1],
    )
    const placeLevel = resPlaceLevels?.rows?.[0]

    // need project to know whether to show files
    const resProject = useLiveQuery(
      `SELECT files_active_places FROM projects WHERE project_id = $1`,
      [project_id],
    )
    const project = resProject?.rows?.[0]
    const showFiles = project?.files_active_places ?? false

    return (
      <>
        {!place_id && (
          <PlacesNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place.place_id}
          />
        )}
        {!!placeLevel?.checks && (
          <ChecksNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level + 1}
          />
        )}
        {!!placeLevel?.actions && (
          <ActionsNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level + 1}
          />
        )}
        {!!placeLevel?.reports && (
          <PlaceReportsNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level + 1}
          />
        )}
        {!!placeLevel?.occurrences && (
          <OccurrencesAssignedNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level + 1}
          />
        )}
        <PlaceUsersNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
          place={place}
          level={level + 1}
        />
        {showFiles && (
          <FilesNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id ?? place.place_id}
            place_id2={place_id ? place.place_id : undefined}
            level={level + 1}
          />
        )}
      </>
    )
  },
)
