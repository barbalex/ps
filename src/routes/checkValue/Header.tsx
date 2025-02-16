import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheckValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { check_id, check_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const checkValue = createCheckValue()
    const columns = Object.keys(checkValue).join(',')
    const values = Object.values(checkValue)
      .map((_, i) => `$${i + 1}`)
      .join(',')
    await db.query(
      `INSERT INTO check_values (${columns}) VALUES (${values}, check_id)`,
      [...Object.values(checkValue), check_id],
    )
    navigate({
      pathname: `../${checkValue.check_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, check_id, db, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query('DELETE FROM check_values WHERE check_value_id = $1', [
      check_value_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [check_value_id, db, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label ASC',
      [check_id],
    )
    const checkValues = res.rows
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const next = checkValues[(index + 1) % len]
    navigate({
      pathname: `../${next.check_value_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_value_id, db, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label ASC',
      [check_id],
    )
    const checkValues = res.rows
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === check_value_id,
    )
    const previous = checkValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.check_value_id}`,
      search: searchParams.toString(),
    })
  }, [check_id, check_value_id, db, navigate, searchParams])

  return (
    <FormHeader
      title="Check value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="check value"
    />
  )
})
