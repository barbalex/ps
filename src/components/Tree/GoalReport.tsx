import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { GoalReports as GoalReport } from '../../../generated/client'
import { GoalReportValuesNode } from './GoalReportValues'

export const GoalReportNode = ({
  project_id,
  subproject_id,
  goal_id,
  goalReport,
  level = 8,
}: {
  project_id: string
  subproject_id: string
  goalReport: GoalReport
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
    urlPath[5] === goal_id &&
    urlPath[6] === 'reports' &&
    urlPath[7] === goalReport.goal_report_id
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goalReport.goal_report_id}`,
    )
  }, [
    isOpen,
    navigate,
    project_id,
    subproject_id,
    goal_id,
    goalReport.goal_report_id,
  ])

  return (
    <>
      <Node
        node={goalReport}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={10}
        to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goalReport.goal_report_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <GoalReportValuesNode
          project_id={project_id}
          subproject_id={subproject_id}
          goal_id={goal_id}
          goal_report_id={goalReport.goal_report_id}
        />
      )}
    </>
  )
}
