import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = 'TODO:'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, actionId, actionReportId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createActionReport({
      db,
      project_id: projectId,
      action_id: actionId,
    })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.action_report_id}`,
      params: (prev) => ({ ...prev, actionReportId: data.action_report_id }),
    })
    autoFocusRef.current?.focus()
  }, [actionId, autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM action_reports WHERE action_report_id = $1`, [
      actionReportId,
    ])
    navigate({ to: '..' })
  }, [actionReportId, db, navigate])

  const toNext = useCallback(async () => {
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
      to: `../${next.action_report_id}`,
      params: (prev) => ({ ...prev, actionReportId: next.action_report_id }),
    })
  }, [actionId, actionReportId, db, navigate])

  const toPrevious = useCallback(async () => {
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
      to: `../${previous.action_report_id}`,
      params: (prev) => ({
        ...prev,
        actionReportId: previous.action_report_id,
      }),
    })
  }, [actionId, actionReportId, db, navigate])

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
})
