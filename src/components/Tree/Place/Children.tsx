import { useLiveQuery } from 'electric-sql/react'

import { Places as Place } from '../../../generated/client'
import { ChecksNode } from '../Checks'
import { ActionsNode } from '../Actions'
import { PlaceReportsNode } from '../PlaceReports'
import { PlaceUsersNode } from '../PlaceUsers'
import { useElectric } from '../../../ElectricProvider'

export const PlaceChildren = ({
  project_id,
  subproject_id,
  place_id,
  level = 6,
}: {
  project_id: string
  subproject_id: string
  place_id: string
  level: number
}) => {
  const { db } = useElectric()!
  // query from place_level what children to show
  const { results: placeLevels } = useLiveQuery(
    db.place_levels.liveMany({
      where: {
        deleted: false,
        project_id,
        level: level === 6 ? 1 : 2,
      },
    }),
  )
  const placeLevel = placeLevels?.[0]

  return (
    <>
      {!!placeLevel?.checks && (
        <ChecksNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
        />
      )}
      {!!placeLevel?.actions && (
        <ActionsNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
        />
      )}
      {!!placeLevel?.reports && (
        <PlaceReportsNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
        />
      )}
      <PlaceUsersNode
        project_id={project_id}
        subproject_id={subproject_id}
        place_id={place_id}
      />
    </>
  )
}
