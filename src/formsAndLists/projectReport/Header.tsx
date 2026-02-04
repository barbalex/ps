import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
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

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM project_reports WHERE project_id = '${projectId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

  const addRow = async () => {
    const id = await createProjectReport({ projectId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({
        ...prev,
        projectReportId: id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM project_reports WHERE project_report_id = $1`,
        [projectReportId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM project_reports WHERE project_report_id = $1`, [
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
    } catch (error) {
      console.error('Error deleting project report:', error)
      // Could add a toast notification here
    }
  }

  const toNext = async () => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title="Project Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="project report"
    />
  )
}
