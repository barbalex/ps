import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import {
  PlaceUsers as PlaceUser,
  Places as Place,
} from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  placeUser: PlaceUser
  place: Place
  level?: number
}

export const PlaceUserNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    placeUser,
    place,
    level = 8,
  }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
        'users',
        placeUser.place_user_id,
      ],
      [
        project_id,
        subproject_id,
        place_id,
        place.place_id,
        placeUser.place_user_id,
      ],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={placeUser}
        id={placeUser.place_user_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
