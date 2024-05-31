import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import {
  Occurrences as Occurrence,
  Places as Place,
} from '../../../generated/client/index.ts'
interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  occurrence: Occurrence
  level?: number
}

export const OccurrenceAssignedNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    occurrence,
    level = 8,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const ownArray = [
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
