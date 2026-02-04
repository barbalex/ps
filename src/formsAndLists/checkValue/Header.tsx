import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createCheckValue } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

export const Header = ({ autoFocusRef, from }) => {
  const { checkId, checkValueId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current checkValueId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const checkValueIdRef = useRef(checkValueId)
  useEffect(() => {
    checkValueIdRef.current = checkValueId
  }, [checkValueId])

  const countRes = useLiveQuery(
    `SELECT COUNT(*) as count FROM check_values WHERE check_id = '${checkId}'`,
  )
  const rowCount = countRes?.rows?.[0]?.count ?? 2

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
    try {
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
    } catch (error) {
      console.error('Error deleting check value:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label',
        [checkId],
      )
      const checkValues = res?.rows
      const len = checkValues.length
      const index = checkValues.findIndex(
        (p) => p.check_value_id === checkValueIdRef.current,
      )
      const next = checkValues[(index + 1) % len]
      navigate({
        to: `../${next.check_value_id}`,
        params: (prev) => ({ ...prev, checkValueId: next.check_value_id }),
      })
    } catch (error) {
      console.error('Error navigating to next check value:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        'SELECT check_value_id FROM check_values WHERE check_id = $1 ORDER BY label',
        [checkId],
      )
      const checkValues = res?.rows
      const len = checkValues.length
      const index = checkValues.findIndex(
        (p) => p.check_value_id === checkValueIdRef.current,
      )
      const previous = checkValues[(index + len - 1) % len]
      navigate({
        to: `../${previous.check_value_id}`,
        params: (prev) => ({ ...prev, checkValueId: previous.check_value_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous check value:', error)
    }
  }

  return (
    <FormHeader
      title="Check value"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      toNextDisabled={rowCount <= 1}
      toPreviousDisabled={rowCount <= 1}
      tableName="check value"
    />
  )
}
