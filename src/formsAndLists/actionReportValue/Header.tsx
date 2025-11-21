import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ autoFocusRef, from }) => {
  const { actionReportId, actionReportValueId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = async () => {
    const res = await createActionReportValue({ db, actionReportId })
    const actionReportValue = res?.rows?.[0]
    navigate({
      to: `../${actionReportValue.action_report_value_id}`,
      params: (prev) => ({
        ...prev,
        actionReportValueId: actionReportValue.action_report_value_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(
      `DELETE FROM action_report_values WHERE action_report_value_id = $1`,
      [actionReportValueId],
    )
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT action_report_value_id FROM action_report_values WHERE action_report_id = $1 ORDER BY label`,
      [actionReportId],
    )
    const actionReportValues = res?.rows
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === actionReportValueId,
    )
    const next = actionReportValues[(index + 1) % len]
    navigate({
      to: `../${next.action_report_value_id}`,
      params: (prev) => ({
        ...prev,
        actionReportValueId: next.action_report_value_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT action_report_value_id FROM action_report_values WHERE action_report_id = $1 ORDER BY label`,
      [actionReportId],
    )
    const actionReportValues = res?.rows
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === actionReportValueId,
    )
    const previous = actionReportValues[(index + len - 1) % len]
    navigate({
      to: `../${previous.action_report_value_id}`,
      params: (prev) => ({
        ...prev,
        actionReportValueId: previous.action_report_value_id,
      }),
    })
  }

  return (
    <FormHeader
      title="Action Report Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report value"
    />
  )
}
