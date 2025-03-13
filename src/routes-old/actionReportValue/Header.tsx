import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionReportValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { action_report_id, action_report_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createActionReportValue({ db, action_report_id })
    const actionReportValue = res?.rows?.[0]
    navigate({
      pathname: `../${actionReportValue.action_report_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [action_report_id, autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(
      `DELETE FROM action_report_values WHERE action_report_value_id = $1`,
      [action_report_value_id],
    )
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [action_report_value_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT action_report_value_id FROM action_report_values WHERE action_report_id = $1 ORDER BY label`,
      [action_report_id],
    )
    const actionReportValues = res?.rows
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
      `SELECT action_report_value_id FROM action_report_values WHERE action_report_id = $1 ORDER BY label`,
      [action_report_id],
    )
    const actionReportValues = res?.rows
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
