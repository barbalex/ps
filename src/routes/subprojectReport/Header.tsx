import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, subproject_id, subproject_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createSubprojectReport({
      db,
      project_id,
      subproject_id,
    })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.subproject_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams, subproject_id])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM subproject_reports WHERE subproject_report_id = $1`, [
      subproject_report_id,
    ])
    navigate({ pathname: `..`, search: searchParams.toString() })
  }, [db, navigate, searchParams, subproject_report_id])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT subproject_report_id FROM subproject_reports WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const subprojectReports = res?.rows
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subproject_report_id,
    )
    const next = subprojectReports[(index + 1) % len]
    navigate({
      pathname: `../${next.subproject_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams, subproject_report_id])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT subproject_report_id FROM subproject_reports WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const subprojectReports = res?.rows
    const len = subprojectReports.length
    const index = subprojectReports.findIndex(
      (p) => p.subproject_report_id === subproject_report_id,
    )
    const previous = subprojectReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.subproject_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams, subproject_report_id])

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
})
