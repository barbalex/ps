import { memo } from 'react'
import { useLocation } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Occurrences as Occurrence } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  occurrence: Occurrence
  level?: number
}

export const OccurrenceToAssessNode = memo(
  ({ project_id, subproject_id, occurrence, level = 6 }: Props) => {
    const location = useLocation()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = [
      'data',
      'projects',
      project_id,
      'subprojects',
      subproject_id,
      'occurrences-to-assess',
      occurrence.occurrence_id,
    ]
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
