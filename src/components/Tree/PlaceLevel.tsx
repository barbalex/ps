import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { PlaceLevels as PlaceLevel } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  placeLevel: PlaceLevel
  level?: number
}

export const PlaceLevelNode = memo(
  ({ project_id, placeLevel, level = 4 }: Props) => {
    const location = useLocation()
    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'place-levels',
        placeLevel.place_level_id,
      ],
      [placeLevel.place_level_id, project_id],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <Node
        node={placeLevel}
        id={placeLevel.place_level_id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  },
)
