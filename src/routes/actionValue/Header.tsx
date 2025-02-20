import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createActionValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { action_id, action_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createActionValue({ db, action_id })
    const actionValue = res.rows[0]
    navigate({
      pathname: `../${actionValue.action_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [action_id, autoFocusRef, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    db.query('DELETE FROM action_values WHERE action_value_id = $1', [
      action_value_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [action_value_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT * FROM action_values WHERE action_id = $1 ORDER BY label ASC',
      [action_id],
    )
    const actionValues = res.rows
    const len = actionValues.length
    const index = actionValues.findIndex(
      (p) => p.action_value_id === action_value_id,
    )
    const next = actionValues[(index + 1) % len]
    navigate({
      pathname: `../${next.action_value_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, action_value_id, db, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT * FROM action_values WHERE action_id = $1 ORDER BY label ASC',
      [action_id],
    )
    const actionValues = res.rows
    const len = actionValues.length
    const index = actionValues.findIndex(
      (p) => p.action_value_id === action_value_id,
    )
    const previous = actionValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.action_value_id}`,
      search: searchParams.toString(),
    })
  }, [action_id, action_value_id, db, navigate, searchParams])

  return (
    <FormHeader
      title="Action Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="action value"
    />
  )
})
