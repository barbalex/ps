import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { OccurrenceToAssessNode } from './OccurrenceToAssess'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const OccurrencesToAssessNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: occurrences = [] } = useLiveQuery(
      db.occurrences.liveMany({
        where: { subproject_id, not_to_assign: false, place_id: null },
        orderBy: { label: 'asc' },
      }),
    )

    const occurrencesNode = useMemo(
      () => ({ label: `Occurrences to assess (${occurrences.length})` }),
      [occurrences.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'occurrences-to-assess'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/occurrences-to-assess`,
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
          to={`${baseUrl}/occurrences-to-assess`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          occurrences.map((occurrence) => (
            <OccurrenceToAssessNode
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
