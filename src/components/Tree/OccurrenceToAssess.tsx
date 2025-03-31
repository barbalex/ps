import { memo } from 'react'
import { useLocation } from '@tanstack/react-router'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'

export const OccurrenceToAssessNode = memo(
  ({ projectId, subprojectId, nav, level = 6 }) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = [
      'data',
      'projects',
      projectId,
      'subprojects',
      subprojectId,
      'occurrences-to-assess',
      nav.id,
    ]
    const ownUrl = `/${ownArray.join('/')}`

    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    return (
      <>
        <Node
          label={nav.label}
          id={nav.id}
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
