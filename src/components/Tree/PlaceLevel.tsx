import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const PlaceLevelNode = memo(({ project_id, placeLevel, level = 4 }) => {
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
})
