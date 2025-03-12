import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProjectReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, project_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createProjectReport({ db, project_id })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.project_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM project_reports WHERE project_report_id = $1`, [
      project_report_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, navigate, project_report_id, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM project_reports WHERE project_id = $1 ORDER BY label`,
      [project_id],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.project_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, project_report_id, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM project_reports WHERE project_id = $1 ORDER BY label`,
      [project_id],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.project_report_id === project_report_id,
    )
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.project_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, project_report_id, searchParams])

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
