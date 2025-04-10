import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/projects/$projectId_/reports/$projectReportId/'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, projectReportId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createProjectReport({ db, projectId })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.project_report_id}`,
      params: (prev) => ({
        ...prev,
        projectReportId: data.project_report_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM project_reports WHERE project_report_id = $1`, [
      projectReportId,
    ])
    navigate({ to: '..' })
  }, [db, navigate, projectReportId])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT project_report_id FROM project_reports WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.project_report_id === projectReportId)
    const next = rows[(index + 1) % len]
    navigate({
      to: `../${next.project_report_id}`,
      params: (prev) => ({
        ...prev,
        projectReportId: next.project_report_id,
      }),
    })
  }, [db, navigate, projectId, projectReportId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT project_report_id FROM project_reports WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.project_report_id === projectReportId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      to: `../${previous.project_report_id}`,
      params: (prev) => ({
        ...prev,
        projectReportId: previous.project_report_id,
      }),
    })
  }, [db, navigate, projectId, projectReportId])

  return (
    <FormHeader
      title="Project Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project report"
    />
  )
})
