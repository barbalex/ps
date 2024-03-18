import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { GoalReports as GoalReport } from '../../../generated/client'
import { GoalReportValuesNode } from './GoalReportValues'

interface Props {
  project_id: string
  subproject_id: string
  goal_id: string
  goalReport: GoalReport
  level?: number
}

export const GoalReportNode = memo(
  ({ project_id, subproject_id, goal_id, goalReport, level = 8 }: Props) => {
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
      urlPath[5] === goal_id &&
      urlPath[6] === 'reports' &&
      urlPath[7] === goalReport.goal_report_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${goalReport.goal_report_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, goalReport.goal_report_id, searchParams])

    return (
      <>
        <Node
          node={goalReport}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${goalReport.goal_report_id}`}
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
  },
)
