import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { OccurrenceNotToAssignNode } from './OccurrenceNotToAssign'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const OccurrencesNotToAssignNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: occurrences = [] } = useLiveQuery(
      db.occurrences.liveMany({
        where: { subproject_id, not_to_assign: true },
        orderBy: { label: 'asc' },
      }),
    )

    const occurrencesNode = useMemo(
      () => ({ label: `Occurrences not to assign (${occurrences.length})` }),
      [occurrences.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'occurrences-not-to-assign'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/occurrences-not-to-assign`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={occurrencesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={occurrences.length}
          to={`${baseUrl}/occurrences-not-to-assign`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          occurrences.map((occurrence) => (
            <OccurrenceNotToAssignNode
              key={occurrence.occurrence_id}
              project_id={project_id}
              subproject_id={subproject_id}
              occurrence={occurrence}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
