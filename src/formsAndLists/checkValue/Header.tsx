import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { createCheckValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { checkId, checkValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const id = await createCheckValue({ checkId })
    if (!id) return
    navigate({
      to: `../${id}`,
      params: (prev) => ({ ...prev, checkValueId: id }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    const prevRes = await db.query(
      'SELECT * FROM check_values WHERE check_value_id = $1',
      [checkValueId],
    )
    const prev = prevRes?.rows?.[0] ?? {}
    await db.query('DELETE FROM check_values WHERE check_value_id = $1', [
      checkValueId,
    ])
    addOperation({
      table: 'check_values',
      rowIdName: 'check_value_id',
      rowId: checkValueId,
      operation: 'delete',
      prev,
    })
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label',
      [checkId],
    )
    const checkValues = res?.rows
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === checkValueId,
    )
    const next = checkValues[(index + 1) % len]
    navigate({
      to: `../${next.check_value_id}`,
      params: (prev) => ({ ...prev, checkValueId: next.check_value_id }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label',
      [checkId],
    )
    const checkValues = res?.rows
    const len = checkValues.length
    const index = checkValues.findIndex(
      (p) => p.check_value_id === checkValueId,
    )
    const previous = checkValues[(index + len - 1) % len]
    navigate({
      to: `../${previous.check_value_id}`,
      params: (prev) => ({ ...prev, checkValueId: previous.check_value_id }),
    })
  }

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
}
