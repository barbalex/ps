import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createSubprojectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { projectId, subprojectId, subprojectReportId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createSubprojectReport({ db, projectId, subprojectId })
    const data = res?.rows?.[0]
    navigate({
      to: `../${data.subproject_report_id}`,
      params: (prev) => ({
        ...prev,
        subprojectReportId: data.subproject_report_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      `SELECT * FROM subproject_reports WHERE subproject_report_id = $1`,
      [subprojectReportId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    db.query(`DELETE FROM subproject_reports WHERE subproject_report_id = $1`, [
      subprojectReportId,
    ])
    addOperation({
      table: 'subproject_reports',
      rowIdName: 'subproject_report_id',
      rowId: subprojectReportId,
      operation: 'delete',
      prev,
    })
    navigate({ to: `..` })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT subproject_report_id FROM subproject_reports WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const subprojectReports = res?.rows
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subprojectReportId,
    )
    const next = subprojectReports[(index + 1) % len]
    navigate({
      to: `../${next.subproject_report_id}`,
      params: (prev) => ({
        ...prev,
        subprojectReportId: next.subproject_report_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT subproject_report_id FROM subproject_reports WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const subprojectReports = res?.rows
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subprojectReportId,
    )
    const previous = subprojectReports[(index + len - 1) % len]
    navigate({
      to: `../${previous.subproject_report_id}`,
      params: (prev) => ({
        ...prev,
        subprojectReportId: previous.subproject_report_id,
      }),
    })
  }

  return (
    <FormHeader
      title="Subproject Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="subproject report"
    />
  )
}
