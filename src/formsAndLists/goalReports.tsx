import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createGoalReport } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/'

export const GoalReports = memo(() => {
  const { projectId, goalId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT goal_report_id, label FROM goal_reports WHERE goal_id = $1 ORDER BY label`,
    [goalId],
    'goal_report_id',
  )
  const isLoading = res === undefined
  const goals = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createGoalReport({
      db,
      projectId,
      goalId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.goal_report_id,
      params: (prev) => ({ ...prev, goalReportId: data.goal_report_id }),
    })
  }, [db, goalId, navigate, projectId])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Goal Reports"
        nameSingular="Goal Report"
        tableName="goal_reports"
        isFiltered={false}
        countFiltered={goals.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {goals.map(({ goal_report_id, label }) => (
              <Row
                key={goal_report_id}
                label={label ?? goal_report_id}
                to={goal_report_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
