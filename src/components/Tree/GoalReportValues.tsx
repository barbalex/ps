import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { GoalReportValues as GoalReportValue } from '../../../generated/client'
import { GoalReportValueNode } from './GoalReportValue'

export const GoalReportValuesNode = ({
  project_id,
  subproject_id,
  goal_id,
  goal_report_id,
  level = 9,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.goal_report_values.liveMany({
      where: { deleted: false, goal_report_id },
      orderBy: { label: 'asc' },
    }),
  )
  const goalReportValues: GoalReportValue[] = results ?? []

  const goalReportValuesNode = useMemo(
    () => ({
      label: `Goal Report Values (${goalReportValues.length})`,
    }),
    [goalReportValues.length],
  )

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
    urlPath[8] === 'values'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`,
    )
  }, [goal_id, goal_report_id, isOpen, navigate, project_id, subproject_id])

  return (
    <>
      <Node
        node={goalReportValuesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={goalReportValues.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}/values`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        goalReportValues.map((goalReportValue) => (
          <GoalReportValueNode
            key={goalReportValue.goal_report_value_id}
            project_id={project_id}
            subproject_id={subproject_id}
            goal_id={goal_id}
            goal_report_id={goal_report_id}
            goalReportValue={goalReportValue}
          />
        ))}
    </>
  )
}
