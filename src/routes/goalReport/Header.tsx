import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createGoalReport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, goal_id, goal_report_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createGoalReport({ db, project_id, goal_id })
    const data = res?.rows?.[0]
    navigate({
      pathname: `../${data.goal_report_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, goal_id, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM goal_reports WHERE goal_report_id = $1`, [
      goal_report_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, goal_report_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT goal_report_id FROM goal_reports WHERE goal_id = $1 ORDER BY label ASC`,
      [goal_id],
    )
    const goalReports = res?.rows
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goal_report_id,
    )
    const next = goalReports[(index + 1) % len]
    navigate({
      pathname: `../${next.goal_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, goal_id, goal_report_id, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT goal_report_id FROM goal_reports WHERE goal_id = $1 ORDER BY label ASC`,
      [goal_id],
    )
    const goalReports = res?.rows
    const len = goalReports.length
    const index = goalReports.findIndex(
      (p) => p.goal_report_id === goal_report_id,
    )
    const previous = goalReports[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.goal_report_id}`,
      search: searchParams.toString(),
    })
  }, [db, goal_id, goal_report_id, navigate, searchParams])

  return (
    <FormHeader
      title="Goal Report"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report"
    />
  )
})
