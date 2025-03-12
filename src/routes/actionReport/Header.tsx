import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, action_id, action_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createActionReport({
      db,
      project_id,
      action_id,
    })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.action_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [action_id, autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM action_reports WHERE action_report_id = $1`, [
      action_report_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [action_report_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT action_report_id FROM action_reports WHERE action_id = $1 ORDER BY label ASC`,
      [action_id],
    )
    const actionReports = res?.rows
    const len = actionReports.length
    const index = actionReports.findIndex(
      (p) => p.action_report_id === action_report_id,
    )
    const next = actionReports[(index + 1) % len]
    navigate({
      pathname: `../${next.action_report_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, action_report_id, db, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT action_report_id FROM action_reports WHERE action_id = $1 ORDER BY label ASC`,
      [action_id],
    )
    const actionReports = res?.rows
    const len = actionReports.length
    const index = actionReports.findIndex(
      (p) => p.action_report_id === action_report_id,
    )
    const previous = actionReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.action_report_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, action_report_id, db, navigate, searchParams])

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
