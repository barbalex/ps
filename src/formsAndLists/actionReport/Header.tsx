import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = ({ autoFocusRef, from }) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/report'
  const { projectId, actionId, actionReportId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

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
    const prevRes = await db.query(
      `SELECT * FROM action_reports WHERE action_report_id = $1`,
      [actionReportId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM action_reports WHERE action_report_id = $1`, [
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
  }

  const toNext = async () => {
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
      to: isForm
        ? `../../${next.action_report_id}/report`
        : `../${next.action_report_id}`,
      params: (prev) => ({ ...prev, actionReportId: next.action_report_id }),
    })
  }

  const toPrevious = async () => {
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
      to: isForm
        ? `../../${previous.action_report_id}/report`
        : `../${previous.action_report_id}`,
      params: (prev) => ({
        ...prev,
        actionReportId: previous.action_report_id,
      }),
    })
  }

  return (
    <FormHeader
      title="Action Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report value"
    />
  )
}
