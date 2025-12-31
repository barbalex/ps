import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createGoalReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from =
  '/data/projects/$projectId_/subprojects/$subprojectId_/goals/$goalId_/reports/$goalReportId_/values/$goalReportValueId/'

export const Header = ({ autoFocusRef }) => {
  const { goalReportId, goalReportValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createGoalReportValue({ goalReportId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        goalReportValueId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      'select * from goal_report_values where goal_report_value_id = $1',
      [goalReportValueId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query('delete from goal_report_values where goal_report_value_id = $1', [
      goalReportValueId,
    ])
    addOperation({
      table: 'goal_report_values',
      rowIdName: 'goal_report_value_id',
      rowId: goalReportValueId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
