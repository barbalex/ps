import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { GoalReports as GoalReport } from '../../../generated/client'
import { GoalReportNode } from './GoalReport'

export const GoalReportsNode = ({
  project_id,
  subproject_id,
  goal_id,
  level = 7,
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.goal_reports.liveMany({
      where: { deleted: false, goal_id },
      orderBy: { label: 'asc' },
    }),
  )
  const goalReports: GoalReport[] = results ?? []

  const goalReportsNode = useMemo(
    () => ({
      label: `Goal Reports (${goalReports.length})`,
    }),
    [goalReports.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'subprojects' &&
    urlPath[3] === subproject_id &&
    urlPath[4] === 'goals' &&
    urlPath[5] === goal_id &&
    urlPath[6] === 'reports'
  const isActive = isOpen && urlPath.length === level

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(
        `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}`,
      )
    navigate(
      `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`,
    )
  }, [goal_id, isOpen, navigate, project_id, subproject_id])

  return (
    <>
      <Node
        node={goalReportsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={goalReports.length}
        to={`/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        goalReports.map((goalReport) => (
          <GoalReportNode
            key={goalReport.goal_report_id}
            project_id={project_id}
            subproject_id={subproject_id}
            goal_id={goal_id}
            goalReport={goalReport}
          />
        ))}
    </>
  )
}
