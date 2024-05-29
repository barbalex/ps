import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

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
    const isOpenBase =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'places' &&
      urlPath[6] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[7] === 'places' &&
        urlPath[8] === place.place_id &&
        urlPath[9] === 'occurrences-assigned' &&
        urlPath[10] === occurrence.occurrence_id
      : isOpenBase &&
        urlPath[7] === 'occurrences-assigned' &&
        urlPath[8] === occurrence.occurrence_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = [
      'data',
      'projects',
      project_id,
      'subprojects',
      subproject_id,
      'places',
      place_id ?? place.place_id,
      ...(place_id ? ['places', place.place_id] : []),
      'occurrences-assigned',
    ]
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      navigate({
        pathname: `${baseUrl}/${occurrence.occurrence_id}`,
        search: searchParams.toString(),
      })
    }, [navigate, baseUrl, occurrence.occurrence_id, searchParams])

    return (
      <>
        <Node
          node={occurrence}
          id={occurrence.occurrence_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={0}
          to={`${baseUrl}/${occurrence.occurrence_id}`}
          onClickButton={onClickButton}
        />
      </>
    )
  },
)
