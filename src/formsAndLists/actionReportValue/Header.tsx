import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createActionReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { actionReportId, actionReportValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createActionReportValue({ actionReportId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        actionReportValueId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM action_report_values WHERE action_report_value_id = $1`,
        [actionReportValueId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(
        `DELETE FROM action_report_values WHERE action_report_value_id = $1`,
        [actionReportValueId],
      )
      addOperation({
        table: 'action_report_values',
        rowIdName: 'action_report_value_id',
        rowId: actionReportValueId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting action report value:', error)
    }
  }

  const toNext = async () => {
    try {
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
    } catch (error) {
      console.error('Error navigating to next action report value:', error)
    }
  }

  const toPrevious = async () => {
    try {
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
    } catch (error) {
      console.error('Error navigating to previous action report value:', error)
    }
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
