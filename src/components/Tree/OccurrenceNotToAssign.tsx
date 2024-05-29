import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node.tsx'
import { Occurrences as Occurrence } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  occurrence: Occurrence
  level?: number
}

export const OccurrenceNotToAssignNode = memo(
  ({ project_id, subproject_id, occurrence, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'occurrences-not-to-assign' &&
      urlPath[6] === occurrence.occurrence_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/occurrences-not-to-assign`

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
