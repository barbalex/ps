import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef, from }) => {
  const isForm =
    from ===
      '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/actions/$actionId_/reports/$actionReportId_/report' ||
    from ===
      '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/actions/$actionId_/reports/$actionReportId_/report'
  const { projectId, actionId, actionReportId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createActionReport({ db, projectId, actionId })
    const data = res?.rows?.[0]
    navigate({
      to:
        isForm ?
          `../../${data.action_report_id}/report`
        : `../${data.action_report_id}/report`,
      params: (prev) => ({ ...prev, actionReportId: data.action_report_id }),
    })
    autoFocusRef?.current?.focus()
  }, [actionId, autoFocusRef, db, isForm, navigate, projectId])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM action_reports WHERE action_report_id = $1`, [
      actionReportId,
    ])
    navigate({ to: isForm ? `../..` : `..` })
  }, [actionReportId, db, isForm, navigate])

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
      to:
        isForm ?
          `../../${next.action_report_id}/report`
        : `../${next.action_report_id}`,
      params: (prev) => ({ ...prev, actionReportId: next.action_report_id }),
    })
  }, [actionId, actionReportId, db, isForm, navigate])

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
      to:
        isForm ?
          `../../${previous.action_report_id}/report`
        : `../${previous.action_report_id}`,
      params: (prev) => ({
        ...prev,
        actionReportId: previous.action_report_id,
      }),
    })
  }, [actionId, actionReportId, db, isForm, navigate])

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
