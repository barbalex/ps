import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoalReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/$goalReportValueId/'

export const Header = memo(({ autoFocusRef }) => {
  const { goalReportId, goalReportValueId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createGoalReportValue({ db, goalReportId })
    const goalReportValue = res?.rows?.[0]
    navigate({
      to: `../${goalReportValue.goal_report_value_id}`,
      params: (prev) => ({
        ...prev,
        goalReportValueId: goalReportValue.goal_report_value_id,
      }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, goalReportId, navigate])

  const deleteRow = useCallback(async () => {
    db.query('delete from goal_report_values where goal_report_value_id = $1', [
      goalReportValueId,
    ])
    navigate({ to: '..' })
  }, [db, goalReportValueId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'select goal_report_value_id from goal_report_values where goal_report_id = $1 order by label',
      [goalReportId],
    )
    const goalReportValues = res?.rows
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goalReportValueId,
    )
    const next = goalReportValues[(index + 1) % len]
    navigate({
      to: `../${next.goal_report_value_id}`,
      params: (prev) => ({
        ...prev,
        goalReportValueId: next.goal_report_value_id,
      }),
    })
  }, [db, goalReportId, goalReportValueId, navigate])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'select goal_report_value_id from goal_report_values where goal_report_id = $1 order by label',
      [goalReportId],
    )
    const goalReportValues = res?.rows
    const len = goalReportValues.length
    const index = goalReportValues.findIndex(
      (p) => p.goal_report_value_id === goalReportValueId,
    )
    const previous = goalReportValues[(index + len - 1) % len]
    navigate({
      to: `../${previous.goal_report_value_id}`,
      params: (prev) => ({
        ...prev,
        goalReportValueId: previous.goal_report_value_id,
      }),
    })
  }, [db, goalReportId, goalReportValueId, navigate])

  return (
    <FormHeader
      title="Goal Report Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report value"
    />
  )
})
