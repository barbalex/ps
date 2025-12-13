import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createListValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/lists/$listId_/values/$listValueId/'

export const Header = ({ autoFocusRef }) => {
  const { listId, listValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createListValue({ db, listId })
    const listValue = res?.rows?.[0]
    navigate({
      to: `../${listValue.list_value_id}`,
      params: (prev) => ({ ...prev, listValueId: listValue.list_value_id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM list_values WHERE list_value_id = $1`, [listValueId])
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label`,
      [listId],
    )
    const listValues = res?.rows
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === listValueId)
    const next = listValues[(index + 1) % len]
    console.log('ListValue.Header.toNext', {
      listValues,
      len,
      index,
      next,
      listValueId,
    })
    navigate({
      to: `../${next.list_value_id}`,
      params: (prev) => ({ ...prev, listValueId: next.list_value_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT list_value_id FROM list_values WHERE list_id = $1 ORDER BY label`,
      [listId],
    )
    const listValues = res?.rows
    const len = listValues.length
    const index = listValues.findIndex((p) => p.list_value_id === listValueId)
    const previous = listValues[(index + len - 1) % len]
    console.log('ListValue.Header.toPrevious', {
      listValues,
      len,
      index,
      previous,
      listValueId,
    })
    navigate({
      to: `../${previous.list_value_id}`,
      params: (prev) => ({ ...prev, listValueId: previous.list_value_id }),
    })
  }

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
}
