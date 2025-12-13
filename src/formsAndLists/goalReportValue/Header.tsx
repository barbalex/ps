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
    const res = await createGoalReportValue({ db, goalReportId })
    const goalReportValue = res?.rows?.[0]
    navigate({
      to: `../${goalReportValue.goal_report_value_id}`,
      params: (prev) => ({
        ...prev,
        goalReportValueId: goalReportValue.goal_report_value_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query('delete from goal_report_values where goal_report_value_id = $1', [
      goalReportValueId,
    ])
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
