import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createGoalReportValue } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/'

export const GoalReportValues = memo(() => {
  const { goalReportId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()
  const res = useLiveIncrementalQuery(
    `SELECT goal_report_value_id, label FROM goal_report_values WHERE goal_report_id = $1 ORDER BY label`,
    [goalReportId],
    'goal_report_value_id',
  )
  const isLoading = res === undefined
  const goalReportValues = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createGoalReportValue({
      db,
      goalReportId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.goal_report_value_id,
      params: (prev) => ({
        ...prev,
        goalReportValueId: data.goal_report_value_id,
      }),
    })
  }, [db, goalReportId, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Goal Report Values"
        nameSingular="Goal Report Value"
        tableName="goal_report_values"
        isFiltered={false}
        countFiltered={goalReportValues.length}
        isLoading={isLoading}
        addRow={add}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {goalReportValues.map(({ goal_report_value_id, label }) => (
              <Row
                key={goal_report_value_id}
                label={label ?? goal_report_value_id}
                to={goal_report_value_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
