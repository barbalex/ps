import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node.tsx'
import { Goals as Goal } from '../../../generated/client/index.ts'
import { GoalReportsNode } from './GoalReports.tsx'

interface Props {
  project_id: string
  subproject_id: string
  goal: Goal
  level?: number
}

export const GoalNode = memo(
  ({ project_id, subproject_id, goal, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'goals' &&
      urlPath[5] === goal.goal_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${goal.goal_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, goal.goal_id, searchParams])

    return (
      <>
        <Node
          node={goal}
          id={goal.goal_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${goal.goal_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <GoalReportsNode
            project_id={project_id}
            subproject_id={subproject_id}
            goal_id={goal.goal_id}
          />
        )}
      </>
    )
  },
)
