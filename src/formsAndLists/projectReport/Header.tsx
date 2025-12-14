import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createProjectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/reports/$projectReportId/'

export const Header = ({ autoFocusRef }) => {
  const { projectId, projectReportId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
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
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM project_reports WHERE project_report_id = $1`,
      [projectReportId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM project_reports WHERE project_report_id = $1`, [
      projectReportId,
    ])
    addOperation({
      table: 'project_reports',
      rowIdName: 'project_report_id',
      rowId: projectReportId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
