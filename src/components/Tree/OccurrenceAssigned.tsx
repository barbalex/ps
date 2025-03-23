import { memo, useMemo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const OccurrenceAssignedNode = memo(
  ({ projectId, subprojectId, placeId, place, occurrence, level = 8 }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = useMemo(
      () => [
        'data',
        'projects',
        projectId,
        'subprojects',
        subprojectId,
        'places',
        placeId ?? place.place_id,
        ...(placeId ? ['places', place.place_id] : []),
        'occurrences-assigned',
        occurrence.occurrence_id,
      ],
      [
        occurrence.occurrence_id,
        place.place_id,
        placeId,
        projectId,
        subprojectId,
      ],
    )
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <>
        <Node
          node={occurrence}
          id={occurrence.occurrence_id}
          level={level}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={0}
          to={ownUrl}
        />
      </>
    )
  },
)
