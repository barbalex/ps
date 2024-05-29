import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { GoalReports as GoalReport } from '../../../generated/client/index.ts'
import { GoalReportValuesNode } from './GoalReportValues.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

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
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'goals' &&
      urlPath[6] === goal_id &&
      urlPath[7] === 'reports' &&
      urlPath[8] === goalReport.goal_report_id
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'goals',
        goal_id,
        'reports',
      ],
      [goal_id, project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, goalReport.goal_report_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${goalReport.goal_report_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      goalReport.goal_report_id,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <>
        <Node
          node={goalReport}
          id={goalReport.goal_report_id}
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
