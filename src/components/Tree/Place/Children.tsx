import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { Places as Place } from '../../../generated/client'
import { ChecksNode } from '../Checks'
import { ActionsNode } from '../Actions'
import { PlaceReportsNode } from '../PlaceReports'
import { PlaceUsersNode } from '../PlaceUsers'
import { PlacesNode } from '../Places'
import { OccurrencesAssignedNode } from '../OccurrencesAssigned'
import { useElectric } from '../../../ElectricProvider.tsx'
import { FilesNode } from '../Files'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
}

export const PlaceChildren = memo(
  ({ project_id, subproject_id, place_id, place }: Props) => {
    const level = place_id ? 8 : 6

    const { db } = useElectric()!
    // query from place_level what children to show
    const { results: placeLevels } = useLiveQuery(
      db.place_levels.liveMany({
        where: {
          project_id,
          level: place_id ? 2 : 1,
        },
      }),
    )
    const placeLevel = placeLevels?.[0]

    // need project to know whether to show files
    const { results: project } = useLiveQuery(
      db.projects.liveUnique({ where: { project_id } }),
    )
    const showFiles = project?.files_active_places ?? false

    // TODO: if placeLevel?.occurrences, show occurrences
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
