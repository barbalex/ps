import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { GoalReportValueNode } from './GoalReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  goal_id: string
  goal_report_id: string
  level?: number
}

export const GoalReportValuesNode = memo(
  ({
    project_id,
    subproject_id,
    goal_id,
    goal_report_id,
    level = 9,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: goalReportValues = [] } = useLiveQuery(
      db.goal_report_values.liveMany({
        where: { goal_report_id },
        orderBy: { label: 'asc' },
      }),
    )

    const goalReportValuesNode = useMemo(
      () => ({ label: `Values (${goalReportValues.length})` }),
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

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/goals/${goal_id}/reports/${goal_report_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/values`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={goalReportValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={goalReportValues.length}
          to={`${baseUrl}/values`}
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
  },
)
