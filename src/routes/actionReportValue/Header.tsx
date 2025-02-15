import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { action_report_id, action_report_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const actionReportValue = createActionReportValue()
    const columns = Object.keys(actionReportValue).join(',')
    const values = Object.values(actionReportValue).map(
      (_, i) => `$${i + 1}`,
    ).join
    await db.query(
      `INSERT INTO action_report_values (${columns}) VALUES (${values})`,
      Object.values(actionReportValue),
    )
    navigate({
      pathname: `../${actionReportValue.action_report_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(
      `DELETE FROM action_report_values WHERE action_report_value_id = $1`,
      [action_report_value_id],
    )
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [action_report_value_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM action_report_values WHERE action_report_id = $1 ORDER BY label ASC`,
      [action_report_id],
    )
    const actionReportValues = res.rows
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === action_report_value_id,
    )
    const next = actionReportValues[(index + 1) % len]
    navigate({
      pathname: `../${next.action_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [action_report_id, action_report_value_id, db, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT * FROM action_report_values WHERE action_report_id = $1 ORDER BY label ASC`,
      [action_report_id],
    )
    const actionReportValues = res.rows
    const len = actionReportValues.length
    const index = actionReportValues.findIndex(
      (p) => p.action_report_value_id === action_report_value_id,
    )
    const previous = actionReportValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.action_report_value_id}`,
      search: searchParams.toString(),
    })
  }, [action_report_id, action_report_value_id, db, navigate, searchParams])

  return (
    <FormHeader
      title="Action Report Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="goal report value"
    />
  )
})
