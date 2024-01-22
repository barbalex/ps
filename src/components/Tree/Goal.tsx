import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Goals as Goal } from '../../../generated/client'
import { GoalReportsNode } from './GoalReports'

export const GoalNode = ({
  project_id,
  subproject_id,
  goal,
  level = 6,
}: {
  project_id: string
  subproject_id: string
  goal: Goal
  level: number
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'goals' &&
    urlPath[5] === goal.goal_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/goals`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal.goal_id}`,
    )
  }, [isOpen, navigate, goal.goal_id, project_id, subproject_id])

  return (
    <>
      <Node
        node={goal}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal.goal_id}`}
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
}
