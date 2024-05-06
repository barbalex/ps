import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node'
import { GoalNode } from './Goal'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const GoalsNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: goals = [] } = useLiveQuery(
      db.goals.liveMany({
        where: { subproject_id },
        orderBy: { label: 'asc' },
      }),
    )

    const goalsNode = useMemo(
      () => ({ label: `Goals (${goals.length})` }),
      [goals.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'goals'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/goals`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={goalsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={goals.length}
          to={`${baseUrl}/goals`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          goals.map((goal) => (
            <GoalNode
              key={goal.goal_id}
              project_id={project_id}
              subproject_id={subproject_id}
              goal={goal}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
