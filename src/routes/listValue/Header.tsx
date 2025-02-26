import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import { createListValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { list_id, list_value_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createListValue({ db, list_id })
    const listValue = res?.rows?.[0]
    navigate({
      pathname: `../${listValue.list_value_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, list_id, navigate, searchParams])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM list_values WHERE list_value_id = $1`, [
      list_value_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, list_value_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label ASC`,
      [list_id],
    )
    const listValues = res?.rows
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === list_value_id)
    const next = listValues[(index + 1) % len]
    navigate({
      pathname: `../${next.list_value_id}`,
      search: searchParams.toString(),
    })
  }, [db, list_id, list_value_id, navigate, searchParams])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label ASC`,
      [list_id],
    )
    const listValues = res?.rows
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === list_value_id)
    const previous = listValues[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.list_value_id}`,
      search: searchParams.toString(),
    })
  }, [db, list_id, list_value_id, navigate, searchParams])

  return (
    <FormHeader
      title="List Value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="list value"
    />
  )
})
