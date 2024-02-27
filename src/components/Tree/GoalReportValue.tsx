import { useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { GoalReportValues as GoalReportValue } from '../../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  goal_id: string
  goal_report_id: string
  goalReportValue: GoalReportValue
  level?: number
}

export const GoalReportValueNode = memo(
  ({
    project_id,
    subproject_id,
    goal_id,
    goal_report_id,
    goalReportValue,
    level = 10,
  }: Props) => {
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
      urlPath[7] === goal_report_id &&
      urlPath[8] === 'values' &&
      urlPath[9] === goalReportValue.goal_report_value_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/${goalReportValue.goal_report_value_id}`)
    }, [isOpen, navigate, baseUrl, goalReportValue.goal_report_value_id])

    return (
      <Node
        node={goalReportValue}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${goalReportValue.goal_report_value_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
