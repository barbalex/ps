import { memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import {
  Place_levels as PlaceLevel,
  Places as Place,
} from '../../../generated/client'
import { ChecksNode } from '../Checks'
import { ActionsNode } from '../Actions'
import { PlaceReportsNode } from '../PlaceReports'
import { PlaceUsersNode } from '../PlaceUsers'
import { PlacesNode } from '../Places'
import { useElectric } from '../../../ElectricProvider'
import { FilesNode } from '../Files'

type Props = {
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
          deleted: false,
          project_id,
          level: place_id ? 2 : 1,
        },
      }),
    )
    const placeLevel: PlaceLevel | undefined = placeLevels?.[0]

    console.log('PlaceChildren', {
      project_id,
      subproject_id,
      place_id,
      place,
      placeLevel,
    })

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
        <PlaceUsersNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
          place={place}
          level={level + 1}
        />
        <FilesNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id ?? place.place_id}
          place_id2={place_id ? place.place_id : undefined}
          level={level + 1}
        />
      </>
    )
  },
)
