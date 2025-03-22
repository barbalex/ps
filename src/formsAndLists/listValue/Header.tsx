import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createListValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from =
  '/data/_authLayout/projects/$projectId_/lists/$listId_/values/$listValueId/'

export const Header = memo(({ autoFocusRef }) => {
  const { listId, listValueId } = useParams({ from })
  const navigate = useNavigate()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createListValue({ db, listId })
    const listValue = res?.rows?.[0]
    navigate({
      to: `../${listValue.list_value_id}`,
      params: (prev) => ({ ...prev, listValueId: listValue.list_value_id }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, listId, navigate])

  const deleteRow = useCallback(async () => {
    db.query(`DELETE FROM list_values WHERE list_value_id = $1`, [listValueId])
    navigate({ to: '..' })
  }, [db, listValueId, navigate])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label`,
      [listId],
    )
    const listValues = res?.rows
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === listValueId)
    const next = listValues[(index + 1) % len]
    navigate({
      to: `../${next.list_value_id}`,
      params: (prev) => ({ ...prev, listValueId: next.list_value_id }),
    })
  }, [db, listId, listValueId, navigate])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label`,
      [listId],
    )
    const listValues = res?.rows
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === listValueId)
    const previous = listValues[(index + len - 1) % len]
    navigate({
      to: `../${previous.list_value_id}`,
      params: (prev) => ({ ...prev, listValueId: previous.list_value_id }),
    })
  }, [db, listId, listValueId, navigate])

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
