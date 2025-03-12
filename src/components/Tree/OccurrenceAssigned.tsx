import { memo, useMemo } from 'react'
import { useLocation } from 'react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const OccurrenceAssignedNode = memo(
  ({ project_id, subproject_id, place_id, place, occurrence, level = 8 }) => {
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
        'occurrences-assigned',
        occurrence.occurrence_id,
      ],
      [
        occurrence.occurrence_id,
        place.place_id,
        place_id,
        project_id,
        subproject_id,
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
