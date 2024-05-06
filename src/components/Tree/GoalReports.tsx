import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { GoalReportNode } from './GoalReport.tsx'

interface Props {
  project_id: string
  subproject_id: string
  goal_id: string
  level?: number
}

export const GoalReportsNode = memo(
  ({ project_id, subproject_id, goal_id, level = 7 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { db } = useElectric()!
    const { results: goalReports = [] } = useLiveQuery(
      db.goal_reports.liveMany({
        where: { goal_id },
        orderBy: { label: 'asc' },
      }),
    )

    const goalReportsNode = useMemo(
      () => ({ label: `Goal Reports (${goalReports.length})` }),
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

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/reports`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={goalReportsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={goalReports.length}
          to={`${baseUrl}/reports`}
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
  },
)
