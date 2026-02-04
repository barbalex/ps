import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createActionReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/report'
  const { projectId, actionId, actionReportId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM action_reports WHERE action_id = '${actionId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createActionReport({ projectId, actionId })
    if (!id) return
    navigate({
      to: isForm ? `../../${id}/report` : `../${id}/report`,
      params: (prev) => ({ ...prev, actionReportId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM action_reports WHERE action_report_id = $1`,
        [actionReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM action_reports WHERE action_report_id = $1`, [
        actionReportId,
      ])
      addOperation({
        table: 'action_reports',
        rowIdName: 'action_report_id',
        rowId: actionReportId,
        operation: 'delete',
        prev,
      })
      navigate({ to: isForm ? `../..` : `..` })
    } catch (error) {
      console.error('Error deleting action report:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT action_report_id FROM action_reports WHERE action_id = $1 ORDER BY label`,
        [actionId],
      )
      const actionReports = res?.rows
      const len = actionReports.length
      const index = actionReports.findIndex(
        (p) => p.action_report_id === actionReportId,
      )
      const next = actionReports[(index + 1) % len]
      navigate({
        to:
          isForm ?
            `../../${next.action_report_id}/report`
          : `../${next.action_report_id}`,
        params: (prev) => ({ ...prev, actionReportId: next.action_report_id }),
      })
    } catch (error) {
      console.error('Error navigating to next action report:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT action_report_id FROM action_reports WHERE action_id = $1 ORDER BY label`,
        [actionId],
      )
      const actionReports = res?.rows
      const len = actionReports.length
      const index = actionReports.findIndex(
        (p) => p.action_report_id === actionReportId,
      )
      const previous = actionReports[(index + len - 1) % len]
      navigate({
        to:
          isForm ?
            `../../${previous.action_report_id}/report`
          : `../${previous.action_report_id}`,
        params: (prev) => ({
          ...prev,
          actionReportId: previous.action_report_id,
        }),
      })
    } catch (error) {
      console.error('Error navigating to previous action report:', error)
    }
  }

  return (
    <FormHeader
      title="Action Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}      tableName="goal report value"
    />
  )
}
