import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import {
  Occurrences as Occurrence,
  Places as Place,
} from '../../../generated/client'
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
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places' &&
      urlPath[5] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[6] === 'places' &&
        urlPath[7] === place.place_id &&
        urlPath[8] === 'occurrences-assigned' &&
        urlPath[9] === occurrence.occurrence_id
      : isOpenBase &&
        urlPath[6] === 'occurrences-assigned' &&
        urlPath[7] === occurrence.occurrence_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/occurrences-assigned`

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
