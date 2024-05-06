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

export const OccurrenceToAssessNode = memo(
  ({ project_id, subproject_id, occurrence, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'occurrences-to-assess' &&
      urlPath[5] === occurrence.occurrence_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/occurrences-to-assess`

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
